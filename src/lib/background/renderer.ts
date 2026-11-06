import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders.ts';
import { SETTINGS, type Lamp, type Renderer } from './types.ts';

type BackgroundCanvas = HTMLCanvasElement | OffscreenCanvas;

export function createRenderer(canvas: OffscreenCanvas): {
	canvas: OffscreenCanvas;
	renderer: Renderer;
	animated: boolean;
};

export function createRenderer(canvas: HTMLCanvasElement): {
	canvas: HTMLCanvasElement;
	renderer: Renderer;
	animated: boolean;
};
export function createRenderer(canvas: BackgroundCanvas): {
	canvas: BackgroundCanvas;
	renderer: Renderer;
	animated: boolean;
} {
	try {
		const gl = canvas.getContext('webgl2', {
			alpha: true,
			premultipliedAlpha: false,
			antialias: false,
			depth: false,
			stencil: false,
			preserveDrawingBuffer: true
		}) as WebGL2RenderingContext | null;
		if (gl) return { canvas, renderer: createWebGLRenderer(canvas, gl), animated: true };
	} catch {
		// A failed WebGL canvas needs replacing before it can acquire a 2D context
		if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
			canvas = new OffscreenCanvas(canvas.width, canvas.height);
		} else {
			const source = canvas as HTMLCanvasElement;
			const replacement = source.cloneNode(false) as HTMLCanvasElement;
			source.replaceWith(replacement);
			canvas = replacement;
		}
	}

	const ctx = canvas.getContext('2d') as
		CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
	if (!ctx) throw new Error('Neither WebGL2 nor Canvas 2D is available for the background');
	return { canvas, renderer: createCanvasRenderer(canvas, ctx), animated: false };
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type);
	if (!shader) throw new Error('Unable to create a background shader');
	try {
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(gl.getShaderInfoLog(shader) || 'Background shader compilation failed');
		}
		return shader;
	} catch (error) {
		gl.deleteShader(shader);
		throw error;
	}
}

function createWebGLRenderer(canvas: BackgroundCanvas, gl: WebGL2RenderingContext): Renderer {
	let vertex: WebGLShader | null = null;
	let fragment: WebGLShader | null = null;
	let program: WebGLProgram | null = null;
	let texture: WebGLTexture | null = null;
	let vao: WebGLVertexArrayObject | null = null;
	let pixels: Uint8Array | null = null;
	let width = 0;
	let height = 0;
	let destroyed = false;

	function destroy() {
		if (destroyed) return;
		destroyed = true;
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
		if (vao) gl.deleteVertexArray(vao);
		if (texture) gl.deleteTexture(texture);
		if (program) gl.deleteProgram(program);
		if (vertex) gl.deleteShader(vertex);
		if (fragment) gl.deleteShader(fragment);
		pixels = null;
	}

	try {
		vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
		program = gl.createProgram();
		if (!program) throw new Error('Unable to create the background program');
		gl.attachShader(program, vertex);
		gl.attachShader(program, fragment);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program) || 'Background shader linking failed');
		}
		gl.useProgram(program);
		vao = gl.createVertexArray();
		if (!vao) throw new Error('Unable to create the background vertex array');
		gl.bindVertexArray(vao);
		texture = gl.createTexture();
		if (!texture) throw new Error('Unable to create the background texture');
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		const uniforms = {
			flow: gl.getUniformLocation(program, 'uFlow'),
			resolution: gl.getUniformLocation(program, 'uResolution'),
			time: gl.getUniformLocation(program, 'uTime'),
			spacing: gl.getUniformLocation(program, 'uSpacing'),
			growth: gl.getUniformLocation(program, 'uGrowth'),
			lamp: gl.getUniformLocation(program, 'uLamp'),
			darkMode: gl.getUniformLocation(program, 'uDarkMode')
		};
		gl.uniform1i(uniforms.flow, 0);

		return {
			resize(nextWidth, nextHeight) {
				if (destroyed) return;
				gl.viewport(0, 0, canvas.width, canvas.height);
				if (nextWidth === width && nextHeight === height) return;
				width = nextWidth;
				height = nextHeight;
				pixels = new Uint8Array(width * height * 4);
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			},
			render(fluid, scene, time, dpr, darkMode) {
				if (destroyed || !pixels) return;
				const size = width * height;
				for (let i = 0; i < size; i++) {
					const k = i * 4;
					pixels[k] = Math.round(fluid.density[i] * 255);
					pixels[k + 1] = scene.ink[i];
					pixels[k + 2] = Math.round(scene.warmth[i] * 255);
					pixels[k + 3] = scene.sparkInk[i];
				}
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
				gl.useProgram(program);
				gl.bindVertexArray(vao);
				gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
				gl.uniform3f(uniforms.lamp, scene.lamp.x, scene.lamp.y, scene.lamp.radius);
				gl.uniform1f(uniforms.time, time);
				gl.uniform1f(uniforms.spacing, SETTINGS.spacing * dpr);
				gl.uniform1f(uniforms.growth, SETTINGS.growth);
				gl.uniform1i(uniforms.darkMode, darkMode ? 1 : 0);
				gl.drawArrays(gl.TRIANGLES, 0, 3);
			},
			destroy
		};
	} catch (error) {
		destroy();
		throw error;
	}
}

function clamp(value: number, low: number, high: number): number {
	return Math.max(low, Math.min(high, value));
}

function smoothstep(low: number, high: number, value: number): number {
	const t = clamp((value - low) / (high - low), 0, 1);
	return t * t * (3 - 2 * t);
}

function bilinear(
	field: Float32Array,
	x: number,
	y: number,
	width: number,
	height: number
): number {
	x = clamp(x, 0, width - 1.001);
	y = clamp(y, 0, height - 1.001);
	const x0 = x | 0;
	const y0 = y | 0;
	const x1 = Math.min(x0 + 1, width - 1);
	const y1 = Math.min(y0 + 1, height - 1);
	const fx = x - x0;
	const fy = y - y0;
	return (
		(field[y0 * width + x0] * (1 - fx) + field[y0 * width + x1] * fx) * (1 - fy) +
		(field[y1 * width + x0] * (1 - fx) + field[y1 * width + x1] * fx) * fy
	);
}

function illumination(x: number, y: number, lamp: Lamp): number {
	const f = Math.max(0, 1 - Math.hypot(x - lamp.x, y - lamp.y) / lamp.radius);
	return f * f * (3 - 2 * f);
}

function hazeAt(x: number, y: number, lamp: Lamp, time: number): number {
	const dx = (x - lamp.x) / lamp.radius;
	const dy = (y - lamp.y) / lamp.radius;
	const distance2 = dx * dx + dy * dy;
	const wisps = 0.82 + 0.18 * Math.sin(x * 0.17 + time * 0.5) * Math.sin(y * 0.13 - time * 0.3);
	return (0.12 * Math.exp(-distance2 / 0.5) + 0.04 * Math.exp(-distance2 / 0.04)) * wisps;
}

function createCanvasRenderer(
	canvas: BackgroundCanvas,
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): Renderer {
	let width = 0;
	let height = 0;
	let destroyed = false;

	// Shared integer scanlines keep both faint mist dots and fluid dots non-antialiased.
	function pixelCircle(x: number, y: number, radius: number, color: string) {
		ctx.fillStyle = color;
		for (let py = Math.ceil(y - radius); py < y + radius; py++) {
			const dy = py + 0.5 - y;
			const half = Math.sqrt(Math.max(0, radius * radius - dy * dy));
			const left = Math.ceil(x - half - 0.5);
			const right = Math.floor(x + half - 0.5);
			if (right >= left) ctx.fillRect(left, py, right - left + 1, 1);
		}
	}

	return {
		resize(nextWidth, nextHeight) {
			if (destroyed) return;
			width = nextWidth;
			height = nextHeight;
		},
		render(fluid, scene, time, dpr, darkMode) {
			if (destroyed || !width || !height) return;
			const w = canvas.width;
			const h = canvas.height;
			ctx.clearRect(0, 0, w, h); // Transparent between dots. CSS defines the fixed background.
			const spacing = SETTINGS.spacing * dpr;
			const startX = (w * 0.5) % spacing;
			const startY = (h * 0.5) % spacing;
			const warmRed = 255;
			const warmGreen = 199;
			const warmBlue = 31;
			const cellScale = Math.min(w / width, h / height);
			const offsetX = (w - width * cellScale) * 0.5;
			const offsetY = (h - height * cellScale) * 0.5;
			for (let yy = startY; yy < h; yy += spacing) {
				for (let xx = startX; xx < w; xx += spacing) {
					const x = (xx - offsetX) / cellScale;
					const y = (h - yy - offsetY) / cellScale;
					const haze = darkMode ? hazeAt(x, y, scene.lamp, time) : 0;
					if (haze >= 1 / 255) {
						pixelCircle(xx, yy, spacing * 0.13, `rgba(${warmRed},166,${warmBlue},${haze})`);
					}
					const bottomBed = Math.exp(-(1 - yy / h) * 32);
					const density = Math.max(bilinear(fluid.density, x, y, width, height), bottomBed);
					const sizeFactor = smoothstep(0.015, 0.92, clamp(density * SETTINGS.growth, 0, 1));
					const radius = spacing * 0.43 * sizeFactor;
					if (sizeFactor === 0) continue;
					const warmth = darkMode ? illumination(x, y, scene.lamp) : 0;
					pixelCircle(
						xx,
						yy,
						radius,
						`rgba(${Math.round(20 + (warmRed - 20) * warmth)},${Math.round(108 + (warmGreen - 108) * warmth)},${Math.round(255 + (warmBlue - 255) * warmth)},${sizeFactor})`
					);
				}
			}
			ctx.globalAlpha = 1;
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					const i = y * width + x;
					if (!scene.ink[i] && !scene.sparkInk[i]) continue;
					const shade = scene.ink[i] / 255;
					const brightness = darkMode ? shade : 1;
					ctx.globalAlpha = scene.sparkInk[i] || darkMode ? 1 : shade;
					const heat = Math.round((scene.sparkInk[i] / 255) * 4) / 4;
					const warmth = darkMode ? scene.warmth[i] : 0;
					ctx.fillStyle = scene.sparkInk[i]
						? `rgb(255,${Math.round(255 * (0.4 + 0.45 * heat))},${Math.round(255 * (0.06 + 0.45 * heat))})`
						: `rgb(${Math.round((20 + (warmRed - 20) * warmth) * brightness)},${Math.round((108 + (warmGreen - 108) * warmth) * brightness)},${Math.round((255 + (warmBlue - 255) * warmth) * brightness)})`;
					const left = Math.round(offsetX + x * cellScale);
					const top = Math.round(offsetY + (height - 1 - y) * cellScale);
					ctx.fillRect(
						left,
						top,
						Math.round(offsetX + (x + 1) * cellScale) - left,
						Math.round(offsetY + (height - y) * cellScale) - top
					);
				}
			}
			ctx.globalAlpha = 1;
		},
		destroy() {
			if (destroyed) return;
			destroyed = true;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	};
}
