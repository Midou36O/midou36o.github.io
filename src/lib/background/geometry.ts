// Niko model taken from https://tdrbot.github.io/projects/3d/niko/
import nikoData from './niko-model.json';
import type { Body, Mesh, Model, Obstacle } from './types.ts';

export type ProjectedHull = Pick<Mesh, 'projected' | 'hull' | 'hullCount'>;

export function createObstacleHull(obstacle: Obstacle): ProjectedHull & Obstacle {
	const { minX, maxX, minY, maxY } = obstacle;
	return {
		minX,
		maxX,
		minY,
		maxY,
		projected: new Float32Array([minX, minY, 0, maxX, minY, 0, maxX, maxY, 0, minX, maxY, 0]),
		hull: new Uint16Array([0, 1, 2, 3]),
		hullCount: 4
	};
}

function pose(bx: number, by: number, bz: number): Body {
	return { x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, az: 0, wx: 0, wy: 0, wz: 0, bx, by, bz };
}

function mesh(vertices: number[], triangles: number[], edges: number[], scale = 1): Mesh {
	const points = new Float32Array(vertices);
	if (scale !== 1) for (let i = 0; i < points.length; i++) points[i] *= scale;
	return {
		vertices: points,
		triangles: new Uint16Array(triangles),
		edges: new Uint16Array(edges),
		projected: new Float32Array(vertices.length),
		hull: new Uint16Array(vertices.length / 3),
		hullCount: 0,
		warmth: new Float32Array(vertices.length / 3),
		emissive: new Uint8Array(vertices.length / 3),
		lightVertices: new Uint16Array(0)
	};
}

export function createModels(): Model[] {
	// Polygon edges are explicit: no diagonal triangle seams across cube faces.
	const vertices: number[] = [];
	const triangles: number[] = [];
	const edges: number[] = [];
	const rings = 16;
	const sides = 6;
	for (let i = 0; i < rings; i++) {
		for (let j = 0; j < sides; j++) {
			const a = (i / rings) * Math.PI * 2;
			const b = (j / sides) * Math.PI * 2;
			const r = 1 + 0.38 * Math.cos(b);
			vertices.push(r * Math.cos(a), r * Math.sin(a), 0.38 * Math.sin(b));
			const p = i * sides + j;
			const q = ((i + 1) % rings) * sides + j;
			const r0 = i * sides + ((j + 1) % sides);
			const s = ((i + 1) % rings) * sides + ((j + 1) % sides);
			triangles.push(p, q, r0, q, s, r0);
			edges.push(p, q, p, r0);
		}
	}
	const torus = mesh(vertices, triangles, edges, 0.55);
	const cube = mesh(
		[
			-0.8, -0.8, -0.8, 0.8, -0.8, -0.8, 0.8, 0.8, -0.8, -0.8, 0.8, -0.8, -0.8, -0.8, 0.8, 0.8,
			-0.8, 0.8, 0.8, 0.8, 0.8, -0.8, 0.8, 0.8
		],
		[
			0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2, 0, 4, 7, 0, 7, 3, 1,
			2, 6, 1, 6, 5
		],
		[0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7],
		0.55
	);
	// Updated held-bulb pose from the supplied .blend. Pancake geometry is excluded.
	// Niko uses full imported size. The donut and cube are 55% size, including collision silhouettes.
	const niko = mesh(nikoData.vertices, nikoData.triangles, nikoData.edges);
	for (const index of nikoData.emissive) niko.emissive[index] = 1;
	niko.lightVertices = new Uint16Array(nikoData.lightVertices);
	return [
		{
			name: 'Donut',
			mesh: torus,
			body: pose(0.72, 0.43, 0.28),
			xRate: 0.25,
			yRate: 0.39,
			xPhase: -0.7,
			yPhase: 0,
			ax: 0.5,
			ay: 0
		},
		{
			name: 'Cube',
			mesh: cube,
			body: pose(0.53, 0.79, -0.32),
			xRate: 0.23,
			yRate: 0.31,
			xPhase: 1.8,
			yPhase: 1.6,
			ax: 0,
			ay: 0.4
		},
		{
			name: 'Niko with lightbulb',
			mesh: niko,
			body: pose(0.22, 0.34, 0.12),
			xRate: 0.19,
			yRate: 0.27,
			xPhase: 0,
			yPhase: Math.PI * 0.5,
			ax: 0,
			ay: 0
		}
	];
}

export function projectMesh(object: Mesh, body: Body, scale: number): void {
	const { ax, ay, az } = body;
	const sx = Math.sin(ax),
		cxr = Math.cos(ax);
	const sy = Math.sin(ay),
		cyr = Math.cos(ay);
	const sz = Math.sin(az),
		cz = Math.cos(az);
	const v = object.vertices,
		out = object.projected;
	for (let i = 0; i < v.length; i += 3) {
		const x = v[i],
			y = v[i + 1] * cxr - v[i + 2] * sx,
			z = v[i + 1] * sx + v[i + 2] * cxr;
		const xx = x * cyr + z * sy,
			zz = -x * sy + z * cyr;
		const rx = xx * cz - y * sz,
			ry = xx * sz + y * cz,
			perspective = 4 / (4 - zz);
		out[i] = body.x + rx * scale * perspective;
		out[i + 1] = body.y + ry * scale * perspective;
		out[i + 2] = zz;
	}
}

// Contact uses each rotated model's projected convex outer silhouette.
export function buildHull(object: Mesh): void {
	const v = object.projected,
		hull = object.hull,
		n = v.length / 3;
	let first = 0;
	for (let i = 1; i < n; i++) if (v[i * 3] < v[first * 3]) first = i;
	let current = first,
		count = 0;
	do {
		hull[count++] = current;
		let next = (current + 1) % n;
		for (let i = 0; i < n; i++) {
			if (i === current) continue;
			const dx = v[next * 3] - v[current * 3],
				dy = v[next * 3 + 1] - v[current * 3 + 1];
			const ex = v[i * 3] - v[current * 3],
				ey = v[i * 3 + 1] - v[current * 3 + 1],
				cross = dx * ey - dy * ex;
			if (cross < 0 || (Math.abs(cross) < 1e-7 && ex * ex + ey * ey > dx * dx + dy * dy)) next = i;
		}
		current = next;
	} while (current !== first && count < n);
	object.hullCount = count;
}
