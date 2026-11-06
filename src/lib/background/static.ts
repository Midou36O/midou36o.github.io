import { FluidField } from './fluid.ts';
import { simulationSize, type BackgroundSize } from './messages.ts';
import { createRenderer } from './renderer.ts';
import { SolidScene } from './scene.ts';
import type { Obstacle } from './types.ts';

export function createStaticBackground(canvas: HTMLCanvasElement) {
	const result = createRenderer(canvas);
	const fluid = new FluidField();
	const scene = new SolidScene();
	let pixelWidth = 0;
	let pixelHeight = 0;

	return {
		canvas: result.canvas,
		update(size: BackgroundSize, obstacles: Obstacle[], dark: boolean): void {
			const nextWidth = Math.round(size.width * size.dpr);
			const nextHeight = Math.round(size.height * size.dpr);
			if (pixelWidth !== nextWidth || pixelHeight !== nextHeight) {
				pixelWidth = nextWidth;
				pixelHeight = nextHeight;
				result.canvas.width = pixelWidth;
				result.canvas.height = pixelHeight;
			}
			const grid = simulationSize(size);
			if (grid.width !== fluid.width || grid.height !== fluid.height) {
				fluid.resize(grid.width, grid.height, 0);
				scene.resize(grid.width, grid.height, 0);
			}
			scene.setObstacles(obstacles);
			scene.renderPreset();
			result.renderer.resize(grid.width, grid.height);
			result.renderer.render(fluid, scene, 0, size.dpr, dark);
		},
		destroy(): void {
			result.renderer.destroy();
		}
	};
}
