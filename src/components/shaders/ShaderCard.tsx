'use client';

import { useState } from 'react';
import type { PresetDef, ShaderDef, ParamValues } from '@/shaders/types';
import { resolvePreset } from '@/shaders/types';
import ShaderCanvas from './ShaderCanvas';
import ShaderControls from './ShaderControls';

interface Props {
  preset: PresetDef;
  shader: ShaderDef;
}

export default function ShaderCard({ preset, shader }: Props) {
  const [values, setValues] = useState<ParamValues>(() => resolvePreset(preset, shader));

  const update = (key: string, value: ParamValues[string]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setValues(resolvePreset(preset, shader));

  return (
    <section className="rounded-2xl border border-white/10 bg-neutral-950/80 overflow-hidden shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[420px] bg-black">
          <ShaderCanvas shader={shader} values={values} speedKey="speed" />
          <div className="absolute top-4 left-4 flex flex-col gap-1 text-white/90 drop-shadow-lg">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">Preset</span>
            <h3 className="text-xl font-semibold">{preset.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/15 w-fit backdrop-blur">
              {shader.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5 border-t lg:border-t-0 lg:border-l border-white/10 max-h-[560px] overflow-y-auto custom-scrollbar">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Controls</span>
              <h4 className="text-sm font-semibold text-white tracking-wide">{preset.name}</h4>
            </div>
            <button
              onClick={reset}
              className="text-[10px] font-medium px-2 py-1 rounded-md border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
            >
              Reset
            </button>
          </div>

          {preset.description && (
            <p className="text-xs leading-relaxed text-neutral-400">{preset.description}</p>
          )}

          <ShaderControls params={shader.params} values={values} onChange={update} />

          {preset.proTip && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-neutral-300 leading-relaxed">
              <span className="font-semibold text-white">Pro tip. </span>
              {preset.proTip}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
