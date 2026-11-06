import { FluidField } from './fluid.ts';
import {
	simulationSize,
	type BackgroundCommand,
	type BackgroundEnvironment,
	type BackgroundEvent,
	type BackgroundSize
} from './messages.ts';
import { createRenderer } from './renderer.ts';
import { SolidScene } from './scene.ts';
import type { Obstacle, Renderer } from './types.ts';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const FRAME_INTERVAL_MS = 16.6667;
const FRAME_CPU_BUDGET_MS = 50;
const PERFORMANCE_WARMUP_MS = 1000;
const PERFORMANCE_WINDOW_MS = 2000;
const PERFORMANCE_MIN_FRAMES = 8;

type Emit = (event: BackgroundEvent, transfer?: Transferable[]) => void;
type ResizeCommand = Extract<BackgroundCommand, { type: 'resize' }>;
type PointerCommand = Extract<BackgroundCommand, { type: 'pointer' }>;
type Cursor = Extract<BackgroundEvent, { type: 'state' }>['cursor'];
type WorkerTimers = {
	setTimeout(callback: () => void, delay: number): number;
	clearTimeout(timer: number): void;
};

const timers = globalThis as unknown as WorkerTimers;

export class BackgroundEngine {
	private readonly fluid = new FluidField();
	private readonly scene = new SolidScene();
	private canvas: OffscreenCanvas | null = null;
	private renderer: Renderer | null = null;
	private size: BackgroundSize = { width: 0, height: 0, dpr: 1 };
	private environment: BackgroundEnvironment = { dark: false, reduced: false, visible: false };
	private softwareFallback = false;
	private performanceFallback = false;
	private staticComposition = false;
	private obstacles: Obstacle[] | null = null;
	private initialized = false;
	private disposed = false;
	private timer: number | null = null;
	private lastTime = 0;
	private time = 0;
	private sampledFrames = 0;
	private sampledCpuTime = 0;
	private sampleWindowStart = 0;
	private initialCheckComplete = false;
	private pendingFrame = false;
	private pendingResize: ResizeCommand | null = null;
	private pendingObstacles: Obstacle[] | null = null;
	private dirty = false;
	private pointerDown = false;
	private previousX = 0;
	private previousY = 0;
	private hasPrevious = false;
	private cursor: Cursor = 'default';
	private sentInteractive: boolean | null = null;
	private sentCursor: Cursor = 'default';

	constructor(private readonly emit: Emit) {}

	private get still(): boolean {
		return this.softwareFallback || this.performanceFallback || this.environment.reduced;
	}

	private get interactive(): boolean {
		return this.initialized && !this.disposed && !this.still && this.environment.visible;
	}

	handle(command: BackgroundCommand): void {
		if (this.disposed) return;
		try {
			if (command.type === 'destroy') {
				this.dispose();
				return;
			}
			if (command.type === 'initialize') {
				if (this.initialized) throw new Error('Background worker is already initialized');
				this.initialize(command);
				return;
			}
			if (!this.initialized) throw new Error('Background worker has not been initialized');
			switch (command.type) {
				case 'resize':
					this.endDrag();
					if (this.pendingFrame) {
						// Only the latest size and its content geometry matter after presentation.
						this.pendingResize = command;
						this.pendingObstacles = null;
					} else {
						this.resize(command.size, command.obstacles);
						// Animated resizes join the next physics tick instead of canceling its timer
						if (this.still) this.present();
						this.schedule();
					}
					break;
				case 'obstacles':
					if (this.pendingResize) this.pendingResize.obstacles = command.obstacles;
					else if (this.pendingFrame) this.pendingObstacles = command.obstacles;
					else {
						this.updateObstacles(command.obstacles);
						if (this.still) this.present();
						this.schedule();
					}
					break;
				case 'environment':
					this.updateEnvironment(command.environment);
					break;
				case 'pointer':
					this.pointer(command);
					break;
				case 'frame-consumed':
					if (!this.pendingFrame) break;
					this.pendingFrame = false;
					if (this.pendingResize) {
						const resize = this.pendingResize;
						this.pendingResize = null;
						this.resize(resize.size, resize.obstacles);
					} else if (this.pendingObstacles) {
						const obstacles = this.pendingObstacles;
						this.pendingObstacles = null;
						this.updateObstacles(obstacles);
					}
					if (this.still) this.present();
					this.schedule();
					break;
				default:
					throw new Error('Unknown background worker command');
			}
		} catch (error) {
			this.fail(error);
		}
	}

	private initialize(command: Extract<BackgroundCommand, { type: 'initialize' }>): void {
		this.environment = command.environment;
		const result = createRenderer(new OffscreenCanvas(1, 1));
		this.canvas = result.canvas;
		this.renderer = result.renderer;
		this.softwareFallback = !result.animated;
		this.initialized = true;
		this.staticComposition = this.still;
		this.resize(command.size, command.obstacles);
		this.syncPlayback();
	}

	private resize(size: BackgroundSize, obstacles: Obstacle[]): void {
		if (!this.canvas || !this.renderer) return;
		const changed =
			size.width !== this.size.width ||
			size.height !== this.size.height ||
			size.dpr !== this.size.dpr;
		const dimensions = simulationSize(size);
		const resized =
			dimensions.width !== this.fluid.width || dimensions.height !== this.fluid.height;
		if (changed) {
			this.resetPerformanceSampling();
			this.size = size;
			this.canvas.width = Math.max(1, Math.round(size.width * size.dpr));
			this.canvas.height = Math.max(1, Math.round(size.height * size.dpr));
			// Higher-resolution pixels retain crisp, non-AA edges on the smaller models.
			if (resized) {
				this.fluid.resize(dimensions.width, dimensions.height, this.time);
				// SolidScene rescales existing positions and velocities without resetting poses.
				this.scene.resize(dimensions.width, dimensions.height, this.time);
			}
			this.renderer.resize(dimensions.width, dimensions.height);
			this.dirty = true;
		}
		const contentChanged = this.setObstacles(obstacles);
		if (resized || contentChanged) {
			if (this.still) this.scene.renderPreset();
			else this.scene.update(0, this.time);
			this.dirty = true;
		}
	}

	private setObstacles(obstacles: Obstacle[]): boolean {
		if (
			this.obstacles?.length === obstacles.length &&
			obstacles.every((obstacle, i) => {
				const previous = this.obstacles![i];
				return (
					obstacle.minX === previous.minX &&
					obstacle.maxX === previous.maxX &&
					obstacle.minY === previous.minY &&
					obstacle.maxY === previous.maxY
				);
			})
		)
			return false;
		this.obstacles = obstacles;
		this.scene.setObstacles(obstacles);
		return true;
	}

	private updateObstacles(obstacles: Obstacle[]): void {
		if (!this.setObstacles(obstacles)) return;
		if (this.still) this.scene.renderPreset();
		else this.scene.update(0, this.time);
		this.dirty = true;
	}

	private updateEnvironment(environment: BackgroundEnvironment): void {
		const playbackChanged =
			environment.reduced !== this.environment.reduced ||
			environment.visible !== this.environment.visible;
		if (environment.dark !== this.environment.dark) this.dirty = true;
		this.environment = environment;
		if (playbackChanged) this.syncPlayback();
		else {
			this.present();
			this.schedule();
		}
	}

	private syncPlayback(): void {
		this.cancelTimer();
		this.lastTime = 0;
		this.resetPerformanceSampling();
		if (this.still) {
			this.endDrag();
			if (!this.staticComposition) {
				this.staticComposition = true;
				this.time = 0;
				this.fluid.resize(this.fluid.width, this.fluid.height, this.time);
				this.scene.renderPreset();
				this.dirty = true;
			}
		} else {
			this.staticComposition = false;
			if (!this.environment.visible) this.endDrag();
		}
		this.publishState();
		this.present();
		this.schedule();
	}

	private present(): void {
		if (
			this.disposed ||
			!this.dirty ||
			this.pendingFrame ||
			!this.environment.visible ||
			!this.canvas ||
			!this.renderer
		)
			return;
		this.cancelTimer();
		// Transferring a bitmap clears the canvas, so every presentation renders anew.
		this.renderer.render(this.fluid, this.scene, this.time, this.size.dpr, this.environment.dark);
		const bitmap = this.canvas.transferToImageBitmap();
		try {
			this.pendingFrame = true;
			this.emit(
				{
					type: 'frame',
					bitmap,
					gridWidth: this.fluid.width,
					gridHeight: this.fluid.height
				},
				[bitmap]
			);
			this.dirty = false;
		} catch (error) {
			this.pendingFrame = false;
			bitmap.close();
			throw error;
		}
		if (this.still) this.finishInitialCheck();
	}

	private schedule(): void {
		if (!this.interactive || this.pendingFrame || this.timer !== null) return;
		const delay = this.lastTime
			? Math.max(0, FRAME_INTERVAL_MS - (performance.now() - this.lastTime))
			: 0;
		this.timer = timers.setTimeout(this.tick, delay);
	}

	private cancelTimer(): void {
		if (this.timer === null) return;
		timers.clearTimeout(this.timer);
		this.timer = null;
	}

	private tick = (): void => {
		this.timer = null;
		if (!this.interactive || this.pendingFrame) return;
		try {
			const started = performance.now();
			const elapsed = this.lastTime
				? Math.min((started - this.lastTime) / FRAME_INTERVAL_MS, 1.7)
				: 1;
			this.lastTime = started;
			this.time += elapsed / 60;
			this.scene.update(elapsed, this.time);
			this.fluid.step(elapsed, this.time, this.scene);
			this.dirty = true;
			this.present();
			const cpuTime = performance.now() - started;
			if (started >= this.sampleWindowStart) {
				this.sampledCpuTime += cpuTime;
				this.sampledFrames++;
				if (
					started - this.sampleWindowStart >= PERFORMANCE_WINDOW_MS &&
					this.sampledFrames >= PERFORMANCE_MIN_FRAMES
				) {
					if (this.sampledCpuTime / this.sampledFrames > FRAME_CPU_BUDGET_MS) {
						this.performanceFallback = true;
						this.syncPlayback();
						return;
					}
					this.sampledFrames = 0;
					this.sampledCpuTime = 0;
					this.sampleWindowStart = started;
					this.finishInitialCheck();
				}
			}
			this.schedule();
		} catch (error) {
			this.fail(error);
		}
	};

	private resetPerformanceSampling(): void {
		this.sampledFrames = 0;
		this.sampledCpuTime = 0;
		this.sampleWindowStart = performance.now() + PERFORMANCE_WARMUP_MS;
	}

	private finishInitialCheck(): void {
		if (this.initialCheckComplete || this.dirty) return;
		this.initialCheckComplete = true;
		this.emit({ type: 'ready' });
	}

	private pointer(command: PointerCommand): void {
		if (!this.interactive || this.pendingResize) return;
		const x = clamp(command.x, 0, this.fluid.width);
		const y = clamp(command.y, 0, this.fluid.height);
		switch (command.action) {
			case 'move':
				if (this.scene.drag.body) {
					this.scene.moveDrag(x, y);
					return;
				}
				this.cursor = this.scene.pickBody(x, y) ? 'grab' : 'default';
				this.publishState();
				this.interact(x, y, command.pressed);
				break;
			case 'down':
				if (this.pointerDown) return;
				this.pointerDown = true;
				this.hasPrevious = false;
				if (this.scene.beginDrag(x, y)) this.cursor = 'grabbing';
				else {
					this.cursor = 'default';
					this.interact(x, y, command.pressed);
				}
				this.publishState();
				break;
			case 'up':
				this.endDrag();
				break;
			case 'leave':
				if (!this.scene.drag.body) this.hasPrevious = false;
				break;
		}
	}

	private interact(pointerX: number, pointerY: number, pressed: boolean): void {
		const x = clamp(pointerX, 1, this.fluid.width - 2);
		const y = clamp(pointerY, 1, this.fluid.height - 2);
		if (this.hasPrevious)
			this.fluid.interact(x, y, x - this.previousX, y - this.previousY, pressed);
		this.previousX = x;
		this.previousY = y;
		this.hasPrevious = true;
	}

	private endDrag(): void {
		this.pointerDown = false;
		this.scene.endDrag();
		this.hasPrevious = false;
		this.cursor = 'default';
		this.publishState();
	}

	private publishState(): void {
		const interactive = this.interactive;
		const cursor = interactive ? this.cursor : 'default';
		if (interactive === this.sentInteractive && cursor === this.sentCursor) return;
		this.sentInteractive = interactive;
		this.sentCursor = cursor;
		this.emit({ type: 'state', interactive, cursor });
	}

	fail(error: unknown): void {
		if (this.disposed) return;
		try {
			this.dispose();
		} finally {
			this.emit({
				type: 'error',
				message: error instanceof Error ? error.message : 'Background worker failed'
			});
		}
	}

	private dispose(): void {
		this.disposed = true;
		this.cancelTimer();
		this.pendingFrame = false;
		this.pendingResize = null;
		this.pendingObstacles = null;
		this.dirty = false;
		this.endDrag();
		try {
			this.renderer?.destroy();
		} finally {
			this.renderer = null;
			this.canvas = null;
		}
	}
}
