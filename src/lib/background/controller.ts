import { FluidField } from './fluid.ts';
import { createRenderer } from './renderer.ts';
import { SolidScene } from './scene.ts';
import type { Obstacle } from './types.ts';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const PROTECTED_CONTENT = 'a, button, h1, h2, h3, h4, h5, h6, p, pre, blockquote, table, img';

export class BackgroundController {
	private readonly fluid = new FluidField();
	private readonly scene = new SolidScene();
	private readonly renderer;
	private readonly softwareFallback: boolean;

	private get still(): boolean {
		return this.softwareFallback || this.reducedMotion.matches;
	}
	private readonly listeners = new AbortController();
	private readonly observer: ResizeObserver;
	private readonly contentObserver: ResizeObserver;
	private readonly mutations: MutationObserver;
	private protectedElements: Element[] = [];
	private readonly darkMode = window.matchMedia('(prefers-color-scheme: dark)');
	private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	private staticComposition = false;
	private obstacles: Obstacle[] | null = null;
	private animation = 0;
	private lastTime = 0;
	private time = 0;
	private cssWidth = 0;
	private cssHeight = 0;
	private dpr = 1;
	private pointerId: number | null = null;
	private pointerX = 0;
	private pointerY = 0;
	private previousX = 0;
	private previousY = 0;
	private hasPrevious = false;
	private disposed = false;

	constructor(
		private readonly canvas: HTMLCanvasElement,
		private readonly frame: HTMLElement
	) {
		const result = createRenderer(canvas);
		this.renderer = result.renderer;
		this.softwareFallback = !result.animated;
		canvas = this.canvas = result.canvas;
		if (this.softwareFallback) {
			canvas.style.pointerEvents = 'none';
			canvas.style.touchAction = 'auto';
		}
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
		document.addEventListener('visibilitychange', this.syncPlayback, options);
		this.reducedMotion.addEventListener('change', this.syncPlayback, options);
		this.darkMode.addEventListener('change', this.draw, options);
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
		this.syncPlayback();
	}

	private resize = () => {
		if (this.disposed) return;
		const bounds = this.frame.getBoundingClientRect();
		const width = Math.max(1, Math.round(bounds.width));
		const height = Math.max(1, Math.round(bounds.height));
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		if (width === this.cssWidth && height === this.cssHeight && dpr === this.dpr) return;
		this.cssWidth = width;
		this.cssHeight = height;
		this.dpr = dpr;
		this.canvas.width = Math.round(width * dpr);
		this.canvas.height = Math.round(height * dpr);
		this.endDrag();

		// Higher-resolution pixels retain crisp, non-AA edges on the smaller models.
		const simulationScale = 320 / Math.max(width, height);
		const simulationWidth = Math.max(3, Math.round(width * simulationScale));
		const simulationHeight = Math.max(3, Math.round(height * simulationScale));
		const resetStatic = this.still && !this.staticComposition;
		if (this.still) this.time = 0;
		this.staticComposition = this.still;
		if (
			resetStatic ||
			simulationWidth !== this.fluid.width ||
			simulationHeight !== this.fluid.height
		) {
			this.fluid.resize(simulationWidth, simulationHeight, this.time);
			this.scene.resize(simulationWidth, simulationHeight, this.time);
		}
		this.obstacles = null;
		this.renderer.resize(simulationWidth, simulationHeight);
		this.measureObstacles();
	};

	private draw = () => {
		if (!this.disposed) {
			this.renderer.render(this.fluid, this.scene, this.time, this.dpr, this.darkMode.matches);
		}
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
	private measureObstacles = () => {
		if (this.disposed || !this.fluid.width || !this.fluid.height) return;
		const content = this.frame.parentElement;
		if (!content) return;
		const frame = this.frame.getBoundingClientRect();
		const obstacles: Obstacle[] = [];
		const cellScale = Math.min(frame.width / this.fluid.width, frame.height / this.fluid.height);
		const offsetX = (frame.width - this.fluid.width * cellScale) / 2;
		const offsetY = (frame.height - this.fluid.height * cellScale) / 2;
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
					this.fluid.width,
					(rect.right - frame.left + clearance - offsetX) / cellScale
				),
				minY: Math.max(0, (frame.bottom - rect.bottom - clearance - offsetY) / cellScale),
				maxY: Math.min(
					this.fluid.height,
					(frame.bottom - rect.top + clearance - offsetY) / cellScale
				)
			});
		}
		if (
			this.still &&
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
			return;
		this.obstacles = obstacles;
		this.scene.setObstacles(obstacles);
		if (this.still) this.scene.renderPreset();
		else this.scene.update(0, this.time);
		this.draw();
	};

	private syncPlayback = () => {
		cancelAnimationFrame(this.animation);
		this.animation = 0;
		this.lastTime = 0;
		if (this.disposed) return;
		if (this.still) {
			this.endDrag();
			if (!this.staticComposition) {
				this.staticComposition = true;
				this.time = 0;
				this.fluid.resize(this.fluid.width, this.fluid.height, this.time);
				this.scene.renderPreset();
				this.draw();
			}
			return;
		}
		this.staticComposition = false;
		if (document.hidden) {
			this.endDrag();
			return;
		}
		this.animation = requestAnimationFrame(this.tick);
	};

	private tick = (now: number) => {
		if (this.disposed) return;
		if (document.hidden || this.still) {
			this.syncPlayback();
			return;
		}
		if (Math.min(window.devicePixelRatio || 1, 2) !== this.dpr) this.resize();
		const elapsed = this.lastTime ? Math.min((now - this.lastTime) / 16.6667, 1.7) : 1;
		this.lastTime = now;
		this.time += elapsed / 60;
		this.scene.update(elapsed, this.time);
		this.fluid.step(elapsed, this.time, this.scene);
		this.draw();
		this.animation = requestAnimationFrame(this.tick);
	};

	private pointerPosition(event: PointerEvent) {
		const bounds = this.canvas.getBoundingClientRect();
		const cellScale = Math.min(bounds.width / this.fluid.width, bounds.height / this.fluid.height);
		const offsetX = (bounds.width - this.fluid.width * cellScale) / 2;
		const offsetY = (bounds.height - this.fluid.height * cellScale) / 2;
		this.pointerX = clamp((event.clientX - bounds.left - offsetX) / cellScale, 0, this.fluid.width);
		this.pointerY = clamp(
			(bounds.bottom - event.clientY - offsetY) / cellScale,
			0,
			this.fluid.height
		);
	}

	private interact(event: PointerEvent) {
		const x = clamp(this.pointerX, 1, this.fluid.width - 2);
		const y = clamp(this.pointerY, 1, this.fluid.height - 2);
		if (this.hasPrevious) {
			this.fluid.interact(x, y, x - this.previousX, y - this.previousY, event.buttons !== 0);
		}
		this.previousX = x;
		this.previousY = y;
		this.hasPrevious = true;
	}

	private pointerMove = (event: PointerEvent) => {
		if (this.still) return;
		if (this.scene.drag.body) {
			if (event.pointerId === this.pointerId) {
				this.pointerPosition(event);
				this.scene.moveDrag(this.pointerX, this.pointerY);
			}
			return;
		}
		this.pointerPosition(event);
		this.canvas.style.cursor = this.scene.pickBody(this.pointerX, this.pointerY)
			? 'grab'
			: 'default';
		this.interact(event);
	};

	private pointerDown = (event: PointerEvent) => {
		if (this.still || !event.isPrimary || event.button !== 0 || this.pointerId !== null) return;
		this.pointerPosition(event);
		this.pointerId = event.pointerId;
		this.canvas.setPointerCapture(event.pointerId);
		this.hasPrevious = false;
		if (this.scene.beginDrag(this.pointerX, this.pointerY)) {
			this.canvas.style.cursor = 'grabbing';
		} else {
			this.interact(event);
		}
	};

	private endDrag = (event?: PointerEvent) => {
		if (event && this.pointerId !== null && event.pointerId !== this.pointerId) return;
		const id = this.pointerId;
		this.pointerId = null;
		this.scene.endDrag();
		this.hasPrevious = false;
		this.canvas.style.cursor = 'default';
		if (id !== null && this.canvas.hasPointerCapture(id)) this.canvas.releasePointerCapture(id);
	};

	private pointerLeave = () => {
		if (!this.scene.drag.body) this.hasPrevious = false;
	};

	destroy() {
		this.disposed = true;
		cancelAnimationFrame(this.animation);
		this.listeners.abort();
		this.observer.disconnect();
		this.contentObserver.disconnect();
		this.mutations.disconnect();
		this.endDrag();
		this.renderer.destroy();
	}
}
