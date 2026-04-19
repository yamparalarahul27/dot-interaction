'use client';

import { useEffect, useRef } from 'react';
import type { ShaderDef, ParamValues } from '@/shaders/types';
import { FULLSCREEN_VERT, compile, link, createFullscreenTriangle } from '@/shaders/webgl';

interface Props {
  shader: ShaderDef;
  values: ParamValues;
  /** Playback speed multiplier. Read from `values[speedKey]` if provided. */
  speedKey?: string;
  className?: string;
}

export default function ShaderCanvas({ shader, values, speedKey = 'speed', className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) {
      console.warn('WebGL2 not available — shader canvas disabled.');
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, FULLSCREEN_VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, shader.fragment);
    if (!vs || !fs) return;
    const program = link(gl, vs, fs);
    if (!program) return;

    gl.useProgram(program);
    const tri = createFullscreenTriangle(gl, program);
    const render = shader.buildRenderer(gl, program);

    let rafId = 0;
    let lastT = performance.now();
    let elapsed = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const loop = (now: number) => {
      const dt = (now - lastT) / 1000;
      lastT = now;
      const speed = (valuesRef.current[speedKey] as number | undefined) ?? 1;
      elapsed += dt * speed;

      gl.useProgram(program);
      render(valuesRef.current, elapsed, canvas.width, canvas.height);
      tri.draw();

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      tri.dispose();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [shader, speedKey]);

  return <canvas ref={canvasRef} className={className} style={{ display: 'block', width: '100%', height: '100%' }} />;
}
