import type { ShaderDef } from './types';
import { flattenColors } from './webgl';

const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_seed;
uniform float u_scale;
uniform float u_amplitude;
uniform float u_frequency;
uniform int   u_definition;
uniform int   u_bands;
uniform float u_grain;
uniform vec3  u_colors[5];

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
  for (int i = 0; i < 8; i++) {
    if (i >= u_definition) break;
    v += amp * valueNoise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return v;
}

// Sample a 5-stop palette with t in [0, 1] using smoothstep between stops.
vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0);
  float x = t * 4.0;
  int idx = int(floor(x));
  float f = fract(x);
  f = smoothstep(0.0, 1.0, f);
  vec3 a = u_colors[0];
  vec3 b = u_colors[1];
  if (idx == 1) { a = u_colors[1]; b = u_colors[2]; }
  else if (idx == 2) { a = u_colors[2]; b = u_colors[3]; }
  else if (idx >= 3) { a = u_colors[3]; b = u_colors[4]; }
  return mix(a, b, f);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // "Scale" reads as zoom — larger number = more detail on screen. Invert so
  // that small scale values give broad, liquid shapes.
  float zoom = 1.0 / max(u_scale, 0.01);
  p *= zoom * u_frequency;

  float t = u_time;

  // Domain warping — two levels of offset driven by fbm, scaled by amplitude.
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

  // Posterise into bands while keeping a soft roll between them.
  float nb = float(max(u_bands, 1));
  float scaled = f * nb;
  float band = floor(scaled);
  float frac = scaled - band;
  float soft = smoothstep(0.35, 0.65, frac);
  float quantised = (band + soft) / nb;

  vec3 col = palette(quantised);

  if (u_grain > 0.0) {
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + u_time * 60.0) * 43758.5453);
    col += (n - 0.5) * u_grain;
  }

  // Subtle vignette so edges feel premium on card masks.
  float vig = smoothstep(1.2, 0.4, length(uv - 0.5));
  col *= mix(0.85, 1.0, vig);

  fragColor = vec4(col, 1.0);
}
`;

export const liquidGradient: ShaderDef = {
  id: 'liquid-gradient',
  name: 'Hologram',
  tag: 'Liquid Gradient',
  description:
    'Works great on cards, coupons, pricing sections, or anything that benefits from that "premium but playful" feel.',
  proTip:
    'Use masks. The shader doesn\'t have to fill a rectangle — throw a mask on it and let it bleed into the background. Keeps text readable and looks way cooler.',
  fragment: FRAGMENT,
  params: [
    {
      kind: 'colors',
      key: 'colors',
      label: 'Colors',
      count: 5,
      default: ['#0051FF', '#4DFF00', '#FFE500', '#FF6F00', '#0051FF'],
    },
    { kind: 'slider', key: 'seed', label: 'Seed', min: 0, max: 100, step: 1, default: 0 },
    { kind: 'slider', key: 'speed', label: 'Speed', min: 0, max: 2, step: 0.01, default: 0.21 },
    { kind: 'slider', key: 'scale', label: 'Scale', min: 0.05, max: 2, step: 0.01, default: 0.15 },
    { kind: 'slider', key: 'amplitude', label: 'Amplitude', min: 0, max: 2, step: 0.01, default: 0.6 },
    { kind: 'slider', key: 'frequency', label: 'Frequency', min: 0.1, max: 3, step: 0.01, default: 0.51 },
    { kind: 'slider', key: 'definition', label: 'Definition', min: 1, max: 8, step: 1, default: 6 },
    { kind: 'slider', key: 'bands', label: 'Bands', min: 1, max: 12, step: 1, default: 5 },
    { kind: 'select', key: 'noise', label: 'Noise', options: ['None', 'Grain'], default: 'Grain' },
    { kind: 'slider', key: 'amount', label: 'Amount', min: 0, max: 0.5, step: 0.01, default: 0.05 },
  ],
  buildRenderer(gl, program) {
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uSeed = gl.getUniformLocation(program, 'u_seed');
    const uScale = gl.getUniformLocation(program, 'u_scale');
    const uAmplitude = gl.getUniformLocation(program, 'u_amplitude');
    const uFrequency = gl.getUniformLocation(program, 'u_frequency');
    const uDefinition = gl.getUniformLocation(program, 'u_definition');
    const uBands = gl.getUniformLocation(program, 'u_bands');
    const uGrain = gl.getUniformLocation(program, 'u_grain');
    const uColors = gl.getUniformLocation(program, 'u_colors');

    return (values, time, width, height) => {
      gl.uniform2f(uResolution, width, height);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uSeed, values.seed as number);
      gl.uniform1f(uScale, values.scale as number);
      gl.uniform1f(uAmplitude, values.amplitude as number);
      gl.uniform1f(uFrequency, values.frequency as number);
      gl.uniform1i(uDefinition, Math.round(values.definition as number));
      gl.uniform1i(uBands, Math.round(values.bands as number));
      const grainAmount = values.noise === 'Grain' ? (values.amount as number) : 0;
      gl.uniform1f(uGrain, grainAmount);
      gl.uniform3fv(uColors, flattenColors(values.colors as string[]));
    };
  },
};
