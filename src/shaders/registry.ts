import type { ShaderDef, PresetDef } from './types';
import { liquidGradient } from './liquid-gradient';

export const shaders: ShaderDef[] = [liquidGradient];

export const shadersById: Record<string, ShaderDef> = Object.fromEntries(
  shaders.map((s) => [s.id, s]),
);

export const presets: PresetDef[] = [
  {
    id: 'hologram',
    name: 'Hologram',
    shaderId: 'liquid-gradient',
    description:
      'Works great on cards, coupons, pricing sections, or anything that benefits from that "premium but playful" feel.',
    proTip:
      'Use masks. The shader doesn\'t have to fill a rectangle — throw a mask on it and let it bleed into the background. Keeps text readable and looks way cooler.',
    values: {
      colors: ['#0051FF', '#4DFF00', '#FFE500', '#FF6F00', '#0051FF'],
      seed: 0,
      speed: 0.21,
      scale: 0.15,
      amplitude: 0.6,
      frequency: 0.51,
      definition: 6,
      bands: 5,
      bias: 1,
      noise: 'Grain',
      amount: 0.05,
    },
  },
  {
    id: 'heatmap',
    name: 'Heatmap',
    shaderId: 'liquid-gradient',
    values: {
      colors: ['#000000', '#150054', '#BE47C4', '#FF8B17', '#1F1F1F'],
      seed: 516,
      speed: 2,
      scale: 2,
      amplitude: 0,
      frequency: 0.46,
      definition: 10,
      bands: 0.7,
      bias: 1,
      noise: 'Grain',
      amount: 0.09,
    },
  },
  {
    id: 'solar',
    name: 'Solar',
    shaderId: 'liquid-gradient',
    values: {
      colors: ['#FFFFFF', '#FFE100', '#FFA200', '#FF4800', '#FF0000', '#000000', '#000000', '#000000'],
      seed: 375,
      speed: 0.34,
      scale: 0.1,
      amplitude: 1,
      frequency: 0.31,
      definition: 6,
      bands: 5,
      bias: 0.9,
      noise: 'Grain',
      amount: 0.02,
    },
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    shaderId: 'liquid-gradient',
    values: {
      colors: ['#B4BC6E', '#7B930A', '#4E5310', '#3E4B01', '#191900'],
      seed: 671,
      speed: 0.76,
      scale: 1.36,
      amplitude: 1,
      frequency: 1.02,
      definition: 7,
      bands: 1.5,
      bias: 1,
      noise: 'Off',
    },
  },
];
