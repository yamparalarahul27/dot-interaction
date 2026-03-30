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

  // Map waveSpeed to a pulse duration (slower speed = longer duration)
  // waveSpeed range is 0–0.005; map to ~6s (slow) down to ~1s (fast)
  const pulseDuration = waveSpeed > 0 ? Math.max(1, 6 - (waveSpeed / 0.005) * 5) : 2;

  // Pulse multiplier: >1 to scale up from initial, creating a visible pulse
  const pulseMultiplier = pulseMode === 'pulse' ? 1.4 : pulseMode === 'gentle-pulse' ? 1.15 : 1;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor }}>

      {/* Bars Container — anchored to bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-row"
        style={{
          height: '100%',
          marginLeft: '-1px',
          width: 'calc(100% + 2px)',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          maskImage: edgeFeather ? 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' : 'none',
          WebkitMaskImage: edgeFeather ? 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' : 'none',
        }}
      >
        {bars.map((bar, i) => {
          const animationString = waveEnabled
            ? `0.8s cubic-bezier(0.22, 1, 0.36, 1) ${bar.staggerDelayAppear}s 1 normal both running appearBarY, ${pulseDuration}s ease-in-out ${bar.staggerDelayPulse}s infinite alternate both running pulseBarY`
            : `0.8s cubic-bezier(0.22, 1, 0.36, 1) ${bar.staggerDelayAppear}s 1 normal both running appearBarY`;

          return (
            <div
              key={bar.id}
              style={{
                flex: '1 0 0px',
                alignSelf: 'flex-end',
                height: '100%',
                background: `linear-gradient(${bar.angle}deg, transparent 0%, ${gradientFrom} ${topFade}%, ${gradientTo} 100%)`,
                transformOrigin: 'center bottom',
                animation: animationString,
                boxSizing: 'border-box',
                marginRight: i === bars.length - 1 ? '0px' : '-1px',
                opacity: baseOpacity,
                mixBlendMode: 'normal',
                '--initial-scale': bar.scale,
                '--pulse-multiplier': pulseMultiplier,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Bottom glow — separate layer so it doesn't scale with bars */}
      {glow && (
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${gradientTo}33, transparent)`,
            filter: `blur(20px)`,
          }}
        />
      )}

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
