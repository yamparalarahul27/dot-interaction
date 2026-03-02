'use client';

import { useState } from 'react';
import CanvasBackground from "@/components/CanvasBackground";
import GradientBars, { BarShape } from "@/components/GradientBars";

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
}

function ControlSlider({ label, min, max, step, value, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex justify-between text-xs text-neutral-400 font-medium">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-white bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}

function ControlToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-neutral-400 font-medium cursor-pointer" onClick={() => onChange(!value)}>
      <span>{label}</span>
      <div className={`w-8 h-4 rounded-full relative transition-colors ${value ? 'bg-white' : 'bg-neutral-800'}`}>
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-neutral-900 transition-transform ${value ? 'translate-x-4' : ''}`} />
      </div>
    </div>
  );
}

function ControlColor({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent overflow-hidden"
      />
    </div>
  );
}

function ControlSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-neutral-400 font-medium">
        <span>{label}</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-800 text-neutral-200 text-xs rounded px-2 py-1.5 border border-neutral-700 outline-none focus:border-neutral-500"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function Home() {
  // Global Mode
  const [bgMode, setBgMode] = useState<'dots' | 'bars'>('dots');
  const [gradientFrom, setGradientFrom] = useState('#ff0080'); // pink
  const [gradientTo, setGradientTo] = useState('#7928ca'); // purple
  const [backgroundColor, setBackgroundColor] = useState('#050505'); // background

  // Base Dots State
  const [dotRadius, setDotRadius] = useState(1.2);
  const [dotSpacing, setDotSpacing] = useState(30);
  const [waveSpeed, setWaveSpeed] = useState(0);
  const [maxWaveHeight, setMaxWaveHeight] = useState(20);
  const [interactionRadius, setInteractionRadius] = useState(150);
  const [mouseRepelStrength, setMouseRepelStrength] = useState(15);
  const [waveAngle, setWaveAngle] = useState(0);
  const [waveIntensity, setWaveIntensity] = useState(0);
  const [waveEnabled, setWaveEnabled] = useState(true);
  const [hoverColor, setHoverColor] = useState('#ffffff');

  // Base Bars State
  const [barShape, setBarShape] = useState<BarShape>('valley');
  const [barPulseMode, setBarPulseMode] = useState<'pulse' | 'gentle-pulse' | 'none'>('gentle-pulse');
  const [barNoise, setBarNoise] = useState(true);
  const [barEdgeFeather, setBarEdgeFeather] = useState(false);
  const [barGlow, setBarGlow] = useState(true);
  const [barTopFade, setBarTopFade] = useState(30);
  const [barOpacity, setBarOpacity] = useState(1);

  // Helper to apply preset colors
  const applyPreset = (from: string, to: string) => {
    setGradientFrom(from);
    setGradientTo(to);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      {bgMode === 'dots' ? (
        <CanvasBackground
          dotRadius={dotRadius}
          dotSpacing={dotSpacing}
          waveSpeed={waveSpeed}
          maxWaveHeight={maxWaveHeight}
          interactionRadius={interactionRadius}
          mouseRepelStrength={mouseRepelStrength}
          waveAngle={waveAngle}
          waveIntensity={waveIntensity}
          waveEnabled={waveEnabled}
          hoverColor={hoverColor}
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          backgroundColor={backgroundColor}
        />
      ) : (
        <GradientBars
          shape={barShape}
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          pulseMode={barPulseMode}
          noiseOverlay={barNoise}
          edgeFeather={barEdgeFeather}
          glow={barGlow}
          waveSpeed={waveSpeed}
          waveEnabled={waveEnabled}
          topFade={barTopFade}
          baseOpacity={barOpacity}
          backgroundColor={backgroundColor}
        />
      )}

      {/* Watermark Signature */}
      <div className="absolute bottom-6 left-6 z-10 text-[12px] font-medium tracking-wide" style={{ color: backgroundColor === '#ffffff' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}>
        Experiment by Yamparala Rahul, 2026
      </div>

      {/* Control Panel */}
      <div className="absolute top-6 right-6 z-10 p-5 bg-neutral-950/80 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col gap-5 w-72 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">

        {/* Global Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-white tracking-widest uppercase mb-0">Control Panel</h2>
          </div>

          <div className="flex p-1 bg-neutral-900 rounded-lg">
            <button
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${bgMode === 'dots' ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setBgMode('dots')}
            >
              DOTS
            </button>
            <button
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${bgMode === 'bars' ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => setBgMode('bars')}
            >
              BARS
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Canvas Background</span>
            <div className="flex gap-2">
              <button
                onClick={() => setBackgroundColor('#ffffff')}
                className={`flex-1 text-xs py-1 rounded border transition-colors ${backgroundColor === '#ffffff' ? 'border-neutral-500 text-white' : 'border-neutral-800 text-neutral-500'}`}
              >
                White
              </button>
              <button
                onClick={() => setBackgroundColor('#050505')}
                className={`flex-1 text-xs py-1 rounded border transition-colors ${backgroundColor === '#050505' ? 'border-neutral-500 text-white' : 'border-neutral-800 text-neutral-500'}`}
              >
                Black
              </button>
              <div className="flex-1 flex justify-end">
                <ControlColor label="" value={backgroundColor} onChange={setBackgroundColor} />
              </div>
            </div>

            <hr className="border-neutral-800 my-1" />

            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Global Gradient</span>
            <ControlColor label="Gradient From" value={gradientFrom} onChange={setGradientFrom} />
            <ControlColor label="Gradient To" value={gradientTo} onChange={setGradientTo} />

            <div className="flex gap-2 mt-1">
              <button onClick={() => applyPreset('#ff0080', '#7928ca')} className="w-5 h-5 rounded-full shadow-inner bg-gradient-to-tr from-[#ff0080] to-[#7928ca]" title="Neon Purple" />
              <button onClick={() => applyPreset('#f59e0b', '#ef4444')} className="w-5 h-5 rounded-full shadow-inner bg-gradient-to-tr from-[#f59e0b] to-[#ef4444]" title="Sunset" />
              <button onClick={() => applyPreset('#06b6d4', '#3b82f6')} className="w-5 h-5 rounded-full shadow-inner bg-gradient-to-tr from-[#06b6d4] to-[#3b82f6]" title="Ocean" />
              <button onClick={() => applyPreset('#10b981', '#064e3b')} className="w-5 h-5 rounded-full shadow-inner bg-gradient-to-tr from-[#10b981] to-[#064e3b]" title="Forest" />
            </div>

            <div className="mt-1">
              <ControlColor label="Hover Glow" value={hoverColor} onChange={setHoverColor} />
            </div>
          </div>
        </div>

        <hr className="border-neutral-800" />

        {/* Mode Specific Controls */}
        {bgMode === 'dots' ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-white tracking-widest uppercase mb-0">Dot Wave</h2>
              <ControlToggle label="Active" value={waveEnabled} onChange={setWaveEnabled} />
            </div>
            <ControlSlider label="Dot Size" min={0.5} max={5} step={0.1} value={dotRadius} onChange={setDotRadius} />
            <ControlSlider label="Dot Spacing" min={10} max={60} step={1} value={dotSpacing} onChange={setDotSpacing} />
            <ControlSlider label="Wave Speed" min={0} max={0.01} step={0.0005} value={waveSpeed} onChange={setWaveSpeed} />
            <ControlSlider label="Wave Height" min={0} max={100} step={1} value={maxWaveHeight} onChange={setMaxWaveHeight} />
            <ControlSlider label="Wave Angle" min={0} max={360} step={1} value={waveAngle} onChange={setWaveAngle} />
            <ControlSlider label="Wave Intensity" min={0} max={0.05} step={0.001} value={waveIntensity} onChange={setWaveIntensity} />
            <ControlSlider label="Interaction Radius" min={50} max={500} step={10} value={interactionRadius} onChange={setInteractionRadius} />
            <ControlSlider label="Repel Strength" min={0} max={100} step={1} value={mouseRepelStrength} onChange={setMouseRepelStrength} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-white tracking-widest uppercase mb-1">Gradient Bars</h2>
              <ControlToggle label="Wave Motion" value={waveEnabled} onChange={setWaveEnabled} />
            </div>
            <ControlSlider label="Wave Speed" min={0} max={0.005} step={0.0001} value={waveSpeed} onChange={setWaveSpeed} />
            <ControlSelect
              label="Base Shape"
              value={barShape}
              options={['valley', 'hill', 'rounded-hill', 'wave', 'ramp-left', 'ramp-right', 'flat']}
              onChange={(v) => setBarShape(v as BarShape)}
            />
            <ControlSlider label="Top Fade Gradient %" min={0} max={100} step={1} value={barTopFade} onChange={setBarTopFade} />
            <ControlSlider label="Overall Opacity" min={0.1} max={1} step={0.05} value={barOpacity} onChange={setBarOpacity} />
            <ControlSelect
              label="Opacity Pulse"
              value={barPulseMode}
              options={['none', 'gentle-pulse', 'pulse']}
              onChange={(v) => setBarPulseMode(v as any)}
            />
            <ControlToggle label="Noise Texture" value={barNoise} onChange={setBarNoise} />
            <ControlToggle label="Edge Feather Mask" value={barEdgeFeather} onChange={setBarEdgeFeather} />
            <ControlToggle label="Bottom Glow" value={barGlow} onChange={setBarGlow} />
          </div>
        )}

      </div>

      {/* Some CSS tweaks for scrollbar inside the panel */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </main>
  );
}
