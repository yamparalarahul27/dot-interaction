export type ParamDef =
  | { key: string; kind: 'slider'; label: string; min: number; max: number; step: number; default: number }
  | { key: string; kind: 'color'; label: string; default: string }
  | { key: string; kind: 'colors'; label: string; count: number; default: string[] }
  | { key: string; kind: 'select'; label: string; options: string[]; default: string }
  | { key: string; kind: 'toggle'; label: string; default: boolean };

export type ParamValue = number | string | string[] | boolean;
export type ParamValues = Record<string, ParamValue>;

export type RenderFn = (values: ParamValues, time: number, width: number, height: number) => void;

export interface ShaderDef {
  id: string;
  name: string;
  tag: string;
  description: string;
  proTip?: string;
  params: ParamDef[];
  fragment: string;
  /**
   * After the program has linked, look up uniform locations and return a
   * per-frame renderer. The returned function will be called with the current
   * parameter values, elapsed time (seconds), and canvas pixel dimensions.
   */
  buildRenderer(gl: WebGL2RenderingContext, program: WebGLProgram): RenderFn;
}

export function defaultsFor(shader: ShaderDef): ParamValues {
  const out: ParamValues = {};
  for (const p of shader.params) {
    if (p.kind === 'colors') out[p.key] = [...p.default];
    else out[p.key] = p.default;
  }
  return out;
}
