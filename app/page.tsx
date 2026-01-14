import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FlashIcon,
  PlayIcon,
  AiMagicIcon,
  CloudUploadIcon,
  SwordIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <HugeiconsIcon icon={FlashIcon} size={20} color="black" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Clash<span className="text-primary">Roast</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Pricing
          </button>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-xs font-medium text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now with Gemini 1.5 Pro Analysis
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
              Turn your Gameplay into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">
                Viral Content
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your Clash Royale replays. Our AI generates Peter Griffin
              commentary, adds zoom-ins, and creates subtitles automatically.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-lg">
                  Start Roasting Free
                </Button>
              </Link>
              <Button variant="secondary" size="lg" className="h-14 px-8 text-lg">
                <HugeiconsIcon icon={PlayIcon} size={20} className="mr-2" />
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-zinc-900/50 border-t border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background border border-border p-8 hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HugeiconsIcon icon={SwordIcon} size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Gameplay Analysis
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our vision AI detects troops, elixir trades, and misplays
                  instantly to create context-aware jokes.
                </p>
              </div>

              <div className="bg-background border border-border p-8 hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HugeiconsIcon icon={AiMagicIcon} size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Smart Editing
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Automatically cuts boring parts, zooms in on critical
                  interactions, and adds SFX.
                </p>
              </div>

              <div className="bg-background border border-border p-8 hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HugeiconsIcon icon={CloudUploadIcon} size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  One-Click Viral
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Export in vertical format for TikTok and Shorts, complete with
                  engaging subtitles.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-zinc-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()} Clash Roast AI. Not affiliated with
          Supercell.
        </p>
      </footer>
    </div>
  );
}
