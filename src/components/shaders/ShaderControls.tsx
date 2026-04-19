'use client';

import type { ParamDef, ParamValues } from '@/shaders/types';

interface Props {
  params: ParamDef[];
  values: ParamValues;
  onChange: (key: string, value: ParamValues[string]) => void;
}

export default function ShaderControls({ params, values, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {params.map((p) => {
        if (p.kind === 'slider') {
          const v = values[p.key] as number;
          return (
            <div key={p.key} className="flex flex-col gap-[6px]">
              <div className="flex justify-between text-xs text-neutral-400 font-medium">
                <span>{p.label}</span>
                <span>{formatNumber(v, p.step)}</span>
              </div>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={v}
                onChange={(e) => onChange(p.key, parseFloat(e.target.value))}
                className="w-full accent-white bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          );
        }
        if (p.kind === 'color') {
          return (
            <div key={p.key} className="flex items-center justify-between text-xs text-neutral-400 font-medium">
              <span>{p.label}</span>
              <input
                type="color"
                value={values[p.key] as string}
                onChange={(e) => onChange(p.key, e.target.value)}
                className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent overflow-hidden"
              />
            </div>
          );
        }
        if (p.kind === 'colors') {
          const list = values[p.key] as string[];
          return (
            <div key={p.key} className="flex flex-col gap-2">
              <span className="text-xs text-neutral-400 font-medium">{p.label}</span>
              <div className="flex flex-wrap gap-2">
                {list.map((hex, i) => (
                  <input
                    key={i}
                    type="color"
                    value={hex}
                    onChange={(e) => {
                      const next = list.slice();
                      next[i] = e.target.value;
                      onChange(p.key, next);
                    }}
                    className="w-7 h-7 p-0 border border-neutral-700 rounded cursor-pointer bg-transparent overflow-hidden"
                    title={`Color ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          );
        }
        if (p.kind === 'select') {
          return (
            <div key={p.key} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-neutral-400 font-medium">
                <span>{p.label}</span>
              </div>
              <select
                value={values[p.key] as string}
                onChange={(e) => onChange(p.key, e.target.value)}
                className="w-full bg-neutral-800 text-neutral-200 text-xs rounded px-2 py-1.5 border border-neutral-700 outline-none focus:border-neutral-500"
              >
                {p.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }
        const on = values[p.key] as boolean;
        return (
          <div
            key={p.key}
            className="flex items-center justify-between gap-2 text-xs text-neutral-400 font-medium cursor-pointer"
            onClick={() => onChange(p.key, !on)}
          >
            <span>{p.label}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${on ? 'bg-white' : 'bg-neutral-800'}`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-neutral-900 transition-transform ${on ? 'translate-x-4' : ''}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatNumber(v: number, step: number) {
  if (Number.isInteger(step) && step >= 1) return v.toFixed(0);
  const decimals = Math.max(0, Math.min(4, Math.ceil(-Math.log10(step))));
  return v.toFixed(decimals);
}
