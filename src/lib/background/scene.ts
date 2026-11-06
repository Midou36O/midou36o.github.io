import { buildHull, createModels, createObstacleHull, projectMesh } from './geometry.ts';
import type { ProjectedHull } from './geometry.ts';
import type { Body, Lamp, Mesh, Model, Obstacle, SceneState } from './types.ts';

const clamp = (x: number, a: number, b: number): number => Math.max(a, Math.min(b, x));

const PRESET_POSES = [
	{ x: 0.28, y: 0.4, ax: 0.5, ay: 0.3, az: -0.2 },
	{ x: 0.75, y: 0.55, ax: 0.35, ay: 0.4, az: 0.15 },
	{ x: 0.5, y: 0.7, ax: 0, ay: 0, az: 0 }
] as const;

export class SolidScene implements SceneState {
	width = 0;
	height = 0;
	ink = new Uint8Array(0);
	owner = new Uint8Array(0);
	warmth = new Float32Array(0);
	sparkInk = new Uint8Array(0);
	lamp: Lamp = { x: 0, y: 0, z: 0, radius: 1 };
	models = createModels();
	drag: { body: Body | null; x: number; y: number; localX: number; localY: number; angle: number } =
		{
			body: null,
			x: 0,
			y: 0,
			localX: 0,
			localY: 0,
			angle: 0
		};

	private depth = new Float32Array(0);
	private sparks = new Float32Array(96 * 6);
	private sparkCursor = 0;
	private time = 0;
	private contact = { nx: 0, ny: 0, depth: 0, x: 0, y: 0 };
	private obstacles: (ProjectedHull & Obstacle)[] = [];
	private obstaclesByX: (ProjectedHull & Obstacle)[] = [];
	private obstaclesByY: (ProjectedHull & Obstacle)[] = [];

	setObstacles(obstacles: Obstacle[]): void {
		this.obstacles = obstacles
			.filter(
				({ minX, maxX, minY, maxY }) =>
					Number.isFinite(minX) &&
					Number.isFinite(maxX) &&
					Number.isFinite(minY) &&
					Number.isFinite(maxY) &&
					maxX > minX &&
					maxY > minY
			)
			.map(createObstacleHull);
		this.obstaclesByX = this.obstacles.slice().sort((a, b) => a.minX - b.minX);
		this.obstaclesByY = this.obstacles.slice().sort((a, b) => a.minY - b.minY);
	}

	resize(width: number, height: number, time: number): void {
		this.endDrag();
		const previousWidth = this.width,
			previousHeight = this.height;
		this.width = width;
		this.height = height;
		this.time = time;
		const size = width * height;
		this.ink = new Uint8Array(size);
		this.owner = new Uint8Array(size);
		this.depth = new Float32Array(size);
		this.warmth = new Float32Array(size);
		this.sparkInk = new Uint8Array(size);
		this.sparks.fill(0);
		this.sparkCursor = 0;
		for (const model of this.models) {
			if (previousWidth && previousHeight) {
				const body = model.body;
				body.x *= width / previousWidth;
				body.y *= height / previousHeight;
				body.vx *= width / previousWidth;
				body.vy *= height / previousHeight;
			} else {
				this.updateModel(model, 0, 0, true);
				model.mesh.warmth.fill(0);
			}
		}
	}

	renderPreset(): void {
		this.endDrag();
		this.time = 0;
		this.ink.fill(0);
		this.owner.fill(0);
		this.depth.fill(-Infinity);
		this.warmth.fill(0);
		this.sparkInk.fill(0);
		this.sparks.fill(0);
		this.sparkCursor = 0;
		const scale = Math.min(this.width * 0.06, this.height * 0.112);
		if (!(scale > 0)) return;
		for (let i = 0; i < this.models.length; i++) {
			const model = this.models[i],
				pose = PRESET_POSES[i],
				body = model.body;
			body.x = this.width * pose.x;
			body.y = this.height * pose.y;
			body.ax = pose.ax;
			body.ay = pose.ay;
			body.az = pose.az;
			body.vx = body.vy = body.wx = body.wy = body.wz = 0;
			model.mesh.warmth.fill(0);
			projectMesh(model.mesh, body, scale);
			buildHull(model.mesh);
			// Protect content geometrically without impulses, sparks, or simulation steps.
			if (this.obstacles.length) this.separateObstacles(model, scale);
		}
		this.lightScene(0, scale);
		for (let i = 0; i < this.models.length; i++) this.drawMesh(this.models[i].mesh, i + 1);
	}

	update(dt: number, time: number): void {
		this.time = time;
		this.ink.fill(0);
		this.owner.fill(0);
		this.depth.fill(-Infinity);
		this.warmth.fill(0);
		const scale = Math.min(this.width * 0.06, this.height * 0.112),
			seconds = dt / 60; // All models 20% smaller.
		if (!(scale > 0)) return;
		let remaining = seconds;
		do {
			let step = remaining;
			if (this.obstacles.length) {
				step = Math.min(step, 1 / 120);
				for (const { body } of this.models) {
					const speed =
						Math.hypot(body.vx, body.vy) +
						scale *
							3 *
							(Math.abs(body.bx + body.wx) +
								Math.abs(body.by + body.wy) +
								Math.abs(body.bz + body.wz));
					const acceleration =
						this.drag.body === body
							? 3 *
								(120 * (Math.hypot(this.drag.x - body.x, this.drag.y - body.y) + scale * 3) +
									20 * speed)
							: 0;
					step = Math.min(step, (scale * 0.15) / Math.max(speed + acceleration * step, 1));
				}
			}
			for (const model of this.models) {
				this.updateModel(model, step, scale);
				projectMesh(model.mesh, model.body, scale);
				buildHull(model.mesh);
			}
			for (let a = 0; a < this.models.length; a++) {
				for (let b = a + 1; b < this.models.length; b++)
					this.collide(this.models[a], this.models[b], scale);
			}
			for (const model of this.models) this.collideObstacles(model, scale);
			remaining -= step;
		} while (remaining > 1e-8);
		this.lightScene(seconds, scale);
		for (let i = 0; i < this.models.length; i++) this.drawMesh(this.models[i].mesh, i + 1);
		this.stepSparks(seconds);
	}

	pickBody(x: number, y: number): Body | null {
		const owner =
			this.owner[
				clamp(Math.floor(y), 0, this.height - 1) * this.width +
					clamp(Math.floor(x), 0, this.width - 1)
			];
		return owner ? this.models[owner - 1].body : null;
	}

	beginDrag(x: number, y: number): boolean {
		this.moveDrag(x, y);
		const body = this.pickBody(this.drag.x, this.drag.y);
		if (!body) return false;
		this.drag.body = body;
		this.drag.localX = this.drag.x - body.x;
		this.drag.localY = this.drag.y - body.y;
		this.drag.angle = body.az;
		return true;
	}

	moveDrag(x: number, y: number): void {
		this.drag.x = clamp(x, 0, this.width);
		this.drag.y = clamp(y, 0, this.height);
	}

	endDrag(): void {
		this.drag.body = null;
	}

	// A bounded pool of one-pixel sparks: ballistic flight, drag, gravity, and cooling.
	private emitSparks(
		x: number,
		y: number,
		nx: number,
		ny: number,
		impulse: number,
		scale: number
	): void {
		if (impulse < 1.5) return;
		const sparks = this.sparks;
		const count = Math.min(18, 6 + Math.floor(impulse));
		for (let i = 0; i < count; i++) {
			const k = this.sparkCursor * 6;
			this.sparkCursor = (this.sparkCursor + 1) % 96;
			const angle =
				Math.atan2(ny, nx) +
				Math.PI * 0.5 +
				(Math.random() - 0.5) * 1.2 +
				(Math.random() < 0.5 ? Math.PI : 0);
			const speed = scale * (1.2 + Math.random() * 2.8),
				life = 0.45 + Math.random() * 0.6;
			sparks[k] = x;
			sparks[k + 1] = y;
			sparks[k + 2] = Math.cos(angle) * speed;
			sparks[k + 3] = Math.sin(angle) * speed + scale * 0.7;
			sparks[k + 4] = life;
			sparks[k + 5] = life;
		}
	}

	private stepSparks(seconds: number): void {
		const sparks = this.sparks;
		this.sparkInk.fill(0);
		const drag = Math.exp(-0.65 * seconds);
		for (let k = 0; k < sparks.length; k += 6) {
			if (sparks[k + 4] <= 0) continue;
			sparks[k + 4] -= seconds;
			sparks[k + 2] *= drag;
			sparks[k + 3] = sparks[k + 3] * drag - this.height * 0.9 * seconds;
			sparks[k] += sparks[k + 2] * seconds;
			sparks[k + 1] += sparks[k + 3] * seconds;
			if (sparks[k + 1] < 0.5) {
				sparks[k + 1] = 0.5;
				sparks[k + 3] = Math.abs(sparks[k + 3]) * 0.25;
				sparks[k + 2] *= 0.6;
			}
			const x = Math.floor(sparks[k]),
				y = Math.floor(sparks[k + 1]);
			if (x < 0 || x >= this.width || y < 0 || y >= this.height || sparks[k + 4] <= 0) continue;
			const i = y * this.width + x,
				heat = Math.ceil((sparks[k + 4] / sparks[k + 5]) * 4) / 4;
			this.sparkInk[i] = Math.max(this.sparkInk[i], Math.round(heat * 255));
		}
	}

	private illumination(x: number, y: number, z = this.lamp.z): number {
		const lamp = this.lamp;
		const f = Math.max(0, 1 - Math.hypot(x - lamp.x, y - lamp.y, z - lamp.z) / lamp.radius);
		return f * f * (3 - 2 * f);
	}

	private lightScene(seconds: number, scale: number): void {
		// The source follows the exported bulb glass, including rotation, dragging, and collisions.
		const niko = this.models[2].mesh;
		let x = 0,
			y = 0,
			z = 0;
		for (const index of niko.lightVertices) {
			const k = index * 3;
			x += niko.projected[k];
			y += niko.projected[k + 1];
			z += niko.projected[k + 2] * scale;
		}
		const count = niko.lightVertices.length;
		this.lamp.x = x / count;
		this.lamp.y = y / count;
		this.lamp.z = z / count;
		this.lamp.radius = Math.min(this.width, this.height) * 0.3;
		const decay = Math.exp(-2.2 * seconds);
		// Bulb wires stay yellow. Other wireframes cool back to blue after leaving its light.
		for (const model of this.models) {
			const object = model.mesh,
				v = object.projected;
			for (let i = 0; i < object.warmth.length; i++) {
				const target = this.illumination(v[i * 3], v[i * 3 + 1], v[i * 3 + 2] * scale);
				object.warmth[i] = object.emissive[i] ? 1 : Math.max(target, object.warmth[i] * decay);
			}
		}
	}

	private drawMesh(object: Mesh, owner: number): void {
		const out = object.projected,
			tri = object.triangles;
		for (let i = 0; i < tri.length; i += 3) {
			const a = tri[i] * 3,
				b = tri[i + 1] * 3,
				c = tri[i + 2] * 3;
			const ax0 = out[a],
				ay0 = out[a + 1],
				bx = out[b],
				by = out[b + 1],
				cx0 = out[c],
				cy0 = out[c + 1];
			const area = (bx - ax0) * (cy0 - ay0) - (by - ay0) * (cx0 - ax0);
			if (Math.abs(area) < 0.001) continue;
			const minX = Math.max(0, Math.floor(Math.min(ax0, bx, cx0))),
				maxX = Math.min(this.width - 1, Math.ceil(Math.max(ax0, bx, cx0)));
			const minY = Math.max(0, Math.floor(Math.min(ay0, by, cy0))),
				maxY = Math.min(this.height - 1, Math.ceil(Math.max(ay0, by, cy0)));
			for (let y = minY; y <= maxY; y++) {
				for (let x = minX; x <= maxX; x++) {
					const u = ((bx - x - 0.5) * (cy0 - y - 0.5) - (by - y - 0.5) * (cx0 - x - 0.5)) / area;
					const v0 = ((cx0 - x - 0.5) * (ay0 - y - 0.5) - (cy0 - y - 0.5) * (ax0 - x - 0.5)) / area,
						w = 1 - u - v0;
					if (u < 0 || v0 < 0 || w < 0) continue;
					const z = u * out[a + 2] + v0 * out[b + 2] + w * out[c + 2],
						k = y * this.width + x;
					if (z > this.depth[k]) {
						this.depth[k] = z;
						this.owner[k] = owner;
					}
				}
			}
		}
		// One simulation pixel per wire. Dim rear edges remain visible through faces.
		const edges = object.edges;
		for (let i = 0; i < edges.length; i += 2) {
			const a = edges[i] * 3,
				b = edges[i + 1] * 3,
				dx = out[b] - out[a],
				dy = out[b + 1] - out[a + 1];
			const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
			const emitter = object.emissive[edges[i]] || object.emissive[edges[i + 1]];
			for (let j = 0; j <= steps; j++) {
				const f = j / steps,
					x = Math.floor(out[a] + dx * f),
					y = Math.floor(out[a + 1] + dy * f);
				if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;
				const k = y * this.width + x,
					z = out[a + 2] + (out[b + 2] - out[a + 2]) * f;
				this.ink[k] = Math.max(this.ink[k], z >= this.depth[k] - 0.12 ? 255 : 102);
				this.warmth[k] = emitter
					? 1
					: Math.max(
							this.warmth[k],
							object.warmth[edges[i]] + (object.warmth[edges[i + 1]] - object.warmth[edges[i]]) * f
						);
			}
		}
	}

	private findContact(a: ProjectedHull, b: ProjectedHull, bodyA?: Body, bodyB?: Body): boolean {
		let depth = Infinity,
			nx = 0,
			ny = 0;
		for (let pass = 0; pass < 2; pass++) {
			const shape = pass === 0 ? a : b,
				v = shape.projected,
				h = shape.hull;
			for (let i = 0; i < shape.hullCount; i++) {
				const p = h[i] * 3,
					q = h[(i + 1) % shape.hullCount] * 3;
				const dx = v[q] - v[p],
					dy = v[q + 1] - v[p + 1],
					length = Math.hypot(dx, dy);
				if (length < 1e-7) continue;
				const x = -dy / length,
					y = dx / length;
				let minA = Infinity,
					maxA = -Infinity,
					minB = Infinity,
					maxB = -Infinity;
				for (let j = 0; j < a.hullCount; j++) {
					const k = a.hull[j] * 3,
						d = a.projected[k] * x + a.projected[k + 1] * y;
					minA = Math.min(minA, d);
					maxA = Math.max(maxA, d);
				}
				for (let j = 0; j < b.hullCount; j++) {
					const k = b.hull[j] * 3,
						d = b.projected[k] * x + b.projected[k + 1] * y;
					minB = Math.min(minB, d);
					maxB = Math.max(maxB, d);
				}
				const forward = maxA - minB,
					backward = maxB - minA,
					overlap = Math.min(forward, backward);
				if (overlap <= 0) return false;
				if (overlap < depth) {
					depth = overlap;
					const sign = !bodyB && backward < forward ? -1 : 1;
					nx = x * sign;
					ny = y * sign;
				}
			}
		}
		if (bodyA && bodyB && nx * (bodyB.x - bodyA.x) + ny * (bodyB.y - bodyA.y) < 0) {
			nx = -nx;
			ny = -ny;
		}
		// Average each supporting face/vertex to locate the contact lever arms.
		let ax = 0,
			ay = 0,
			bx = 0,
			by = 0,
			na = 0,
			nb = 0,
			maxA = -Infinity,
			minB = Infinity,
			minTA = Infinity,
			maxTA = -Infinity,
			minTB = Infinity,
			maxTB = -Infinity;
		for (let i = 0; i < a.hullCount; i++) {
			const k = a.hull[i] * 3;
			maxA = Math.max(maxA, a.projected[k] * nx + a.projected[k + 1] * ny);
		}
		for (let i = 0; i < b.hullCount; i++) {
			const k = b.hull[i] * 3;
			minB = Math.min(minB, b.projected[k] * nx + b.projected[k + 1] * ny);
		}
		for (let i = 0; i < a.hullCount; i++) {
			const k = a.hull[i] * 3;
			if (maxA - a.projected[k] * nx - a.projected[k + 1] * ny < 0.5) {
				ax += a.projected[k];
				ay += a.projected[k + 1];
				if (!bodyB) {
					const tangent = -a.projected[k] * ny + a.projected[k + 1] * nx;
					minTA = Math.min(minTA, tangent);
					maxTA = Math.max(maxTA, tangent);
				}
				na++;
			}
		}
		for (let i = 0; i < b.hullCount; i++) {
			const k = b.hull[i] * 3;
			if (b.projected[k] * nx + b.projected[k + 1] * ny - minB < 0.5) {
				bx += b.projected[k];
				by += b.projected[k + 1];
				if (!bodyB) {
					const tangent = -b.projected[k] * ny + b.projected[k + 1] * nx;
					minTB = Math.min(minTB, tangent);
					maxTB = Math.max(maxTB, tangent);
				}
				nb++;
			}
		}
		this.contact.nx = nx;
		this.contact.ny = ny;
		this.contact.depth = depth;
		this.contact.x = (ax / na + bx / nb) * 0.5;
		this.contact.y = (ay / na + by / nb) * 0.5;
		if (!bodyB) {
			// Keep a long text face's contact on the mesh, not at the text line's midpoint.
			const tangent = (Math.max(minTA, minTB) + Math.min(maxTA, maxTB)) * 0.5,
				normal = (maxA + minB) * 0.5;
			this.contact.x = nx * normal - ny * tangent;
			this.contact.y = ny * normal + nx * tangent;
		}
		return true;
	}

	private applyImpulse(
		a: Body,
		b: Body,
		rx: number,
		ry: number,
		sx: number,
		sy: number,
		ix: number,
		iy: number,
		inertia: number
	): void {
		a.vx -= ix;
		a.vy -= iy;
		b.vx += ix;
		b.vy += iy;
		a.wz -= (rx * iy - ry * ix) / inertia;
		b.wz += (sx * iy - sy * ix) / inertia;
	}

	private collide(modelA: Model, modelB: Model, scale: number): void {
		const a = modelA.body,
			b = modelB.body;
		if (!this.findContact(modelA.mesh, modelB.mesh, a, b)) return;
		const { nx, ny, depth, x, y } = this.contact;
		const rx = x - a.x,
			ry = y - a.y,
			sx = x - b.x,
			sy = y - b.y,
			inertia = scale * scale * 0.65;
		const av = a.bz + a.wz,
			bv = b.bz + b.wz;
		const dx = b.vx - bv * sy - a.vx + av * ry,
			dy = b.vy + bv * sx - a.vy - av * rx;
		const speed = dx * nx + dy * ny,
			ra = rx * ny - ry * nx,
			rb = sx * ny - sy * nx;
		if (speed < 0) {
			const impulse = (-1.85 * speed) / (2 + (ra * ra + rb * rb) / inertia);
			this.emitSparks(x, y, nx, ny, impulse, scale);
			this.applyImpulse(a, b, rx, ry, sx, sy, nx * impulse, ny * impulse, inertia);
			const tx = -ny,
				ty = nx,
				ta = rx * ty - ry * tx,
				tb = sx * ty - sy * tx;
			const slip =
				(b.vx - (b.bz + b.wz) * sy - a.vx + (a.bz + a.wz) * ry) * tx +
				(b.vy + (b.bz + b.wz) * sx - a.vy - (a.bz + a.wz) * rx) * ty;
			const friction = clamp(
				-slip / (2 + (ta * ta + tb * tb) / inertia),
				-impulse * 0.35,
				impulse * 0.35
			);
			this.applyImpulse(a, b, rx, ry, sx, sy, tx * friction, ty * friction, inertia);
			// Contact direction also tips the 3D meshes. All extra spin decays below.
			a.wx -= ((ny * impulse) / scale) * 0.12;
			a.wy += ((nx * impulse) / scale) * 0.12;
			b.wx += ((ny * impulse) / scale) * 0.12;
			b.wy -= ((nx * impulse) / scale) * 0.12;
		}
		const correction = (depth + 0.02) * 0.5;
		a.x -= nx * correction;
		a.y -= ny * correction;
		b.x += nx * correction;
		b.y += ny * correction;
		projectMesh(modelA.mesh, a, scale);
		projectMesh(modelB.mesh, b, scale);
	}

	private collideObstacles(model: Model, scale: number): void {
		if (!this.obstacles.length) return;
		const a = model.body,
			inertia = scale * scale * 0.65;
		let minX = Infinity,
			maxX = -Infinity,
			minY = Infinity,
			maxY = -Infinity;
		for (let i = 0; i < model.mesh.hullCount; i++) {
			const k = model.mesh.hull[i] * 3;
			minX = Math.min(minX, model.mesh.projected[k]);
			maxX = Math.max(maxX, model.mesh.projected[k]);
			minY = Math.min(minY, model.mesh.projected[k + 1]);
			maxY = Math.max(maxY, model.mesh.projected[k + 1]);
		}
		let touching = false;
		for (const obstacle of this.obstacles) {
			if (
				maxX <= obstacle.minX ||
				minX >= obstacle.maxX ||
				maxY <= obstacle.minY ||
				minY >= obstacle.maxY
			)
				continue;
			if (!this.findContact(model.mesh, obstacle)) continue;
			touching = true;
			const { nx, ny, x, y } = this.contact,
				rx = x - a.x,
				ry = y - a.y,
				spin = a.bz + a.wz,
				speed = -(a.vx - spin * ry) * nx - (a.vy + spin * rx) * ny,
				lever = rx * ny - ry * nx;
			if (speed >= 0) continue;
			// Text is an infinite-mass body. Only the moving mesh receives the reaction.
			const impulse = (-1.85 * speed) / (1 + (lever * lever) / inertia);
			this.emitSparks(x, y, nx, ny, impulse, scale);
			a.vx -= nx * impulse;
			a.vy -= ny * impulse;
			a.wz -= (lever * impulse) / inertia;
			const tx = -ny,
				ty = nx,
				tangentLever = rx * ty - ry * tx,
				slip = -(a.vx - (a.bz + a.wz) * ry) * tx - (a.vy + (a.bz + a.wz) * rx) * ty,
				friction = clamp(
					-slip / (1 + (tangentLever * tangentLever) / inertia),
					-impulse * 0.35,
					impulse * 0.35
				);
			a.vx -= tx * friction;
			a.vy -= ty * friction;
			a.wz -= (tangentLever * friction) / inertia;
			a.wx -= ((ny * impulse) / scale) * 0.12;
			a.wy += ((nx * impulse) / scale) * 0.12;
		}
		if (touching) this.separateObstacles(model, scale);
	}

	private separateObstacles(model: Model, scale: number): void {
		const mesh = model.mesh;
		let minX = Infinity,
			maxX = -Infinity,
			minY = Infinity,
			maxY = -Infinity;
		for (let i = 0; i < mesh.hullCount; i++) {
			const k = mesh.hull[i] * 3;
			minX = Math.min(minX, mesh.projected[k]);
			maxX = Math.max(maxX, mesh.projected[k]);
			minY = Math.min(minY, mesh.projected[k + 1]);
			maxY = Math.max(maxY, mesh.projected[k + 1]);
		}
		// Ordinary impacts need only their minimum SAT correction, not a sweep of every hull axis.
		contacts: for (let pass = 0; pass <= 4; pass++) {
			let touching = false;
			for (const obstacle of this.obstacles) {
				if (
					maxX <= obstacle.minX ||
					minX >= obstacle.maxX ||
					maxY <= obstacle.minY ||
					minY >= obstacle.maxY
				)
					continue;
				if (!this.findContact(mesh, obstacle)) continue;
				if (pass === 4) break contacts;
				const { nx, ny, depth } = this.contact,
					dx = -nx * (depth + 0.02),
					dy = -ny * (depth + 0.02);
				if (minX + dx < 0 || maxX + dx > this.width || minY + dy < 0 || maxY + dy > this.height)
					break contacts;
				model.body.x += dx;
				model.body.y += dy;
				minX += dx;
				maxX += dx;
				minY += dy;
				maxY += dy;
				projectMesh(mesh, model.body, scale);
				touching = true;
			}
			if (!touching) return;
		}

		let best = Infinity,
			bestX = 0,
			bestY = 0,
			bestFits = false;
		// Overlapping text rectangles form a union, not competing correction springs.
		// Sorted AABB intervals give each cardinal escape in one scan, even inside a text cluster.
		for (let direction = 0; direction < 4; direction++) {
			const horizontal = direction < 2,
				positive = direction % 2 === 0,
				obstacles = horizontal ? this.obstaclesByX : this.obstaclesByY;
			let distance = 0;
			for (let i = 0; i < obstacles.length; i++) {
				const obstacle = obstacles[positive ? i : obstacles.length - 1 - i];
				if (
					horizontal
						? maxY <= obstacle.minY || minY >= obstacle.maxY
						: maxX <= obstacle.minX || minX >= obstacle.maxX
				)
					continue;
				const min = horizontal ? minX : minY,
					max = horizontal ? maxX : maxY,
					obstacleMin = horizontal ? obstacle.minX : obstacle.minY,
					obstacleMax = horizontal ? obstacle.maxX : obstacle.maxY,
					enter = positive ? obstacleMin - max : min - obstacleMax,
					exit = positive ? obstacleMax - min : max - obstacleMin;
				if (enter <= distance && exit >= distance) distance = exit + 0.02;
			}
			const dx = horizontal ? (positive ? distance : -distance) : 0,
				dy = horizontal ? 0 : positive ? distance : -distance,
				fits =
					minX + dx >= 0 && maxX + dx <= this.width && minY + dy >= 0 && maxY + dy <= this.height;
			if ((bestFits && !fits) || (fits === bestFits && distance >= best)) continue;
			best = distance;
			bestX = dx;
			bestY = dy;
			bestFits = fits;
		}
		if (!Number.isFinite(best)) return;
		model.body.x += bestX;
		model.body.y += bestY;
		projectMesh(mesh, model.body, scale);
	}

	private moveBody(
		body: Body,
		seconds: number,
		targetX: number,
		targetY: number,
		targetVX: number,
		targetVY: number,
		scale: number
	): void {
		const drag = this.drag;
		if (drag.body === body) {
			// A damped spring pulls at the grabbed point, producing torque off-center.
			const angle = body.az - drag.angle,
				c = Math.cos(angle),
				s = Math.sin(angle);
			const rx = drag.localX * c - drag.localY * s,
				ry = drag.localX * s + drag.localY * c;
			const spin = body.bz + body.wz,
				inertia = scale * scale * 0.65;
			const effectiveMass = 1 / (1 + (rx * rx + ry * ry) / inertia);
			const fx = ((drag.x - body.x - rx) * 120 - (body.vx - spin * ry) * 20) * effectiveMass;
			const fy = ((drag.y - body.y - ry) * 120 - (body.vy + spin * rx) * 20) * effectiveMass;
			body.vx += fx * seconds;
			body.vy += fy * seconds;
			body.wz += ((rx * fy - ry * fx) / inertia) * seconds;
		} else {
			// Release preserves momentum. The slow wandering force gradually takes over.
			body.vx += (targetVX + (targetX - body.x) * 0.35 - body.vx) * 0.7 * seconds;
			body.vy += (targetVY + (targetY - body.y) * 0.35 - body.vy) * 0.7 * seconds;
		}
		body.x += body.vx * seconds;
		body.y += body.vy * seconds;
		const margin = scale * 1.8;
		if (body.x < margin) {
			body.x = margin;
			body.vx = Math.abs(body.vx) * 0.8;
		}
		if (body.x > this.width - margin) {
			body.x = this.width - margin;
			body.vx = -Math.abs(body.vx) * 0.8;
		}
		if (body.y < margin) {
			body.y = margin;
			body.vy = Math.abs(body.vy) * 0.8;
		}
		if (body.y > this.height - margin) {
			body.y = this.height - margin;
			body.vy = -Math.abs(body.vy) * 0.8;
		}
		body.ax += (body.bx + body.wx) * seconds;
		body.ay += (body.by + body.wy) * seconds;
		body.az += (body.bz + body.wz) * seconds;
		const damping = Math.exp(-1.4 * seconds);
		body.wx *= damping;
		body.wy *= damping;
		body.wz *= damping;
	}

	private updateModel(model: Model, seconds: number, scale: number, resetting = false): void {
		const body = model.body,
			xPhase = this.time * model.xRate + model.xPhase,
			yPhase = this.time * model.yRate + model.yPhase;
		const x = this.width * (0.5 + 0.3 * Math.sin(xPhase)),
			y = this.height * (0.45 + 0.24 * Math.sin(yPhase));
		const vx = this.width * 0.3 * model.xRate * Math.cos(xPhase),
			vy = this.height * 0.24 * model.yRate * Math.cos(yPhase);
		if (resetting) {
			body.x = x;
			body.y = y;
			body.vx = vx;
			body.vy = vy;
			body.wx = body.wy = body.wz = 0;
			body.ax = this.time * body.bx + model.ax;
			body.ay = this.time * body.by + model.ay;
			body.az = this.time * body.bz;
		} else this.moveBody(body, seconds, x, y, vx, vy, scale);
	}
}
