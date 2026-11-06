export type EffectSettings = Readonly<{
	spacing: number;
	growth: number;
	motion: number;
	force: number;
}>;

export const SETTINGS: EffectSettings = Object.freeze({
	spacing: 17,
	growth: 1,
	motion: 1,
	force: 1.1
});

export type Body = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	ax: number;
	ay: number;
	az: number;
	wx: number;
	wy: number;
	wz: number;
	bx: number;
	by: number;
	bz: number;
};

export type Mesh = {
	vertices: Float32Array;
	triangles: Uint16Array;
	edges: Uint16Array;
	projected: Float32Array;
	hull: Uint16Array;
	hullCount: number;
	warmth: Float32Array;
	emissive: Uint8Array;
	lightVertices: Uint16Array;
};

export type Model = {
	name: string;
	mesh: Mesh;
	body: Body;
	xRate: number;
	yRate: number;
	xPhase: number;
	yPhase: number;
	ax: number;
	ay: number;
};

export type Lamp = {
	x: number;
	y: number;
	z: number;
	radius: number;
};

export type SceneState = {
	width: number;
	height: number;
	ink: Uint8Array;
	owner: Uint8Array;
	warmth: Float32Array;
	sparkInk: Uint8Array;
	lamp: Lamp;
	models: Model[];
};

export type FluidState = {
	width: number;
	height: number;
	density: Float32Array;
};

export type Obstacle = {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
};

export interface Renderer {
	resize(width: number, height: number): void;
	render(fluid: FluidState, scene: SceneState, time: number, dpr: number, darkMode: boolean): void;
	destroy(): void;
}
