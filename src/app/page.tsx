'use client';

import { useState } from 'react';
import CanvasBackground from "@/components/CanvasBackground";

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
    <div className="flex flex-col gap-1">
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
    <div className="flex items-center justify-between text-xs text-neutral-400 font-medium cursor-pointer" onClick={() => onChange(!value)}>
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

export default function Home() {
  const [dotRadius, setDotRadius] = useState(1.2);
  const [dotSpacing, setDotSpacing] = useState(30);
  const [waveSpeed, setWaveSpeed] = useState(0.002);
  const [maxWaveHeight, setMaxWaveHeight] = useState(20);
  const [interactionRadius, setInteractionRadius] = useState(150);
  const [mouseRepelStrength, setMouseRepelStrength] = useState(15);
  const [waveAngle, setWaveAngle] = useState(45);
  const [waveIntensity, setWaveIntensity] = useState(0.005);
  const [waveEnabled, setWaveEnabled] = useState(true);
  const [hoverColor, setHoverColor] = useState('#00ffff'); // default cyan

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
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
      />

      {/* Control Panel */}
      <div className="absolute top-6 right-6 z-10 p-5 bg-neutral-950/80 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col gap-5 w-72 shadow-2xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-white tracking-widest uppercase mb-0">Controls</h2>
          <ControlToggle label="Wave Engine" value={waveEnabled} onChange={setWaveEnabled} />
        </div>

        <ControlSlider label="Dot Size" min={0.5} max={5} step={0.1} value={dotRadius} onChange={setDotRadius} />
        <ControlSlider label="Dot Spacing" min={10} max={60} step={1} value={dotSpacing} onChange={setDotSpacing} />
        <ControlSlider label="Wave Speed" min={0} max={0.01} step={0.0005} value={waveSpeed} onChange={setWaveSpeed} />
        <ControlSlider label="Wave Height" min={0} max={100} step={1} value={maxWaveHeight} onChange={setMaxWaveHeight} />
        <ControlSlider label="Wave Angle" min={0} max={360} step={1} value={waveAngle} onChange={setWaveAngle} />
        <ControlSlider label="Wave Intensity" min={0} max={0.05} step={0.001} value={waveIntensity} onChange={setWaveIntensity} />
        <ControlSlider label="Interaction Radius" min={50} max={500} step={10} value={interactionRadius} onChange={setInteractionRadius} />
        <ControlSlider label="Repel Strength" min={0} max={100} step={1} value={mouseRepelStrength} onChange={setMouseRepelStrength} />
        <ControlColor label="Hover Color" value={hoverColor} onChange={setHoverColor} />
      </div>
    </main>
  );
}
