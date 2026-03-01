'use client';

import { useEffect, useRef } from 'react';

interface CanvasBackgroundProps {
    dotRadius: number;
    dotSpacing: number;
    waveSpeed: number;
    maxWaveHeight: number;
    interactionRadius: number;
    mouseRepelStrength: number;
    waveAngle: number;
    waveIntensity: number;
    waveEnabled: boolean;
    hoverColor: string;
}

export default function CanvasBackground(props: CanvasBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const propsRef = useRef(props);

    useEffect(() => {
        propsRef.current = props;
    }, [props]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;
        let dots: { baseX: number; baseY: number; offset: number }[] = [];
        let mouseX = -1000;
        let mouseY = -1000;
        let currentSpacing = propsRef.current.dotSpacing;

        const resize = () => {
            // Set actual size in memory (scaled to account for extra pixel density)
            const scale = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = Math.floor(width * scale);
            canvas.height = Math.floor(height * scale);

            // Normalize coordinate system to use css pixels
            ctx.scale(scale, scale);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            initDots(propsRef.current.dotSpacing);
        };

        const initDots = (spacing: number) => {
            currentSpacing = spacing;
            dots = [];
            const cols = Math.floor(width / spacing) + 2;
            const rows = Math.floor(height / spacing) + 2;
            const offsetX = (width - cols * spacing) / 2;
            const offsetY = (height - rows * spacing) / 2;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const baseX = i * spacing + offsetX;
                    const baseY = j * spacing + offsetY;

                    dots.push({ baseX, baseY, offset: 0 }); // offset computed dynamically based on angle now
                }
            }
        };

        const render = (time: number) => {
            const p = propsRef.current;

            // Re-initialize dots smoothly if spacing changes
            if (p.dotSpacing !== currentSpacing) {
                initDots(p.dotSpacing);
            }

            // Background clear
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);

            // We batch all paths for performance, but since they have different opacities,
            // it's easier to group them or draw individually. Given 1000-3000 dots, drawing individually is fine
            // on modern devices, but we can optimize if needed.

            // Precompute direction vector for the wave angle
            const angleRad = (p.waveAngle * Math.PI) / 180;
            const dirX = Math.cos(angleRad);
            const dirY = Math.sin(angleRad);

            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];

                // Calculate linear phase offset based on directional vector from center
                const cx = dot.baseX - width / 2;
                const cy = dot.baseY - height / 2;
                const dotPosition = cx * dirX + cy * dirY;
                const phaseOffset = dotPosition * p.waveIntensity;

                // Base directional wave motion
                const wave = p.waveEnabled ? Math.sin(phaseOffset - time * (p.waveSpeed * 2)) : 0;
                let yOffset = wave * p.maxWaveHeight;
                let scale = 1 + (wave * 0.3); // vary the size slightly
                let opacity = 0.4 + (wave * 0.2); // base opacity between 0.2 and 0.6

                let r = 180;
                let g = 180;
                let b = 180;

                // Mouse interaction
                const dx = dot.baseX - mouseX;
                const dy = dot.baseY - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < p.interactionRadius) {
                    // Ripple effect based on mouse distance
                    const interactionFactor = 1 - Math.pow(distance / p.interactionRadius, 1.5); // non-linear dropoff

                    yOffset -= interactionFactor * p.mouseRepelStrength;
                    scale += interactionFactor * 1.5;
                    opacity += interactionFactor * 0.4;

                    // Convert target hex color to rgb
                    const hex = p.hoverColor.replace('#', '');
                    const targetR = parseInt(hex.substring(0, 2), 16) || 0;
                    const targetG = parseInt(hex.substring(2, 4), 16) || 255;
                    const targetB = parseInt(hex.substring(4, 6), 16) || 255;

                    // Shift color towards the target hex color based on proximity
                    r = r + (targetR - r) * interactionFactor;
                    g = g + (targetG - g) * interactionFactor;
                    b = b + (targetB - b) * interactionFactor;
                }

                ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Math.max(0.1, Math.min(1, opacity))})`;
                ctx.beginPath();
                ctx.arc(dot.baseX, dot.baseY + yOffset, Math.max(0.2, p.dotRadius * scale), 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleMouseLeave = () => {
            // smooth reset
            mouseX = -1000;
            mouseY = -1000;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        // Initial setup
        resize();
        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 bg-[#050505]"
            style={{ display: 'block', pointerEvents: 'none' }}
        />
    );
}
