'use client';

import { useMemo } from 'react';

export type BarShape = 'valley' | 'hill' | 'rounded-hill' | 'wave' | 'ramp-left' | 'ramp-right' | 'flat';

export interface GradientBarsProps {
  shape: BarShape;
  gradientFrom: string;
  gradientTo: string;
  pulseMode: 'pulse' | 'gentle-pulse' | 'none';
  noiseOverlay: boolean;
  edgeFeather: boolean;
  glow: boolean;
  barCount?: number;
  waveSpeed?: number;
  waveEnabled?: boolean;
  topFade?: number;
  baseOpacity?: number;
  backgroundColor?: string;
}

export default function GradientBars({
  shape,
  gradientFrom,
  gradientTo,
  pulseMode,
  noiseOverlay,
  edgeFeather,
  glow,
  barCount = 24, // Matching the ~24 count in the reference snippet closely
  waveSpeed = 0.002,
  waveEnabled = true,
  topFade = 30,
  baseOpacity = 1,
  backgroundColor = '#050505',
}: GradientBarsProps) {

  // Calculate relative heights and CSS properties for the selected shape
  const bars = useMemo(() => {
    return Array.from({ length: barCount }).map((_, i) => {
      const normalized = i / (barCount - 1); // 0 to 1
      let scale = 1;

      switch (shape) {
        case 'valley':
          // Dip in the middle
          scale = Math.abs(normalized - 0.5) * 1.5 + 0.3;
          break;
        case 'hill':
          // Peak in the middle
          scale = 1 - Math.abs(normalized - 0.5) * 1.5;
          break;
        case 'rounded-hill':
          scale = Math.sin(normalized * Math.PI) ** 0.8;
          break;
        case 'wave':
          scale = (Math.sin(normalized * Math.PI * 2) + 1) / 2;
          break;
        case 'ramp-right':
          scale = normalized;
          break;
        case 'ramp-left':
          scale = 1 - normalized;
          break;
        case 'flat':
          scale = 1;
          break;
      }

      // Ensure a minimum height
      scale = Math.max(0.1, Math.min(1, scale));

      // Recreate the rotation/gradient skew from the reference snippet (optional visual flair)
      // Reference used angles from -32deg to 32deg. We can map that based on normalized position.
      const angle = -32 + (normalized * 64);

      // Stagger timings from reference: `1.76s` down to `0s` and back up, or simple linear stagger.
      // Easiest is linear left-to-right stagger
      const staggerDelayAppear = (barCount - i) * 0.08;
      const staggerDelayPulse = staggerDelayAppear + 0.8; // start pulse after appear

      return {
        id: i,
        scale,
        angle,
        staggerDelayAppear,
        staggerDelayPulse
      };
    });
  }, [shape, barCount]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden flex flex-col justify-end" style={{ backgroundColor }}>

      {/* Bars Container perfectly matching reference structure */}
      <div
        className="absolute inset-0 flex flex-row w-[calc(100%+2px)] h-full bottom-0 -ml-[1px]"
        style={{
          gap: 0,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          // Apply edge feather mask if requested
          maskImage: edgeFeather ? 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' : 'none',
          WebkitMaskImage: edgeFeather ? 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' : 'none',
        }}
      >
        {bars.map((bar, i) => {
          // Reconstruct the exact inline style string logic from the reference HTML.
          // We use global from/to instead of the multi-stop oklch for simplicity unless requested.
          // But we simulate the angle shift.

          // Generate standard CSS animations for appear/pulse based on toggles
          // Flow/Wave motion is handled by the staggered infinite alternate pulse.
          const animationString = waveEnabled
            ? `0.8s cubic-bezier(0.22, 1, 0.36, 1) ${bar.staggerDelayAppear}s 1 normal both running appearBarY, 2s ease-in-out ${bar.staggerDelayPulse}s infinite alternate none running pulseBarY`
            : `0.8s cubic-bezier(0.22, 1, 0.36, 1) ${bar.staggerDelayAppear}s 1 normal both running appearBarY`;

          return (
            <div
              key={bar.id}
              style={{
                flex: '1 0 0px',
                height: '100%',
                // Include transparent fade at the top (0%) shifting down based on topFade control
                background: `linear-gradient(${bar.angle}deg, transparent 0%, ${gradientFrom} ${topFade}%, ${gradientTo} 100%)`,
                transformOrigin: 'center bottom',
                transform: `scaleY(${bar.scale})`,
                animation: animationString,
                boxSizing: 'border-box',
                marginRight: i === bars.length - 1 ? '0px' : '-1px', // overlap slightly to avoid antialiasing gaps
                opacity: baseOpacity,
                mixBlendMode: 'normal',
                boxShadow: glow ? `0 0 40px -10px ${gradientTo}` : 'none',
                // CSS variables used by the keyframes
                '--initial-scale': bar.scale,
                '--pulse-multiplier': pulseMode === 'pulse' ? 0.4 : pulseMode === 'gentle-pulse' ? 0.7 : 1,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Optional Noise Overlay */}
      {noiseOverlay && (
        <div
          className="absolute inset-0 z-10 opacity-30 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />
      )}
    </div>
  );
}
