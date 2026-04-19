'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import CanvasBackground from "@/components/CanvasBackground";
import GradientBars, { BarShape } from "@/components/GradientBars";
import ShaderBackground from "@/components/ShaderBackground";

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

type BgMode = 'dots' | 'bars' | 'shader';

interface PanelContentsProps {
  bgMode: BgMode; setBgMode: (v: BgMode) => void;
  backgroundColor: string; setBackgroundColor: (v: string) => void;
  gradientFrom: string; setGradientFrom: (v: string) => void;
  gradientTo: string; setGradientTo: (v: string) => void;
  hoverColor: string; setHoverColor: (v: string) => void;
  applyPreset: (from: string, to: string) => void;
  copyStatus: 'idle' | 'ok' | 'err'; handleCopyConfig: () => void;
  pasteStatus: 'idle' | 'ok' | 'err'; handlePasteConfig: () => void;
  waveEnabled: boolean; setWaveEnabled: (v: boolean) => void;
  dotRadius: number; setDotRadius: (v: number) => void;
  dotSpacing: number; setDotSpacing: (v: number) => void;
  waveSpeed: number; setWaveSpeed: (v: number) => void;
  maxWaveHeight: number; setMaxWaveHeight: (v: number) => void;
  waveAngle: number; setWaveAngle: (v: number) => void;
  waveIntensity: number; setWaveIntensity: (v: number) => void;
  interactionRadius: number; setInteractionRadius: (v: number) => void;
  mouseRepelStrength: number; setMouseRepelStrength: (v: number) => void;
  barShape: BarShape; setBarShape: (v: BarShape) => void;
  barTopFade: number; setBarTopFade: (v: number) => void;
  barOpacity: number; setBarOpacity: (v: number) => void;
  barPulseMode: 'pulse' | 'gentle-pulse' | 'none'; setBarPulseMode: (v: 'pulse' | 'gentle-pulse' | 'none') => void;
  barNoise: boolean; setBarNoise: (v: boolean) => void;
  barEdgeFeather: boolean; setBarEdgeFeather: (v: boolean) => void;
  barGlow: boolean; setBarGlow: (v: boolean) => void;
  shaderEnabled: boolean; setShaderEnabled: (v: boolean) => void;
  shaderSpeed: number; setShaderSpeed: (v: number) => void;
  shaderScale: number; setShaderScale: (v: number) => void;
  shaderIntensity: number; setShaderIntensity: (v: number) => void;
  shaderDistortion: number; setShaderDistortion: (v: number) => void;
  shaderGrain: boolean; setShaderGrain: (v: boolean) => void;
}

function PanelContents(p: PanelContentsProps) {
  return (
    <>
      {/* Global Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-white tracking-widest uppercase mb-0 hidden md:block">Control Panel</h2>
          <div className="flex gap-1.5">
            <button
              onClick={p.handleCopyConfig}
              title="Copy Config"
              className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md border transition-all ${
                p.copyStatus === 'ok'
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : p.copyStatus === 'err'
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
              }`}
            >
              {p.copyStatus === 'ok' ? '✓' : p.copyStatus === 'err' ? '✗' : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              )}
              {p.copyStatus === 'ok' ? 'Copied!' : p.copyStatus === 'err' ? 'Failed' : 'Copy'}
            </button>
            <button
              onClick={p.handlePasteConfig}
              title="Paste Config"
              className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md border transition-all ${
                p.pasteStatus === 'ok'
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : p.pasteStatus === 'err'
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
              }`}
            >
              {p.pasteStatus === 'ok' ? '✓' : p.pasteStatus === 'err' ? '✗' : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1"/>
                  <line x1="12" y1="11" x2="12" y2="17"/>
                  <line x1="9" y1="14" x2="15" y2="14"/>
                </svg>
              )}
              {p.pasteStatus === 'ok' ? 'Applied!' : p.pasteStatus === 'err' ? 'Invalid' : 'Paste'}
            </button>
          </div>
        </div>

        <div className="flex p-1 bg-neutral-900 rounded-lg">
          <button
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${p.bgMode === 'dots' ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-500 hover:text-neutral-300'}`}
            onClick={() => p.setBgMode('dots')}
          >
            DOTS
          </button>
          <button
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${p.bgMode === 'bars' ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-500 hover:text-neutral-300'}`}
            onClick={() => p.setBgMode('bars')}
          >
            BARS
          </button>
          <button
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${p.bgMode === 'shader' ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-500 hover:text-neutral-300'}`}
            onClick={() => p.setBgMode('shader')}
          >
            SHADER
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Canvas Background</span>
          <div className="flex gap-2">
            <button
              onClick={() => p.setBackgroundColor('#ffffff')}
              className={`flex-1 text-xs py-1 rounded border transition-colors ${p.backgroundColor === '#ffffff' ? 'border-neutral-500 text-white' : 'border-neutral-800 text-neutral-500'}`}
            >
              White
            </button>
            <button
              onClick={() => p.setBackgroundColor('#050505')}
              className={`flex-1 text-xs py-1 rounded border transition-colors ${p.backgroundColor === '#050505' ? 'border-neutral-500 text-white' : 'border-neutral-800 text-neutral-500'}`}
            >
              Black
            </button>
            <div className="flex-1 flex justify-end">
              <ControlColor label="" value={p.backgroundColor} onChange={p.setBackgroundColor} />
            </div>
          </div>

          <hr className="border-neutral-800 my-1" />

          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Global Gradient</span>
          <ControlColor label="Gradient From" value={p.gradientFrom} onChange={p.setGradientFrom} />
          <ControlColor label="Gradient To" value={p.gradientTo} onChange={p.setGradientTo} />

          <div className="flex gap-2 mt-1">
            <button onClick={() => p.applyPreset('#ff0080', '#7928ca')} className="w-5 h-5 rounded-full shadow-inner bg-gradient-to-tr from-[#ff0080] to-[#7928ca]" title="Neon Purple" />
            <button onClick={() => p.applyPreset('#f59e0b', '#ef4444')} className="w-5 h-5 rounded-full shadow-inner bg-gradient-to-tr from-[#f59e0b] to-[#ef4444]" title="Sunset" />
            <button onClick={() => p.applyPreset('#06b6d4', '#3b82f6')} className="w-5 h-5 rounded-full shadow-inner bg-gradient-to-tr from-[#06b6d4] to-[#3b82f6]" title="Ocean" />
            <button onClick={() => p.applyPreset('#10b981', '#064e3b')} className="w-5 h-5 rounded-full shadow-inner bg-gradient-to-tr from-[#10b981] to-[#064e3b]" title="Forest" />
          </div>

          <div className="mt-1">
            <ControlColor label="Hover Glow" value={p.hoverColor} onChange={p.setHoverColor} />
          </div>
        </div>
      </div>

      <hr className="border-neutral-800" />

      {/* Mode Specific Controls */}
      {p.bgMode === 'shader' ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-white tracking-widest uppercase mb-0">Shader Flow</h2>
            <ControlToggle label="Animate" value={p.shaderEnabled} onChange={p.setShaderEnabled} />
          </div>
          <ControlSlider label="Flow Speed" min={0} max={3} step={0.05} value={p.shaderSpeed} onChange={p.setShaderSpeed} />
          <ControlSlider label="Noise Scale" min={0.5} max={6} step={0.1} value={p.shaderScale} onChange={p.setShaderScale} />
          <ControlSlider label="Intensity" min={0} max={1} step={0.01} value={p.shaderIntensity} onChange={p.setShaderIntensity} />
          <ControlSlider label="Distortion" min={0} max={6} step={0.05} value={p.shaderDistortion} onChange={p.setShaderDistortion} />
          <ControlToggle label="Film Grain" value={p.shaderGrain} onChange={p.setShaderGrain} />
        </div>
      ) : p.bgMode === 'dots' ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-white tracking-widest uppercase mb-0">Dot Wave</h2>
            <ControlToggle label="Active" value={p.waveEnabled} onChange={p.setWaveEnabled} />
          </div>
          <ControlSlider label="Dot Size" min={0.5} max={5} step={0.1} value={p.dotRadius} onChange={p.setDotRadius} />
          <ControlSlider label="Dot Spacing" min={10} max={60} step={1} value={p.dotSpacing} onChange={p.setDotSpacing} />
          <ControlSlider label="Wave Speed" min={0} max={0.01} step={0.0005} value={p.waveSpeed} onChange={p.setWaveSpeed} />
          <ControlSlider label="Wave Height" min={0} max={100} step={1} value={p.maxWaveHeight} onChange={p.setMaxWaveHeight} />
          <ControlSlider label="Wave Angle" min={0} max={360} step={1} value={p.waveAngle} onChange={p.setWaveAngle} />
          <ControlSlider label="Wave Intensity" min={0} max={0.05} step={0.001} value={p.waveIntensity} onChange={p.setWaveIntensity} />
          <ControlSlider label="Interaction Radius" min={50} max={500} step={10} value={p.interactionRadius} onChange={p.setInteractionRadius} />
          <ControlSlider label="Repel Strength" min={0} max={100} step={1} value={p.mouseRepelStrength} onChange={p.setMouseRepelStrength} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-white tracking-widest uppercase mb-1">Gradient Bars</h2>
            <ControlToggle label="Wave Motion" value={p.waveEnabled} onChange={p.setWaveEnabled} />
          </div>
          <ControlSlider label="Wave Speed" min={0} max={0.005} step={0.0001} value={p.waveSpeed} onChange={p.setWaveSpeed} />
          <ControlSelect
            label="Base Shape"
            value={p.barShape}
            options={['valley', 'hill', 'rounded-hill', 'wave', 'ramp-left', 'ramp-right', 'flat']}
            onChange={(v) => p.setBarShape(v as BarShape)}
          />
          <ControlSlider label="Top Fade Gradient %" min={0} max={100} step={1} value={p.barTopFade} onChange={p.setBarTopFade} />
          <ControlSlider label="Overall Opacity" min={0.1} max={1} step={0.05} value={p.barOpacity} onChange={p.setBarOpacity} />
          <ControlSelect
            label="Opacity Pulse"
            value={p.barPulseMode}
            options={['none', 'gentle-pulse', 'pulse']}
            onChange={(v) => p.setBarPulseMode(v as 'pulse' | 'gentle-pulse' | 'none')}
          />
          <ControlToggle label="Noise Texture" value={p.barNoise} onChange={p.setBarNoise} />
          <ControlToggle label="Edge Feather Mask" value={p.barEdgeFeather} onChange={p.setBarEdgeFeather} />
          <ControlToggle label="Bottom Glow" value={p.barGlow} onChange={p.setBarGlow} />
        </div>
      )}
    </>
  );
}

export default function Home() {
  // Global Mode
  const [bgMode, setBgMode] = useState<BgMode>('dots');
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

  // Base Shader State
  const [shaderEnabled, setShaderEnabled] = useState(true);
  const [shaderSpeed, setShaderSpeed] = useState(0.6);
  const [shaderScale, setShaderScale] = useState(2);
  const [shaderIntensity, setShaderIntensity] = useState(0.55);
  const [shaderDistortion, setShaderDistortion] = useState(2.2);
  const [shaderGrain, setShaderGrain] = useState(false);

  // Helper to apply preset colors
  const applyPreset = (from: string, to: string) => {
    setGradientFrom(from);
    setGradientTo(to);
  };

  // Bottom Sheet State
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartOpen = useRef(false);

  const handleSheetTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartOpen.current = sheetOpen;
  }, [sheetOpen]);

  const handleSheetTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - dragStartY.current;
    const threshold = 50;
    if (dragStartOpen.current && deltaY > threshold) {
      setSheetOpen(false);
    } else if (!dragStartOpen.current && deltaY < -threshold) {
      setSheetOpen(true);
    }
  }, []);

  // Close sheet on desktop resize
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = () => { if (mq.matches) setSheetOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Copy / Paste Config
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [pasteStatus, setPasteStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  const getConfig = useCallback(() => ({
    bgMode,
    gradientFrom, gradientTo, backgroundColor,
    dotRadius, dotSpacing, waveSpeed, maxWaveHeight,
    interactionRadius, mouseRepelStrength, waveAngle,
    waveIntensity, waveEnabled, hoverColor,
    barShape, barPulseMode, barNoise, barEdgeFeather,
    barGlow, barTopFade, barOpacity,
    shaderEnabled, shaderSpeed, shaderScale,
    shaderIntensity, shaderDistortion, shaderGrain,
  }), [
    bgMode, gradientFrom, gradientTo, backgroundColor,
    dotRadius, dotSpacing, waveSpeed, maxWaveHeight,
    interactionRadius, mouseRepelStrength, waveAngle,
    waveIntensity, waveEnabled, hoverColor,
    barShape, barPulseMode, barNoise, barEdgeFeather,
    barGlow, barTopFade, barOpacity,
    shaderEnabled, shaderSpeed, shaderScale,
    shaderIntensity, shaderDistortion, shaderGrain,
  ]);

  const handleCopyConfig = useCallback(async () => {
    try {
      const json = JSON.stringify(getConfig(), null, 2);
      await navigator.clipboard.writeText(json);
      setCopyStatus('ok');
    } catch {
      setCopyStatus('err');
    } finally {
      setTimeout(() => setCopyStatus('idle'), 1800);
    }
  }, [getConfig]);

  const handlePasteConfig = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cfg = JSON.parse(text.trim());
      if (cfg.bgMode) setBgMode(cfg.bgMode);
      if (cfg.gradientFrom) setGradientFrom(cfg.gradientFrom);
      if (cfg.gradientTo) setGradientTo(cfg.gradientTo);
      if (cfg.backgroundColor) setBackgroundColor(cfg.backgroundColor);
      if (cfg.dotRadius !== undefined) setDotRadius(cfg.dotRadius);
      if (cfg.dotSpacing !== undefined) setDotSpacing(cfg.dotSpacing);
      if (cfg.waveSpeed !== undefined) setWaveSpeed(cfg.waveSpeed);
      if (cfg.maxWaveHeight !== undefined) setMaxWaveHeight(cfg.maxWaveHeight);
      if (cfg.interactionRadius !== undefined) setInteractionRadius(cfg.interactionRadius);
      if (cfg.mouseRepelStrength !== undefined) setMouseRepelStrength(cfg.mouseRepelStrength);
      if (cfg.waveAngle !== undefined) setWaveAngle(cfg.waveAngle);
      if (cfg.waveIntensity !== undefined) setWaveIntensity(cfg.waveIntensity);
      if (cfg.waveEnabled !== undefined) setWaveEnabled(cfg.waveEnabled);
      if (cfg.hoverColor) setHoverColor(cfg.hoverColor);
      if (cfg.barShape) setBarShape(cfg.barShape);
      if (cfg.barPulseMode) setBarPulseMode(cfg.barPulseMode);
      if (cfg.barNoise !== undefined) setBarNoise(cfg.barNoise);
      if (cfg.barEdgeFeather !== undefined) setBarEdgeFeather(cfg.barEdgeFeather);
      if (cfg.barGlow !== undefined) setBarGlow(cfg.barGlow);
      if (cfg.barTopFade !== undefined) setBarTopFade(cfg.barTopFade);
      if (cfg.barOpacity !== undefined) setBarOpacity(cfg.barOpacity);
      if (cfg.shaderEnabled !== undefined) setShaderEnabled(cfg.shaderEnabled);
      if (cfg.shaderSpeed !== undefined) setShaderSpeed(cfg.shaderSpeed);
      if (cfg.shaderScale !== undefined) setShaderScale(cfg.shaderScale);
      if (cfg.shaderIntensity !== undefined) setShaderIntensity(cfg.shaderIntensity);
      if (cfg.shaderDistortion !== undefined) setShaderDistortion(cfg.shaderDistortion);
      if (cfg.shaderGrain !== undefined) setShaderGrain(cfg.shaderGrain);
      setPasteStatus('ok');
    } catch {
      setPasteStatus('err');
    } finally {
      setTimeout(() => setPasteStatus('idle'), 1800);
    }
  }, []);

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
      ) : bgMode === 'bars' ? (
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
      ) : (
        <ShaderBackground
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          backgroundColor={backgroundColor}
          shaderSpeed={shaderSpeed}
          shaderScale={shaderScale}
          shaderIntensity={shaderIntensity}
          shaderDistortion={shaderDistortion}
          shaderEnabled={shaderEnabled}
          shaderGrain={shaderGrain}
        />
      )}

      {/* Watermark Signature */}
      <div className="absolute bottom-20 md:bottom-6 left-6 z-10 text-[12px] font-medium tracking-wide flex flex-col gap-1" style={{ color: backgroundColor === '#ffffff' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}>
        <span>Experiment by Yamparala Rahul, 2026</span>
        <span className="opacity-70 text-[10px]">Last updated: March 18, 2026</span>
      </div>

      {/* Desktop Control Panel — hidden on mobile */}
      <div className="hidden md:flex absolute top-6 right-6 z-10 p-5 bg-neutral-950/80 backdrop-blur-xl rounded-2xl border border-white/10 flex-col gap-5 w-72 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <PanelContents
          bgMode={bgMode} setBgMode={setBgMode}
          backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
          gradientFrom={gradientFrom} setGradientFrom={setGradientFrom}
          gradientTo={gradientTo} setGradientTo={setGradientTo}
          hoverColor={hoverColor} setHoverColor={setHoverColor}
          applyPreset={applyPreset}
          copyStatus={copyStatus} handleCopyConfig={handleCopyConfig}
          pasteStatus={pasteStatus} handlePasteConfig={handlePasteConfig}
          waveEnabled={waveEnabled} setWaveEnabled={setWaveEnabled}
          dotRadius={dotRadius} setDotRadius={setDotRadius}
          dotSpacing={dotSpacing} setDotSpacing={setDotSpacing}
          waveSpeed={waveSpeed} setWaveSpeed={setWaveSpeed}
          maxWaveHeight={maxWaveHeight} setMaxWaveHeight={setMaxWaveHeight}
          waveAngle={waveAngle} setWaveAngle={setWaveAngle}
          waveIntensity={waveIntensity} setWaveIntensity={setWaveIntensity}
          interactionRadius={interactionRadius} setInteractionRadius={setInteractionRadius}
          mouseRepelStrength={mouseRepelStrength} setMouseRepelStrength={setMouseRepelStrength}
          barShape={barShape} setBarShape={setBarShape}
          barTopFade={barTopFade} setBarTopFade={setBarTopFade}
          barOpacity={barOpacity} setBarOpacity={setBarOpacity}
          barPulseMode={barPulseMode} setBarPulseMode={setBarPulseMode}
          barNoise={barNoise} setBarNoise={setBarNoise}
          barEdgeFeather={barEdgeFeather} setBarEdgeFeather={setBarEdgeFeather}
          barGlow={barGlow} setBarGlow={setBarGlow}
          shaderEnabled={shaderEnabled} setShaderEnabled={setShaderEnabled}
          shaderSpeed={shaderSpeed} setShaderSpeed={setShaderSpeed}
          shaderScale={shaderScale} setShaderScale={setShaderScale}
          shaderIntensity={shaderIntensity} setShaderIntensity={setShaderIntensity}
          shaderDistortion={shaderDistortion} setShaderDistortion={setShaderDistortion}
          shaderGrain={shaderGrain} setShaderGrain={setShaderGrain}
        />
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50">
        {/* Backdrop */}
        {sheetOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />
        )}

        {/* Sheet */}
        <div
          ref={sheetRef}
          onTouchStart={handleSheetTouchStart}
          onTouchEnd={handleSheetTouchEnd}
          className={`relative bg-neutral-950/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
            sheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'
          }`}
          style={{ maxHeight: '85vh' }}
        >
          {/* Drag Handle + Peek Header */}
          <div
            className="flex flex-col items-center pt-2 pb-3 px-5 cursor-pointer"
            onClick={() => setSheetOpen(o => !o)}
          >
            <div className="w-10 h-1 rounded-full bg-neutral-600 mb-3" />
            <div className="flex items-center justify-between w-full">
              <h2 className="text-sm font-semibold text-white tracking-widest uppercase">Control Panel</h2>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`text-neutral-400 transition-transform duration-300 ${sheetOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto custom-scrollbar px-5 pb-8" style={{ maxHeight: 'calc(85vh - 56px)' }}>
            <div className="flex flex-col gap-5">
              <PanelContents
                bgMode={bgMode} setBgMode={setBgMode}
                backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor}
                gradientFrom={gradientFrom} setGradientFrom={setGradientFrom}
                gradientTo={gradientTo} setGradientTo={setGradientTo}
                hoverColor={hoverColor} setHoverColor={setHoverColor}
                applyPreset={applyPreset}
                copyStatus={copyStatus} handleCopyConfig={handleCopyConfig}
                pasteStatus={pasteStatus} handlePasteConfig={handlePasteConfig}
                waveEnabled={waveEnabled} setWaveEnabled={setWaveEnabled}
                dotRadius={dotRadius} setDotRadius={setDotRadius}
                dotSpacing={dotSpacing} setDotSpacing={setDotSpacing}
                waveSpeed={waveSpeed} setWaveSpeed={setWaveSpeed}
                maxWaveHeight={maxWaveHeight} setMaxWaveHeight={setMaxWaveHeight}
                waveAngle={waveAngle} setWaveAngle={setWaveAngle}
                waveIntensity={waveIntensity} setWaveIntensity={setWaveIntensity}
                interactionRadius={interactionRadius} setInteractionRadius={setInteractionRadius}
                mouseRepelStrength={mouseRepelStrength} setMouseRepelStrength={setMouseRepelStrength}
                barShape={barShape} setBarShape={setBarShape}
                barTopFade={barTopFade} setBarTopFade={setBarTopFade}
                barOpacity={barOpacity} setBarOpacity={setBarOpacity}
                barPulseMode={barPulseMode} setBarPulseMode={setBarPulseMode}
                barNoise={barNoise} setBarNoise={setBarNoise}
                barEdgeFeather={barEdgeFeather} setBarEdgeFeather={setBarEdgeFeather}
                barGlow={barGlow} setBarGlow={setBarGlow}
                shaderEnabled={shaderEnabled} setShaderEnabled={setShaderEnabled}
                shaderSpeed={shaderSpeed} setShaderSpeed={setShaderSpeed}
                shaderScale={shaderScale} setShaderScale={setShaderScale}
                shaderIntensity={shaderIntensity} setShaderIntensity={setShaderIntensity}
                shaderDistortion={shaderDistortion} setShaderDistortion={setShaderDistortion}
                shaderGrain={shaderGrain} setShaderGrain={setShaderGrain}
              />
            </div>
          </div>
        </div>
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
