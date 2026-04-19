import type { ShaderDef } from './types';
import { flattenColors } from './webgl';

const MAX_COLORS = 8;

const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_seed;
uniform float u_scale;
uniform float u_amplitude;
uniform float u_frequency;
uniform int   u_definition;
uniform float u_bands;
uniform float u_bias;
uniform float u_grain;
uniform int   u_colorCount;
uniform vec3  u_colors[${MAX_COLORS}];

out vec4 fragColor;

vec2 hash22(vec2 p) {
  p += u_seed * 17.3;
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
  float b = dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 12; i++) {
    if (i >= u_definition) break;
    v += amp * valueNoise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return v;
}

// Sample the active palette (u_colorCount stops) with t in [0, 1].
vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0);
  int n = max(u_colorCount, 2);
  float x = t * float(n - 1);
  int idx = int(floor(x));
  idx = clamp(idx, 0, n - 2);
  float f = x - float(idx);
  f = smoothstep(0.0, 1.0, f);
  return mix(u_colors[idx], u_colors[idx + 1], f);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // "Scale" reads as zoom — small values give broad liquid shapes.
  float zoom = 1.0 / max(u_scale, 0.01);
  p *= zoom * u_frequency;

  float t = u_time;

  // Domain warp (amplitude == 0 collapses warp but still animates via t).
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + 0.6 * t),
    fbm(p + vec2(5.2, 1.3) - 0.4 * t)
  );
  vec2 r = vec2(
    fbm(p + u_amplitude * q + vec2(1.7, 9.2) + 0.35 * t),
    fbm(p + u_amplitude * q + vec2(8.3, 2.8) + 0.28 * t)
  );
  float f = fbm(p + u_amplitude * r);
  f = clamp(f * 0.5 + 0.5, 0.0, 1.0);

  // Bias: <1 darkens, >1 brightens before palette sampling.
  f = pow(f, 1.0 / max(u_bias, 0.05));

  // Fractional banding: bands < 1 softens to a smooth sweep, bands >= 1
  // posterises with soft edges between bins.
  float nb = max(u_bands, 0.0001);
  float scaled = f * nb;
  float band = floor(scaled);
  float frac = scaled - band;
  float soft = smoothstep(0.35, 0.65, frac);
  float quantised = nb >= 1.0 ? (band + soft) / nb : f;

  vec3 col = palette(quantised);

  if (u_grain > 0.0) {
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + u_time * 60.0) * 43758.5453);
    col += (n - 0.5) * u_grain;
  }

  float vig = smoothstep(1.2, 0.4, length(uv - 0.5));
  col *= mix(0.85, 1.0, vig);

  fragColor = vec4(col, 1.0);
}
`;

export const liquidGradient: ShaderDef = {
  id: 'liquid-gradient',
  name: 'Liquid Gradient',
  fragment: FRAGMENT,
  params: [
    {
      kind: 'colors',
      key: 'colors',
      label: 'Colors',
      min: 2,
      max: MAX_COLORS,
      default: ['#0051FF', '#4DFF00', '#FFE500', '#FF6F00', '#0051FF'],
    },
    { kind: 'slider', key: 'seed', label: 'Seed', min: 0, max: 1000, step: 1, default: 0 },
    { kind: 'slider', key: 'speed', label: 'Speed', min: 0, max: 3, step: 0.01, default: 0.21 },
    { kind: 'slider', key: 'scale', label: 'Scale', min: 0.05, max: 3, step: 0.01, default: 0.15 },
    { kind: 'slider', key: 'amplitude', label: 'Amplitude', min: 0, max: 2, step: 0.01, default: 0.6 },
    { kind: 'slider', key: 'frequency', label: 'Frequency', min: 0.1, max: 3, step: 0.01, default: 0.51 },
    { kind: 'slider', key: 'definition', label: 'Definition', min: 1, max: 12, step: 1, default: 6 },
    { kind: 'slider', key: 'bands', label: 'Bands', min: 0, max: 12, step: 0.1, default: 5 },
    { kind: 'slider', key: 'bias', label: 'Bias', min: 0.2, max: 2, step: 0.01, default: 1 },
    { kind: 'select', key: 'noise', label: 'Noise', options: ['Off', 'Grain'], default: 'Grain' },
    { kind: 'slider', key: 'amount', label: 'Amount', min: 0, max: 0.5, step: 0.01, default: 0.05 },
  ],
  buildRenderer(gl, program) {
    const u_resolution = gl.getUniformLocation(program, 'u_resolution');
    const u_time = gl.getUniformLocation(program, 'u_time');
    const u_seed = gl.getUniformLocation(program, 'u_seed');
    const u_scale = gl.getUniformLocation(program, 'u_scale');
    const u_amplitude = gl.getUniformLocation(program, 'u_amplitude');
    const u_frequency = gl.getUniformLocation(program, 'u_frequency');
    const u_definition = gl.getUniformLocation(program, 'u_definition');
    const u_bands = gl.getUniformLocation(program, 'u_bands');
    const u_bias = gl.getUniformLocation(program, 'u_bias');
    const u_grain = gl.getUniformLocation(program, 'u_grain');
    const u_colorCount = gl.getUniformLocation(program, 'u_colorCount');
    const u_colors = gl.getUniformLocation(program, 'u_colors');

    const padded = new Float32Array(MAX_COLORS * 3);

    return (values, time, width, height) => {
      gl.uniform2f(u_resolution, width, height);
      gl.uniform1f(u_time, time);
      gl.uniform1f(u_seed, values.seed as number);
      gl.uniform1f(u_scale, values.scale as number);
      gl.uniform1f(u_amplitude, values.amplitude as number);
      gl.uniform1f(u_frequency, values.frequency as number);
      gl.uniform1i(u_definition, Math.round(values.definition as number));
      gl.uniform1f(u_bands, values.bands as number);
      gl.uniform1f(u_bias, (values.bias as number) ?? 1);
      const amount = values.noise === 'Grain' ? (values.amount as number) : 0;
      gl.uniform1f(u_grain, amount);

      const colors = (values.colors as string[]).slice(0, MAX_COLORS);
      const count = Math.max(2, colors.length);
      gl.uniform1i(u_colorCount, count);
      const flat = flattenColors(colors);
      padded.set(flat);
      // Zero any trailing slots so dynamic indexing never reads stale data.
      for (let i = flat.length; i < padded.length; i++) padded[i] = 0;
      gl.uniform3fv(u_colors, padded);
    };
  },
};
