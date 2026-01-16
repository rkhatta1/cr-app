'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FlashIcon,
  PlayIcon,
  SwordIcon,
  MotionIcon,
  CpuIcon,
  LayersIcon,
  ArrowRight01Icon,
  UserIcon,
  Loading03Icon,
  GithubIcon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [videosLoaded, setVideosLoaded] = useState({ before: false, after: false });

  useEffect(() => {
    // Preload videos
    const beforeVideo = document.createElement('video');
    const afterVideo = document.createElement('video');

    beforeVideo.src = '/before.mp4';
    afterVideo.src = '/after.mp4';

    beforeVideo.onloadeddata = () => {
      setVideosLoaded(prev => ({ ...prev, before: true }));
    };

    afterVideo.onloadeddata = () => {
      setVideosLoaded(prev => ({ ...prev, after: true }));
    };

    beforeVideo.load();
    afterVideo.load();

    // Timeout fallback - show page after 5 seconds regardless
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (videosLoaded.before && videosLoaded.after) {
      setIsLoading(false);
    }
  }, [videosLoaded]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-white">
        <div className="w-10 h-10 bg-primary flex items-center justify-center mb-4">
          <HugeiconsIcon icon={FlashIcon} className="text-black w-6 h-6 fill-black" />
        </div>
        <HugeiconsIcon icon={Loading03Icon} size={48} className="animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary selection:text-black">
      {/* Boxy Header */}
      <header className="h-20 border-b w-full border-zinc-800 flex items-center justify-center px-8 sticky top-0 bg-background/90 backdrop-blur-md z-[100]">
        <div className="flex flex-1 flex-row max-w-7xl items-center justify-between mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <HugeiconsIcon icon={FlashIcon} className="text-black w-6 h-6 fill-black" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white uppercase italic">
              CLASH<span className="text-primary">ROAST</span>
            </span>
          </div>
          <div className="flex items-center gap-8 mr-0">
            <Link href="/login">
              <Button size="sm" className='hover:bg-black hover:text-primary border-primary border-2 cursor-pointer'>Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-40 px-6 grid-bg border-b border-zinc-800 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1 border border-zinc-800 bg-zinc-950 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-12">
              <span className="w-2 h-2 bg-primary animate-pulse" />
              Public Beta Live
            </div>

            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tight mb-8 leading-[0.9] uppercase italic">
              AI ROASTS FOR <br/>
              <span className="text-primary">YOUR REPLAYS</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-medium tracking-tight leading-relaxed">
              We analyze your Clash Royale gameplay and generate high-energy commentary from iconic characters, smart zooms, and viral captions in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto min-w-[240px] hover:bg-black hover:text-primary hover:border-primary hover:border-2 cursor-pointer">
                  Start My First Roast
                </Button>
              </Link>
            </div>

            {/* Before/After Visual - Vertical 9:16 Style */}
            <div className="relative mt-12 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">

                {/* Left: Raw Vertical */}
                <div className="relative group">
                  <div className="absolute -top-12 left-0 right-0 text-center">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-[0.2em] bg-background px-2 border border-zinc-800 py-1">Raw Footage</span>
                  </div>
                  <div className="w-[280px] h-[500px] bg-zinc-900 border-2 border-zinc-800 p-2 relative shadow-2xl">
                    <video
                      className="w-full h-full object-cover grayscale opacity-70"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src="/before.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center">
                   <HugeiconsIcon icon={ArrowRight01Icon} className="w-8 h-8 text-zinc-700" />
                </div>

                {/* Right: Edited Vertical */}
                <div className="relative group">
                  <div className="absolute -top-12 left-0 right-0 text-center">
                    <span className="text-[10px] font-bold uppercase text-primary tracking-[0.2em] bg-background px-2 border border-primary py-1">Viral Output</span>
                  </div>
                  <div className="w-[300px] h-[540px] bg-black border-2 border-primary p-1 relative shadow-[0_0_50px_-12px_rgba(170,255,0,0.3)] z-10 transform md:-translate-y-4">
                     <a href="https://youtube.com/shorts/lZUeuy1Brqo?feature=share" target='_blank' >
                     <video
                       className="w-full h-full object-cover"
                       autoPlay
                       loop
                       muted
                       playsInline
                     >
                       <source src="/after.mp4" type="video/mp4" />
                       Your browser does not support the video tag.
                     </video>
                     </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* BUILT BY GAMERS SECTION */}
        <section id="features" className="py-32 px-6 bg-[#09090b]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-24">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">
                Built by gamers, <br/>
                <span className="text-primary">for gamers.</span>
              </h2>
              <p className="text-zinc-500 max-w-xl font-medium">We know it sounds too good to be true, but our vision engine handles the heavy lifting.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800 border border-zinc-800">
              <div className="bg-background p-12 hover:bg-zinc-900/50 transition-colors group">
                <HugeiconsIcon icon={MotionIcon} className="w-10 h-10 text-primary mb-8" />
                <h3 className="text-2xl font-bold text-white uppercase italic mb-4">Workflow-First</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Upload, roast, and download. No complex timelines or keyframe matching. We handle the transitions and SFX automatically based on game state.
                </p>
              </div>

              <div className="bg-background p-12 hover:bg-zinc-900/50 transition-colors group">
                <HugeiconsIcon icon={CpuIcon} className="w-10 h-10 text-primary mb-8" />
                <h3 className="text-2xl font-bold text-white uppercase italic mb-4">Context-Aware</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Our AI doesn't just watch; it understands. It detects negative elixir trades, failed rocket placements, and bridge-spamming to generate precise roasts.
                </p>
              </div>

              <div className="bg-background p-12 hover:bg-zinc-900/50 transition-colors group">
                <HugeiconsIcon icon={LayersIcon} className="w-10 h-10 text-primary mb-8" />
                <h3 className="text-2xl font-bold text-white uppercase italic mb-4">Match your style</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Choose between sarcastic, aggressive, or iconic personality styles. Each generation is unique to your specific match events.
                </p>
              </div>

              <div className="bg-background p-12 hover:bg-zinc-900/50 transition-colors group">
                <HugeiconsIcon icon={UserIcon} className="text-primary w-10 h-10 mb-8" />
                <h3 className="text-2xl font-bold text-white uppercase italic mb-4">Your fav characters</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Select from a growing roster of legendary voices. From animated dads to gritty action heroes, pick the personality that fits your playstyle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* THE PROCESS REVEAL SECTION - Staggered Stack Effect */}
        <section id="process" className="py-40 px-6 bg-zinc-950 relative">
          <div className="max-w-6xl mx-auto">
            <div className="mb-24 text-center">
              <h2 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-6">
                But, how we are <br/>
                <span className="text-primary">able to do it?</span>
              </h2>
            </div>

            <div className="space-y-0 relative min-h-[1200px]">
              {/* Step 1 */}
              <div className="stack-card bg-surface border-2 border-zinc-800 p-8 md:p-12 shadow-[0_-1px_0_0_rgba(255,255,255,0.1)] mb-12" style={{ top: '100px' }}>
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1 space-y-6">
                    <span className="bg-primary text-black font-mono text-xs font-bold px-3 py-1">PHASE 01</span>
                    <h3 className="text-3xl font-black text-white uppercase italic">Context Analysis</h3>
                    <p className="text-zinc-500 font-medium">
                      We process your video through our proprietary vision model. We analyze every card played, elixir bar levels, and tower HP to understand the story of the match.
                    </p>
                    <ul className="space-y-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                      <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary" /> Troop Identification</li>
                      <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary" /> Elixir Counter Tracking</li>
                      <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary" /> Misplay Detection</li>
                    </ul>
                  </div>
                  <div className="flex-1 w-full aspect-video bg-zinc-900 border border-zinc-800 p-6 flex items-center justify-center overflow-hidden">
                    <div className="w-full space-y-4">
                      <div className="h-2 bg-zinc-800 w-full" />
                      <div className="h-2 bg-primary w-[70%]" />
                      <div className="h-2 bg-zinc-800 w-full" />
                      <p className="font-mono text-[9px] text-primary">SCANNED_INTERACTIONS: 142</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 - Staggered top for stacking */}
              <div className="stack-card bg-surface border-2 border-zinc-800 p-8 md:p-12 shadow-[0_-1px_0_0_rgba(255,255,255,0.1)] mb-12" style={{ top: '120px' }}>
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1 order-2 md:order-1 w-full aspect-video bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-center">
                     <p className="text-primary font-mono text-[10px] mb-2">&gt; GENERATING_ROAST_SCRIPT...</p>
                     <p className="text-zinc-600 font-mono text-[10px]">"MODEL: HEHEHE! Look at that hog placement..."</p>
                     <p className="text-zinc-600 font-mono text-[10px]">"MODEL: This guy definitely bridge-spams e-barbs..."</p>
                  </div>
                  <div className="flex-1 order-1 md:order-2 space-y-6">
                    <span className="bg-primary text-black font-mono text-xs font-bold px-3 py-1">PHASE 02</span>
                    <h3 className="text-3xl font-black text-white uppercase italic">Scripting & Voice</h3>
                    <p className="text-zinc-500 font-medium">
                      Gemini 3 Pro takes the gameplay logs and writes a comedic script tailored to the action. This script is then synthesized into the authentic voice of your selected character.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 - Staggered top for stacking */}
              <div className="stack-card bg-surface border-2 border-zinc-800 p-8 md:p-12 shadow-[0_-1px_0_0_rgba(255,255,255,0.1)]" style={{ top: '140px' }}>
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1 space-y-6">
                    <span className="bg-primary text-black font-mono text-xs font-bold px-3 py-1">PHASE 03</span>
                    <h3 className="text-3xl font-black text-white uppercase italic">Final Integration</h3>
                    <p className="text-zinc-500 font-medium">
                      The engine cuts the video into viral 9:16 format, adds dynamic captions, zooms in on critical misplays, and mixes the audio for a professional finish.
                    </p>
                    <Link href="/login">
                      <Button className="w-full md:w-auto hover:bg-black hover:text-primary hover:border-primary hover:border-2 cursor-pointer">Get Started Now</Button>
                    </Link>
                  </div>
                  <div className="flex-1 w-full aspect-video bg-black border border-zinc-800 flex items-center justify-center p-8 relative">
                     <div className="w-32 h-48 border-2 border-primary flex items-center justify-center bg-zinc-900 relative">
                        <span className="text-[8px] text-primary font-black uppercase rotate-90 absolute -right-8">TIKTOK_EXPORT</span>
                        <HugeiconsIcon icon={FlashIcon} className="text-primary w-8 h-8 opacity-20" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-40 px-6 border-t border-zinc-800 text-center relative overflow-hidden bg-background">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative z-10 max-w-4xl mx-auto">
             <h2 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none">
                READY TO <br/>
                <span className="text-primary underline decoration-4">ROAST THEM?</span>
             </h2>
             <p className="text-zinc-500 text-xl font-medium mb-12">Join the public beta and start creating viral gaming clips today.</p>
             <Link href="/login">
               <Button size="lg" className="h-20 px-12 text-lg hover:bg-black hover:text-primary hover:border-primary hover:border-2 cursor-pointer">
                  Join Beta & Roast Now
               </Button>
             </Link>
          </div>
        </section>
      </main>

      {/* Boxy Footer */}
      <footer className="border-t border-zinc-800 bg-[#070708] py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <HugeiconsIcon icon={FlashIcon} className="text-black w-5 h-5 fill-black" />
            </div>
            <span className="font-bold text-xl tracking-tighter text-white uppercase italic">
              CLASH<span className="text-primary">ROAST</span>
            </span>
          </div>
          <div className='flex flex-row gap-6'> 

          <a className="text-zinc-500 text-sm hover:text-zinc-200 transition-colors duration-200 cursor-pointer" target='_blank' href='https://raajveer.vercel.app/'>
            <HugeiconsIcon icon={Mail01Icon} />
          </a>
          <a className="text-zinc-500 text-sm hover:text-zinc-200 transition-colors duration-200 cursor-pointer" target='_blank' href='https://www.github.com/rkhatta1/cr-app.git'>
            <HugeiconsIcon icon={GithubIcon} />
          </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
