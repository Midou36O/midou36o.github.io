import type { Obstacle } from './types.ts';

export type BackgroundSize = { width: number; height: number; dpr: number };
export type BackgroundEnvironment = { dark: boolean; reduced: boolean; visible: boolean };

export function simulationSize({ width, height }: BackgroundSize): {
	width: number;
	height: number;
} {
	const scale = 320 / Math.max(width, height);
	return {
		width: Math.max(3, Math.round(width * scale)),
		height: Math.max(3, Math.round(height * scale))
	};
}

export type BackgroundCommand =
	| {
			type: 'initialize';
			size: BackgroundSize;
			environment: BackgroundEnvironment;
			obstacles: Obstacle[];
	  }
	| { type: 'resize'; size: BackgroundSize; obstacles: Obstacle[] }
	| { type: 'obstacles'; obstacles: Obstacle[] }
	| { type: 'environment'; environment: BackgroundEnvironment }
	| {
			type: 'pointer';
			action: 'move' | 'down' | 'up' | 'leave';
			x: number;
			y: number;
			pressed: boolean;
	  }
	| { type: 'frame-consumed' }
	| { type: 'destroy' };

export type BackgroundEvent =
	| { type: 'frame'; bitmap: ImageBitmap; gridWidth: number; gridHeight: number }
	| { type: 'ready' }
	| { type: 'state'; interactive: boolean; cursor: 'default' | 'grab' | 'grabbing' }
	| { type: 'error'; message: string };
