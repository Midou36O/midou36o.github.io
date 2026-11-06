import { SETTINGS, type FluidState, type SceneState } from './types.ts';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export class FluidField implements FluidState {
	width = 0;
	height = 0;
	density = new Float32Array(0);
	private vx = new Float32Array(0);
	private vy = new Float32Array(0);
	private nextX = new Float32Array(0);
	private nextY = new Float32Array(0);
	private nextDensity = new Float32Array(0);
	private divergence = new Float32Array(0);
	private pressure = new Float32Array(0);
	private nextPressure = new Float32Array(0);

	// Fuller, separated plumes leave empty lanes instead of filling the whole field.
	private plumeMask(x: number, y: number, time: number) {
		const wave =
			0.65 * Math.sin((x / this.width) * 18 + Math.sin(y * 0.075) + time * 0.65) +
			0.35 * Math.sin((x / this.width) * 31 - y * 0.06 - time * 0.43);
		return Math.pow(clamp((wave - 0.06) / 0.65, 0, 1), 1.6);
	}

	resize(width: number, height: number, time: number) {
		this.width = width;
		this.height = height;
		const size = width * height;
		this.vx = new Float32Array(size);
		this.vy = new Float32Array(size);
		this.nextX = new Float32Array(size);
		this.nextY = new Float32Array(size);
		this.density = new Float32Array(size);
		this.nextDensity = new Float32Array(size);
		this.divergence = new Float32Array(size);
		this.pressure = new Float32Array(size);
		this.nextPressure = new Float32Array(size);

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const i = y * width + x;
				const soft = Math.pow(1 - y / height, 2.65);
				this.density[i] = soft * this.plumeMask(x, y, time);
				this.vx[i] = 0.1 * Math.sin(y * 0.085 + x * 0.023);
				this.vy[i] = 0.105 + 0.04 * Math.sin(x * 0.048 + y * 0.015);
			}
		}
	}

	private bilinear(field: Float32Array, x: number, y: number) {
		const width = this.width;
		x = clamp(x, 0, width - 1.001);
		y = clamp(y, 0, this.height - 1.001);
		const x0 = x | 0;
		const y0 = y | 0;
		const x1 = Math.min(x0 + 1, width - 1);
		const y1 = Math.min(y0 + 1, this.height - 1);
		const fx = x - x0;
		const fy = y - y0;
		return (
			(field[y0 * width + x0] * (1 - fx) + field[y0 * width + x1] * fx) * (1 - fy) +
			(field[y1 * width + x0] * (1 - fx) + field[y1 * width + x1] * fx) * fy
		);
	}

	step(dt: number, time: number, scene: SceneState) {
		const width = this.width;
		const height = this.height;
		const drag = Math.pow(0.994, dt);
		const fade = Math.pow(0.993, dt);
		const motion = SETTINGS.motion;
		const { vx, vy, nextX, nextY, density, nextDensity, divergence } = this;

		// Moving wireframes stir existing fluid only. Density comes from the plumes.
		for (let y = 1; y < height - 1; y++) {
			for (let x = 1; x < width - 1; x++) {
				const i = y * width + x;
				const owner = scene.owner[i];
				if (!owner) continue;
				const body = scene.models[owner - 1].body;
				const rx = x - body.x;
				const ry = y - body.y;
				vx[i] = clamp(
					vx[i] + (body.vx * 0.0006 - ry * (body.bz + body.wz) * 0.003) * motion * dt,
					-3.2,
					3.2
				);
				vy[i] = clamp(
					vy[i] + (body.vy * 0.0006 + rx * (body.bz + body.wz) * 0.003) * motion * dt,
					-3.2,
					3.2
				);
			}
		}

		// Semi-Lagrangian velocity advection with buoyancy and gently turning air currents.
		for (let y = 1; y < height - 1; y++) {
			for (let x = 1; x < width - 1; x++) {
				const i = y * width + x;
				const xx = x - vx[i] * dt;
				const yy = y - vy[i] * dt;
				const sideways =
					(Math.sin(y * 0.086 + time * 0.37) + Math.sin(x * 0.07 - y * 0.1 - time * 0.23)) *
					0.003 *
					motion *
					dt;
				nextX[i] = clamp((this.bilinear(vx, xx, yy) + sideways) * drag, -3.2, 3.2);
				nextY[i] = clamp(
					(this.bilinear(vy, xx, yy) + (0.011 * density[i] + 0.0015) * motion * dt) * drag,
					-3.2,
					3.2
				);
			}
		}

		// Solve for pressure. Removing divergence makes the displaced air flow around the cursor.
		for (let y = 1; y < height - 1; y++) {
			for (let x = 1; x < width - 1; x++) {
				const i = y * width + x;
				divergence[i] = -0.5 * (nextX[i + 1] - nextX[i - 1] + nextY[i + width] - nextY[i - width]);
				this.pressure[i] = 0;
			}
		}
		for (let iteration = 0; iteration < 15; iteration++) {
			for (let y = 1; y < height - 1; y++) {
				for (let x = 1; x < width - 1; x++) {
					const i = y * width + x;
					this.nextPressure[i] =
						(divergence[i] +
							this.pressure[i - 1] +
							this.pressure[i + 1] +
							this.pressure[i - width] +
							this.pressure[i + width]) *
						0.25;
				}
			}
			const previous = this.pressure;
			this.pressure = this.nextPressure;
			this.nextPressure = previous;
		}
		for (let y = 1; y < height - 1; y++) {
			for (let x = 1; x < width - 1; x++) {
				const i = y * width + x;
				vx[i] = clamp(nextX[i] - 0.5 * (this.pressure[i + 1] - this.pressure[i - 1]), -3.2, 3.2);
				vy[i] = clamp(
					nextY[i] - 0.5 * (this.pressure[i + width] - this.pressure[i - width]),
					-3.2,
					3.2
				);
			}
		}

		// Stagger half-second pulses across separated sources. Old plumes fade between them.
		const pulsePhase = time * Math.PI * 4;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const i = y * width + x;
				let value = this.bilinear(density, x - vx[i] * dt, y - vy[i] * dt) * fade;
				if (y < 13) {
					const emission = Math.pow(
						0.5 + 0.5 * Math.cos(pulsePhase - (x / width) * Math.PI * 4),
						4
					);
					value += 0.065 * Math.exp(-y * 0.24) * this.plumeMask(x, y, time) * emission * dt;
				}
				nextDensity[i] = clamp(value, 0, 1);
			}
		}
		this.density = nextDensity;
		this.nextDensity = density;
	}

	interact(x: number, y: number, dx: number, dy: number, pressed: boolean) {
		dx = clamp(dx, -14, 14);
		dy = clamp(dy, -14, 14);
		const speed = Math.hypot(dx, dy);
		if (speed <= 0.015) return;
		const radius = 10 + (pressed ? 4 : 0);
		const force = SETTINGS.force * (pressed ? 1.4 : 1);
		for (
			let iy = Math.max(1, Math.floor(y - radius * 2));
			iy < Math.min(this.height - 1, Math.ceil(y + radius * 2));
			iy++
		) {
			for (
				let ix = Math.max(1, Math.floor(x - radius * 2));
				ix < Math.min(this.width - 1, Math.ceil(x + radius * 2));
				ix++
			) {
				const rx = ix - x;
				const ry = iy - y;
				const distance = (rx * rx + ry * ry) / (radius * radius);
				const falloff = Math.exp(-distance * 2.2) * force;
				const i = iy * this.width + ix;
				this.vx[i] = clamp(
					this.vx[i] + dx * 0.3 * falloff + rx * 0.015 * speed * falloff,
					-3.2,
					3.2
				);
				this.vy[i] = clamp(
					this.vy[i] + dy * 0.3 * falloff + ry * 0.015 * speed * falloff,
					-3.2,
					3.2
				);
				this.density[i] = Math.max(
					0,
					this.density[i] * (1 - 0.19 * falloff * clamp(speed / 4, 0, 1))
				);
			}
		}
	}
}
