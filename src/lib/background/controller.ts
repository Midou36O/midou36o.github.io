import {
	simulationSize,
	type BackgroundCommand,
	type BackgroundEnvironment,
	type BackgroundEvent,
	type BackgroundSize
} from './messages.ts';
import type { Obstacle } from './types.ts';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const PROTECTED_CONTENT = 'a, button, h1, h2, h3, h4, h5, h6, p, pre, blockquote, table, img';

type StaticBackground = {
	readonly canvas: HTMLCanvasElement;
	update(size: BackgroundSize, obstacles: Obstacle[], dark: boolean): void;
	destroy(): void;
};
type PointerCommand = Extract<BackgroundCommand, { type: 'pointer' }>;

export class BackgroundController {
	private readonly listeners = new AbortController();
	private readonly observer: ResizeObserver;
	private readonly contentObserver: ResizeObserver;
	private readonly mutations: MutationObserver;
	private readonly darkMode = window.matchMedia('(prefers-color-scheme: dark)');
	private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	private environment: BackgroundEnvironment = {
		dark: this.darkMode.matches,
		reduced: this.reducedMotion.matches,
		visible: !document.hidden
	};
	private protectedElements: Element[] = [];
	private obstacles: Obstacle[] = [];
	private size: BackgroundSize = { width: 0, height: 0, dpr: 1 };
	private grid = { width: 0, height: 0 };
	private worker: Worker | null = null;
	private bitmapContext: ImageBitmapRenderingContext | null = null;
	private drawingContext: CanvasRenderingContext2D | null = null;
	private bitmap: ImageBitmap | null = null;
	private fallback: StaticBackground | null = null;
	private fallbackRequested = false;
	private fallbackTask: number | null = null;
	private fallbackTaskIsIdle = false;
	private workerInteractive = false;
	private interactive = false;
	private cursor: 'default' | 'grab' | 'grabbing' = 'default';
	private pointerId: number | null = null;
	private pointerX = 0;
	private pointerY = 0;
	private pendingMove: PointerCommand | null = null;
	private moveAnimation = 0;
	private initialCheckComplete = false;
	private disposed = false;

	constructor(
		private canvas: HTMLCanvasElement,
		private readonly frame: HTMLElement,
		private readonly onPerformanceReady: () => void
	) {
		this.updateInteractivity();
		this.observer = new ResizeObserver(this.resize);
		this.observer.observe(frame);
		this.contentObserver = new ResizeObserver(this.measureObstacles);
		this.mutations = new MutationObserver(this.observeContent);
		const options = { signal: this.listeners.signal };
		canvas.addEventListener('pointermove', this.pointerMove, options);
		canvas.addEventListener('pointerdown', this.pointerDown, options);
		canvas.addEventListener('pointerup', this.endDrag, options);
		canvas.addEventListener('pointercancel', this.endDrag, options);
		canvas.addEventListener('lostpointercapture', this.endDrag, options);
		canvas.addEventListener('pointerleave', this.pointerLeave, options);
		window.addEventListener('resize', this.resize, options);
		document.addEventListener('visibilitychange', this.syncEnvironment, options);
		this.reducedMotion.addEventListener('change', this.syncEnvironment, options);
		this.darkMode.addEventListener('change', this.syncEnvironment, options);
		const content = frame.parentElement;
		if (content) {
			this.mutations.observe(content, { childList: true, subtree: true, characterData: true });
			this.observeContent();
			content.addEventListener('introend', this.measureObstacles, { ...options, capture: true });
		}
		window.addEventListener('scroll', this.measureObstacles, {
			...options,
			passive: true,
			capture: true
		});
		document.fonts.ready.then(() => {
			if (!this.disposed) this.measureObstacles();
		});
		this.resize();
		this.startWorker();
	}

	private startWorker(): void {
		if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') {
			this.useStaticBackground();
			return;
		}
		try {
			this.bitmapContext = this.canvas.getContext('bitmaprenderer');
		} catch {
			this.bitmapContext = null;
		}
		if (!this.bitmapContext) {
			try {
				this.drawingContext = this.canvas.getContext('2d');
			} catch {
				this.drawingContext = null;
			}
		}
		if (!this.bitmapContext && !this.drawingContext) {
			this.useStaticBackground();
			return;
		}
		try {
			const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
			this.worker = worker;
			worker.onmessage = (event: MessageEvent<BackgroundEvent>) => this.receive(worker, event.data);
			worker.onerror = (event) => {
				event.preventDefault();
				if (this.worker === worker) this.useStaticBackground();
			};
			worker.onmessageerror = () => {
				if (this.worker === worker) this.useStaticBackground();
			};
			this.post({
				type: 'initialize',
				size: this.size,
				environment: this.environment,
				obstacles: this.obstacles
			});
		} catch {
			this.useStaticBackground();
		}
	}

	private post(command: BackgroundCommand): void {
		if (this.disposed || !this.worker) return;
		try {
			this.worker.postMessage(command);
		} catch {
			this.useStaticBackground();
		}
	}

	private receive(worker: Worker, message: BackgroundEvent): void {
		if (this.disposed || worker !== this.worker) {
			this.discardBitmap(message);
			return;
		}
		if (!message || typeof message !== 'object') {
			this.useStaticBackground();
			return;
		}
		switch (message.type) {
			case 'frame': {
				if (typeof ImageBitmap === 'undefined' || !(message.bitmap instanceof ImageBitmap)) {
					this.useStaticBackground();
					return;
				}
				const bitmap = (this.bitmap = message.bitmap);
				let failed = false;
				try {
					if (Math.min(window.devicePixelRatio || 1, 2) !== this.size.dpr) this.resize();
					if (
						this.worker === worker &&
						bitmap.width === this.canvas.width &&
						bitmap.height === this.canvas.height
					) {
						if (this.bitmapContext) this.bitmapContext.transferFromImageBitmap(bitmap);
						else if (this.drawingContext) {
							this.drawingContext.imageSmoothingEnabled = false;
							this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
							this.drawingContext.drawImage(bitmap, 0, 0);
						}
					}
				} catch {
					failed = true;
				} finally {
					bitmap.close();
					this.bitmap = null;
					if (this.worker === worker) this.post({ type: 'frame-consumed' });
				}
				if (failed) this.useStaticBackground();
				return;
			}
			case 'ready':
				this.finishInitialCheck();
				return;
			case 'state':
				if (
					typeof message.interactive !== 'boolean' ||
					(message.cursor !== 'default' &&
						message.cursor !== 'grab' &&
						message.cursor !== 'grabbing')
				) {
					this.useStaticBackground();
					return;
				}
				this.workerInteractive = message.interactive;
				this.cursor = message.cursor;
				this.updateInteractivity();
				return;
			case 'error':
				this.useStaticBackground();
				return;
			default:
				this.discardBitmap(message);
				this.useStaticBackground();
		}
	}

	private discardBitmap(message: unknown): void {
		if (!message || typeof message !== 'object' || !('bitmap' in message)) return;
		if (typeof ImageBitmap !== 'undefined' && message.bitmap instanceof ImageBitmap) {
			message.bitmap.close();
		}
	}

	private stopWorker(): void {
		const worker = this.worker;
		this.worker = null;
		if (!worker) return;
		worker.onmessage = null;
		worker.onerror = null;
		worker.onmessageerror = null;
		try {
			worker.postMessage({ type: 'destroy' } satisfies BackgroundCommand);
		} catch {
			// Termination also releases resources if the worker is already unavailable.
		}
		worker.terminate();
	}

	private scheduleStaticSetup(setup: () => void): void {
		const run = () => {
			this.fallbackTask = null;
			if (!this.disposed) setup();
		};
		this.fallbackTaskIsIdle = typeof window.requestIdleCallback === 'function';
		this.fallbackTask = this.fallbackTaskIsIdle
			? window.requestIdleCallback(run, { timeout: 1000 })
			: window.setTimeout(run, 0);
	}

	private useStaticBackground(): void {
		if (this.disposed || this.fallbackRequested) return;
		this.fallbackRequested = true;
		this.endDrag();
		this.stopWorker();
		this.workerInteractive = false;
		this.bitmap?.close();
		this.bitmap = null;
		this.bitmapContext = null;
		this.drawingContext = null;
		const canvas = this.canvas.cloneNode(false) as HTMLCanvasElement;
		this.canvas.replaceWith(canvas);
		this.canvas = canvas;
		this.updateInteractivity();
		this.scheduleStaticSetup(() => {
			void import('./static.ts')
				.then(({ createStaticBackground }) => {
					if (this.disposed) return;
					this.scheduleStaticSetup(() => {
						let background: StaticBackground | null = null;
						try {
							background = createStaticBackground(this.canvas);
							this.canvas = background.canvas;
							this.updateInteractivity();
							background.update(this.size, this.obstacles, this.darkMode.matches);
							this.fallback = background;
							this.finishInitialCheck();
						} catch (error) {
							background?.destroy();
							console.warn('Could not initialize the static background', error);
						}
					});
				})
				.catch((error: unknown) => {
					if (!this.disposed) console.warn('Could not load the static background', error);
				});
		});
	}

	private resize = () => {
		if (this.disposed) return;
		const bounds = this.frame.getBoundingClientRect();
		const width = Math.max(1, Math.round(bounds.width));
		const height = Math.max(1, Math.round(bounds.height));
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		if (width === this.size.width && height === this.size.height && dpr === this.size.dpr) return;
		this.endDrag();
		this.size = { width, height, dpr };
		this.canvas.width = Math.round(width * dpr);
		this.canvas.height = Math.round(height * dpr);
		// Higher-resolution pixels retain crisp, non-AA edges on the smaller models.
		this.grid = simulationSize(this.size);
		this.obstacles = this.collectObstacles();
		this.post({ type: 'resize', size: this.size, obstacles: this.obstacles });
		this.fallback?.update(this.size, this.obstacles, this.darkMode.matches);
	};

	private observeContent = () => {
		if (this.disposed) return;
		const content = this.frame.parentElement;
		if (!content) return;
		this.contentObserver.disconnect();
		this.contentObserver.observe(content);
		this.protectedElements = Array.from(content.querySelectorAll(PROTECTED_CONTENT));
		for (const element of this.protectedElements) {
			this.contentObserver.observe(element);
		}
		this.measureObstacles();
	};

	private collectObstacles(): Obstacle[] {
		if (!this.grid.width || !this.grid.height || !this.frame.parentElement) return [];
		const frame = this.frame.getBoundingClientRect();
		const obstacles: Obstacle[] = [];
		const cellScale = Math.min(frame.width / this.grid.width, frame.height / this.grid.height);
		if (!cellScale) return obstacles;
		const offsetX = (frame.width - this.grid.width * cellScale) / 2;
		const offsetY = (frame.height - this.grid.height * cellScale) / 2;
		const clearance = 8;
		for (const element of this.protectedElements) {
			if (element.parentElement?.closest(PROTECTED_CONTENT)) continue;
			const range = document.createRange();
			range.selectNodeContents(element);
			const rect = element.matches('h1, h2, h3, h4, h5, h6, p')
				? range.getBoundingClientRect()
				: element.getBoundingClientRect();
			if (
				!rect.width ||
				!rect.height ||
				rect.right <= frame.left ||
				rect.left >= frame.right ||
				rect.bottom <= frame.top ||
				rect.top >= frame.bottom
			)
				continue;
			obstacles.push({
				minX: Math.max(0, (rect.left - frame.left - clearance - offsetX) / cellScale),
				maxX: Math.min(
					this.grid.width,
					(rect.right - frame.left + clearance - offsetX) / cellScale
				),
				minY: Math.max(0, (frame.bottom - rect.bottom - clearance - offsetY) / cellScale),
				maxY: Math.min(
					this.grid.height,
					(frame.bottom - rect.top + clearance - offsetY) / cellScale
				)
			});
		}
		return obstacles;
	}

	private measureObstacles = () => {
		if (this.disposed || !this.grid.width || !this.grid.height) return;
		const obstacles = this.collectObstacles();
		if (
			this.obstacles.length === obstacles.length &&
			obstacles.every((obstacle, i) => {
				const previous = this.obstacles[i];
				return (
					obstacle.minX === previous.minX &&
					obstacle.maxX === previous.maxX &&
					obstacle.minY === previous.minY &&
					obstacle.maxY === previous.maxY
				);
			})
		)
			return;
		this.obstacles = obstacles;
		this.post({ type: 'obstacles', obstacles });
		this.fallback?.update(this.size, obstacles, this.darkMode.matches);
	};

	private finishInitialCheck(): void {
		if (this.disposed || this.initialCheckComplete) return;
		this.initialCheckComplete = true;
		this.onPerformanceReady();
	}

	private updateInteractivity(): void {
		const interactive =
			!this.disposed &&
			this.worker !== null &&
			this.workerInteractive &&
			!this.reducedMotion.matches &&
			!document.hidden;
		if (!interactive && this.interactive) this.endDrag();
		this.interactive = interactive;
		this.canvas.style.pointerEvents = interactive ? '' : 'none';
		this.canvas.style.touchAction = interactive ? 'none' : 'auto';
		this.canvas.style.cursor = interactive ? this.cursor : 'default';
	}

	private syncEnvironment = () => {
		if (this.disposed) return;
		const environment: BackgroundEnvironment = {
			dark: this.darkMode.matches,
			reduced: this.reducedMotion.matches,
			visible: !document.hidden
		};
		const darkChanged = environment.dark !== this.environment.dark;
		this.environment = environment;
		this.updateInteractivity();
		this.post({ type: 'environment', environment });
		if (darkChanged) this.fallback?.update(this.size, this.obstacles, environment.dark);
	};

	private pointerPosition(event: PointerEvent): void {
		const bounds = this.canvas.getBoundingClientRect();
		const cellScale = Math.min(bounds.width / this.grid.width, bounds.height / this.grid.height);
		const offsetX = (bounds.width - this.grid.width * cellScale) / 2;
		const offsetY = (bounds.height - this.grid.height * cellScale) / 2;
		this.pointerX = clamp((event.clientX - bounds.left - offsetX) / cellScale, 0, this.grid.width);
		this.pointerY = clamp(
			(bounds.bottom - event.clientY - offsetY) / cellScale,
			0,
			this.grid.height
		);
	}

	private flushPointerMove = () => {
		if (this.moveAnimation) cancelAnimationFrame(this.moveAnimation);
		this.moveAnimation = 0;
		const command = this.pendingMove;
		this.pendingMove = null;
		if (command) this.post(command);
	};

	private pointerMove = (event: PointerEvent) => {
		if (!this.interactive || (this.pointerId !== null && event.pointerId !== this.pointerId))
			return;
		this.pointerPosition(event);
		this.pendingMove = {
			type: 'pointer',
			action: 'move',
			x: this.pointerX,
			y: this.pointerY,
			pressed: event.buttons !== 0
		};
		if (!this.moveAnimation) this.moveAnimation = requestAnimationFrame(this.flushPointerMove);
	};

	private pointerDown = (event: PointerEvent) => {
		if (!this.interactive || !event.isPrimary || event.button !== 0 || this.pointerId !== null)
			return;
		this.flushPointerMove();
		this.pointerPosition(event);
		this.pointerId = event.pointerId;
		this.canvas.setPointerCapture(event.pointerId);
		this.post({
			type: 'pointer',
			action: 'down',
			x: this.pointerX,
			y: this.pointerY,
			pressed: event.buttons !== 0
		});
	};

	private endDrag = (event?: PointerEvent) => {
		if (event && this.pointerId !== null && event.pointerId !== this.pointerId) return;
		this.flushPointerMove();
		const id = this.pointerId;
		this.pointerId = null;
		if (id !== null) {
			this.post({
				type: 'pointer',
				action: 'up',
				x: this.pointerX,
				y: this.pointerY,
				pressed: false
			});
		}
		this.cursor = 'default';
		this.canvas.style.cursor = 'default';
		if (id !== null && this.canvas.hasPointerCapture(id)) this.canvas.releasePointerCapture(id);
	};

	private pointerLeave = (event: PointerEvent) => {
		if (!this.interactive) return;
		this.flushPointerMove();
		this.post({
			type: 'pointer',
			action: 'leave',
			x: this.pointerX,
			y: this.pointerY,
			pressed: event.buttons !== 0
		});
	};

	destroy(): void {
		if (this.disposed) return;
		this.disposed = true;
		this.listeners.abort();
		this.observer.disconnect();
		this.contentObserver.disconnect();
		this.mutations.disconnect();
		this.endDrag();
		this.stopWorker();
		this.bitmap?.close();
		this.bitmap = null;
		if (this.fallbackTask !== null) {
			if (this.fallbackTaskIsIdle) window.cancelIdleCallback(this.fallbackTask);
			else window.clearTimeout(this.fallbackTask);
			this.fallbackTask = null;
		}
		this.fallback?.destroy();
		this.fallback = null;
		this.bitmapContext = null;
		this.drawingContext = null;
	}
}
