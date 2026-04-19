'use client';

import { useEffect, useRef } from 'react';

function hexToRgbNorm(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = (parseInt(clean.substring(0, 2), 16) || 0) / 255;
  const g = (parseInt(clean.substring(2, 4), 16) || 0) / 255;
  const b = (parseInt(clean.substring(4, 6), 16) || 0) / 255;
  return [r, g, b];
}

export interface ShaderBackgroundProps {
  gradientFrom: string;
  gradientTo: string;
  backgroundColor: string;
  shaderSpeed: number;
  shaderScale: number;
  shaderIntensity: number;
  shaderDistortion: number;
  shaderEnabled: boolean;
  shaderGrain: boolean;
}

const VERT = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment shader: flowing domain-warped FBM with 3-color blend.
const FRAG = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_colorFrom;
uniform vec3 u_colorTo;
uniform vec3 u_colorBg;
uniform float u_scale;
uniform float u_intensity;
uniform float u_distortion;
uniform float u_grain;

out vec4 fragColor;

// 2D hash
vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
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
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p *= u_scale;

  float t = u_time * 0.15;

  // Domain warping
  vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t), fbm(p + vec2(5.2, 1.3) - t * 0.7));
  vec2 r = vec2(
    fbm(p + u_distortion * q + vec2(1.7, 9.2) + 0.4 * t),
    fbm(p + u_distortion * q + vec2(8.3, 2.8) + 0.3 * t)
  );
  float f = fbm(p + u_distortion * r);
  f = clamp(f * 0.5 + 0.5, 0.0, 1.0);

  // Boost contrast/intensity
  float k = smoothstep(0.0, 1.0, f);
  k = mix(k, pow(k, 0.6), clamp(u_intensity, 0.0, 1.0));

  // Blend: background -> colorFrom -> colorTo
  vec3 col = mix(u_colorBg, u_colorFrom, smoothstep(0.0, 0.55, k));
  col = mix(col, u_colorTo, smoothstep(0.45, 1.0, k));

  // Vignette
  float vig = smoothstep(1.3, 0.35, length(uv - 0.5));
  col = mix(u_colorBg, col, vig * 0.9 + 0.1);

  // Film grain
  if (u_grain > 0.5) {
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + u_time) * 43758.5453);
    col += (n - 0.5) * 0.05;
  }

  fragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function ShaderBackground(props: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) {
      console.warn('WebGL2 not available — Shader background disabled.');
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uColorFrom = gl.getUniformLocation(program, 'u_colorFrom');
    const uColorTo = gl.getUniformLocation(program, 'u_colorTo');
    const uColorBg = gl.getUniformLocation(program, 'u_colorBg');
    const uScale = gl.getUniformLocation(program, 'u_scale');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');
    const uDistortion = gl.getUniformLocation(program, 'u_distortion');
    const uGrain = gl.getUniformLocation(program, 'u_grain');

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    let rafId = 0;
    let lastT = performance.now();
    let elapsed = 0;
    let pausedTime = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      gl.viewport(0, 0, w, h);
    };

    const render = (now: number) => {
      const p = propsRef.current;
      const dt = (now - lastT) / 1000;
      lastT = now;
      if (p.shaderEnabled) {
        elapsed += dt * p.shaderSpeed;
        pausedTime = elapsed;
      } else {
        elapsed = pausedTime;
      }

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform3fv(uColorFrom, hexToRgbNorm(p.gradientFrom));
      gl.uniform3fv(uColorTo, hexToRgbNorm(p.gradientTo));
      gl.uniform3fv(uColorBg, hexToRgbNorm(p.backgroundColor));
      gl.uniform1f(uScale, p.shaderScale);
      gl.uniform1f(uIntensity, p.shaderIntensity);
      gl.uniform1f(uDistortion, p.shaderDistortion);
      gl.uniform1f(uGrain, p.shaderGrain ? 1.0 : 0.0);

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      rafId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(vbo);
      gl.deleteVertexArray(vao);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ display: 'block', pointerEvents: 'none', backgroundColor: props.backgroundColor }}
    />
  );
}
