type Bounds = { left: number; top: number; right: number; bottom: number; opacity: number };
type Region = {
	element: HTMLDivElement;
	left: number;
	top: number;
	width: number;
	height: number;
	opacity: number;
};

const EMPTY: Bounds = { left: 0, top: 0, right: 0, bottom: 0, opacity: 0 };
const HAS_TEXT = /\S/;

export class TextDimmer {
	private readonly layer = document.createElement('div');
	private readonly listeners = new AbortController();
	private readonly mutations: MutationObserver;
	private readonly root: HTMLElement | null;
	private readonly walker: TreeWalker | null;
	private readonly range = document.createRange();
	private readonly clips = new Map<Element, Bounds>();
	private readonly rootBounds: Bounds = { ...EMPTY, opacity: 1 };
	private readonly rectangles: DOMRect[] = [];
	private readonly opacities: number[] = [];
	private readonly regions: Region[] = [];
	private animation = 0;

	constructor(private readonly frame: HTMLElement) {
		this.root = frame.parentElement?.querySelector<HTMLElement>('.site-content') ?? null;
		this.layer.className = 'scene-dimmer';
		this.layer.ariaHidden = 'true';
		frame.append(this.layer);
		this.walker = this.root
			? document.createTreeWalker(this.root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
					acceptNode: this.acceptNode
				})
			: null;
		this.mutations = new MutationObserver(this.trackAnimation);
		if (this.root) {
			this.mutations.observe(this.root, {
				attributes: true,
				subtree: true,
				attributeFilter: ['class', 'style', 'hidden', 'data-phase']
			});
		}
		const options = { capture: true, signal: this.listeners.signal };
		for (const event of [
			'introstart',
			'introend',
			'outrostart',
			'outroend',
			'animationstart',
			'animationend',
			'animationcancel',
			'transitionrun',
			'transitionend',
			'transitioncancel'
		]) {
			this.root?.addEventListener(event, this.trackAnimation, options);
		}
		this.trackAnimation();
	}

	private clip(element: Element): Bounds {
		const cached = this.clips.get(element);
		if (cached) return cached;
		const parent = element.parentElement ? this.clip(element.parentElement) : EMPTY;
		const style = getComputedStyle(element);
		const opacity = parent.opacity * Number(style.opacity);
		let bounds = parent;
		if (style.display === 'none') bounds = EMPTY;
		else if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
			const rect = element.getBoundingClientRect();
			bounds = {
				left:
					style.overflowX === 'visible'
						? parent.left
						: Math.max(parent.left, rect.left + element.clientLeft),
				right:
					style.overflowX === 'visible'
						? parent.right
						: Math.min(parent.right, rect.left + element.clientLeft + element.clientWidth),
				top:
					style.overflowY === 'visible'
						? parent.top
						: Math.max(parent.top, rect.top + element.clientTop),
				bottom:
					style.overflowY === 'visible'
						? parent.bottom
						: Math.min(parent.bottom, rect.top + element.clientTop + element.clientHeight),
				opacity
			};
		} else if (opacity !== parent.opacity) bounds = { ...parent, opacity };
		this.clips.set(element, bounds);
		return bounds;
	}

	private acceptNode = (node: Node): number => {
		if (node.nodeType === Node.TEXT_NODE) {
			return HAS_TEXT.test((node as Text).data)
				? NodeFilter.FILTER_ACCEPT
				: NodeFilter.FILTER_REJECT;
		}
		const element = node as Element;
		if (element.matches('script, style')) return NodeFilter.FILTER_REJECT;
		const clip = this.clip(element);
		if (clip.left >= clip.right || clip.top >= clip.bottom) return NodeFilter.FILTER_REJECT;
		const rect = element.getBoundingClientRect();
		if (
			rect.width &&
			rect.height &&
			(rect.right <= clip.left ||
				rect.left >= clip.right ||
				rect.bottom <= clip.top ||
				rect.top >= clip.bottom)
		) {
			return NodeFilter.FILTER_REJECT;
		}
		return NodeFilter.FILTER_SKIP;
	};

	update(): void {
		if (!this.root || !this.walker) return;
		const frame = this.frame.getBoundingClientRect();
		this.clips.clear();
		this.rootBounds.left = frame.left;
		this.rootBounds.top = frame.top;
		this.rootBounds.right = frame.right;
		this.rootBounds.bottom = frame.bottom;
		this.rootBounds.opacity = Number(getComputedStyle(this.root).opacity);
		this.clips.set(this.root, this.rootBounds);
		this.rectangles.length = 0;
		this.opacities.length = 0;
		this.walker.currentNode = this.root;
		let node: Node | null;
		while ((node = this.walker.nextNode())) {
			const text = node as Text;
			const clip = this.clip(text.parentElement!);
			this.range.setStart(text, text.data.search(HAS_TEXT));
			this.range.setEnd(text, text.data.trimEnd().length);
			// Text fragments exclude empty layout space, and scroll clipping excludes hidden rows
			for (const rect of this.range.getClientRects()) {
				const left = Math.max(rect.left, clip.left),
					right = Math.min(rect.right, clip.right);
				const top = Math.max(rect.top, clip.top),
					bottom = Math.min(rect.bottom, clip.bottom);
				if (left >= right || top >= bottom) continue;
				const previous = this.rectangles.at(-1);
				if (
					previous &&
					this.opacities.at(-1) === clip.opacity &&
					Math.abs(previous.top - top) < 2 &&
					Math.abs(previous.bottom - bottom) < 2 &&
					left <= previous.right + 8 &&
					right >= previous.left - 8
				) {
					const x = Math.min(previous.left, left),
						y = Math.min(previous.top, top);
					previous.width = Math.max(previous.right, right) - x;
					previous.height = Math.max(previous.bottom, bottom) - y;
					previous.x = x;
					previous.y = y;
				} else {
					rect.x = left;
					rect.y = top;
					rect.width = right - left;
					rect.height = bottom - top;
					this.rectangles.push(rect);
					this.opacities.push(clip.opacity);
				}
			}
		}
		for (let i = 0; i < this.rectangles.length; i++) {
			const rect = this.rectangles[i];
			let region = this.regions[i];
			if (!region) {
				const element = document.createElement('div');
				element.className = 'scene-dimmer-region';
				this.layer.append(element);
				region = { element, left: NaN, top: NaN, width: NaN, height: NaN, opacity: NaN };
				this.regions.push(region);
			}
			region.element.hidden = false;
			const opacity = this.opacities[i];
			if (region.opacity !== opacity) {
				// Follow the text's fade directly rather than starting a second, lagging transition
				region.opacity = opacity;
				region.element.style.setProperty('--text-opacity', String(opacity));
			}
			const left = rect.left - frame.left,
				top = rect.top - frame.top;
			if (region.left !== left) region.element.style.left = `${(region.left = left)}px`;
			if (region.top !== top) region.element.style.top = `${(region.top = top)}px`;
			if (region.width !== rect.width)
				region.element.style.width = `${(region.width = rect.width)}px`;
			if (region.height !== rect.height)
				region.element.style.height = `${(region.height = rect.height)}px`;
		}
		for (let i = this.rectangles.length; i < this.regions.length; i++)
			this.regions[i].element.hidden = true;
	}

	private trackAnimation = () => {
		if (!this.animation) this.animation = requestAnimationFrame(this.animate);
	};

	private animate = () => {
		this.animation = 0;
		this.update();
		if (
			this.root
				?.getAnimations({ subtree: true })
				.some(
					(animation) =>
						animation.playState === 'running' &&
						animation.effect?.getComputedTiming().iterations !== Infinity
				)
		) {
			this.trackAnimation();
		}
	};

	destroy(): void {
		this.listeners.abort();
		this.mutations.disconnect();
		if (this.animation) cancelAnimationFrame(this.animation);
		this.layer.remove();
	}
}
