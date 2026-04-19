import Link from 'next/link';
import ShaderCard from '@/components/shaders/ShaderCard';
import { presets } from '@/shaders/registry';

export const metadata = {
  title: 'Shader Gallery',
  description: 'Interactive WebGL shaders with live controls.',
};

export default function ShadersPage() {
  return (
    <main className="h-screen overflow-y-auto custom-scrollbar bg-[#050505]">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-10">
        <header className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Gallery</span>
            <h1 className="text-2xl md:text-3xl font-semibold text-white">Shaders</h1>
            <p className="text-sm text-neutral-400 max-w-xl">
              A growing collection of WebGL shaders with live controls. Tweak the knobs, copy a vibe,
              drop it into your next landing page.
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-medium px-3 py-2 rounded-md border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
          >
            ← Dot wave
          </Link>
        </header>

        <div className="flex flex-col gap-8">
          {presets.map((preset) => (
            <ShaderCard key={preset.id} preset={preset} />
          ))}
        </div>

        <footer className="text-xs text-neutral-600 pt-4 pb-10">
          More shaders coming soon — drop a new entry in{' '}
          <code className="text-neutral-400">src/shaders/registry.ts</code>.
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </main>
  );
}
