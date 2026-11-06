export const VERTEX_SHADER = `#version 300 es
precision highp float;
out vec2 vUv;

void main() {
	vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
	vUv = p;
	gl_Position = vec4(p * 2. - 1., 0., 1.);
}
`;

// Hard-edged dots and polygon wireframes share the blue fluid field.
// Geometry is rasterized at simulation resolution with no antialiasing.
export const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform sampler2D uFlow;
uniform vec2 uResolution;
uniform vec3 uLamp;
uniform bool uDarkMode;
uniform float uTime, uSpacing, uGrowth;
in vec2 vUv;
out vec4 outColor;

float lampWarmth(vec2 point) {
	float f = max(0.0, 1.0 - length(point - uLamp.xy) / uLamp.z);
	return f * f * (3.0 - 2.0 * f);
}

void main() {
	vec2 pix = gl_FragCoord.xy;
	vec2 simulationSize = vec2(textureSize(uFlow, 0));
	float cellScale = min(uResolution.x / simulationSize.x, uResolution.y / simulationSize.y);
	vec2 offset = (uResolution - simulationSize * cellScale) * .5;
	// Sample the invisible fluid field at each dot center.
	vec2 grid = floor((pix - uResolution * .5) / uSpacing + .5);
	vec2 center = grid * uSpacing + uResolution * .5;
	vec2 point = (center - offset) / cellScale;
	vec2 sampleUv = clamp(point / simulationSize, vec2(.002), vec2(.998));
	// A shallow bottom bed fades immediately upward, with no flat rectangular band.
	float bottomBed = exp(-sampleUv.y * 32.0);
	float density = max(texture(uFlow, sampleUv).r, bottomBed);

	// Density controls radius and opacity. Empty cells draw no dot.
	// Maximum diameter is 86% of spacing, so neighbors never touch.
	float sizeFactor = smoothstep(.015, .92, clamp(density * uGrowth, 0.0, 1.0));
	float radius = uSpacing * .43 * sizeFactor;
	float r = length(pix - center);
	float circle = step(r, radius) * sizeFactor;
	vec2 pixelPoint = (pix - offset) / cellScale;
	ivec2 cell = clamp(ivec2(pixelPoint), ivec2(0), textureSize(uFlow, 0) - 1);
	vec4 solid = texelFetch(uFlow, cell, 0);
	if (any(lessThan(pixelPoint, vec2(0.0))) || any(greaterThanEqual(pixelPoint, simulationSize))) {
		solid = vec4(0.0);
	}

	// R: density, G: wire brightness, B: retained bulb warmth, A: spark heat.
	vec3 blue = vec3(.0784, .4235, 1.0);
	vec3 yellow = uDarkMode ? vec3(1.0, .7804, .1216) : vec3(180.0, 83.0, 9.0) / 255.0;
	vec3 color = mix(blue, yellow, lampWarmth(point));
	float alpha = circle;
	if (solid.g > 0.0) {
		color = mix(blue, yellow, solid.b) * (uDarkMode ? solid.g : 1.0);
		alpha = uDarkMode ? 1.0 : solid.g;
	}
	if (solid.a > 0.0) {
		float heat = floor(solid.a * 4.0 + .5) / 4.0;
		color = vec3(1.0, .4 + .45 * heat, .06 + .45 * heat);
		alpha = 1.0;
	}
	// Faint but visible bulb haze dots. Gaps stay transparent with no background wash.
	vec2 delta = (point - uLamp.xy) / uLamp.z;
	float distance2 = dot(delta, delta);
	float wisps = .82 + .18 * sin(point.x * .17 + uTime * .5) * sin(point.y * .13 - uTime * .3);
	float haze = (.12 * exp(-distance2 / .5) + .04 * exp(-distance2 / .04)) * wisps * step(r, uSpacing * .13);
	float hazeBehind = haze * (1.0 - alpha), outAlpha = alpha + hazeBehind;
	vec3 hazeColor = uDarkMode ? vec3(1.0, .65, .12) : yellow;
	outColor = vec4((color * alpha + hazeColor * hazeBehind) / max(outAlpha, .00001), outAlpha);
}
`;
