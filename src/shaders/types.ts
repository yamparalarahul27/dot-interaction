export type ParamDef =
  | { key: string; kind: 'slider'; label: string; min: number; max: number; step: number; default: number }
  | { key: string; kind: 'color'; label: string; default: string }
  | { key: string; kind: 'colors'; label: string; min: number; max: number; default: string[] }
  | { key: string; kind: 'select'; label: string; options: string[]; default: string }
  | { key: string; kind: 'toggle'; label: string; default: boolean };

export type ParamValue = number | string | string[] | boolean;
export type ParamValues = Record<string, ParamValue>;

export type RenderFn = (values: ParamValues, time: number, width: number, height: number) => void;

export interface ShaderDef {
  id: string;
  /** Human label — shown as the tag chip on preset cards. */
  name: string;
  fragment: string;
  params: ParamDef[];
  buildRenderer(gl: WebGL2RenderingContext, program: WebGLProgram): RenderFn;
}

/**
 * A named configuration of a shader — what the gallery actually renders.
 * Multiple presets can share a single shader type.
 */
export interface PresetDef {
  id: string;
  name: string;
  shaderId: string;
  description?: string;
  proTip?: string;
  /** Overrides merged on top of the shader's defaults. */
  values: Partial<ParamValues>;
}

export function defaultsFor(shader: ShaderDef): ParamValues {
  const out: ParamValues = {};
  for (const p of shader.params) {
    if (p.kind === 'colors') out[p.key] = [...p.default];
    else out[p.key] = p.default;
  }
  return out;
}

export function resolvePreset(preset: PresetDef, shader: ShaderDef): ParamValues {
  const base = defaultsFor(shader);
  for (const [k, v] of Object.entries(preset.values)) {
    if (v === undefined) continue;
    base[k] = Array.isArray(v) ? [...v] : v;
  }
  return base;
}
