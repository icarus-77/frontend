import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Inline SVG Icons for complete dependency resilience
const CpuIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const BrainIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 animate-bounce text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export function ScrollStory({ onEnterBoard }) {
  const containerRef = useRef(null);

  // Graphics Refs
  const mangoRef = useRef(null);
  const mangoVisualRef = useRef(null);
  const leafRef = useRef(null);
  const blenderRef = useRef(null);
  const blenderLidRef = useRef(null);
  const vortexRef = useRef(null);
  const pourStreamRef = useRef(null);
  const cartonWrapperRef = useRef(null);
  const cartonInnerRef = useRef(null);

  // Text Section Refs
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);
  const text4Ref = useRef(null);

  // Progress state
  const [activePhase, setActivePhase] = useState(1);
  const [isCartonFlipped, setIsCartonFlipped] = useState(false);

  // Fallback native scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / totalHeight));

      if (progress < 0.25) setActivePhase(1);
      else if (progress < 0.50) setActivePhase(2);
      else if (progress < 0.75) setActivePhase(3);
      else setActivePhase(4);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Master ScrollTrigger Timeline
  useEffect(() => {
    if (!containerRef.current) return;

    const gsapObj = gsap;

    const ctx = gsapObj.context(() => {
      // Setup initial states
      gsapObj.set(mangoRef.current, { scale: 0.7, rotation: -12, opacity: 1, y: 0 });
      gsapObj.set(blenderRef.current, { y: 250, opacity: 0, scale: 0.8 });
      gsapObj.set(blenderLidRef.current, { y: -60, opacity: 0 });
      gsapObj.set(vortexRef.current, { scale: 0, opacity: 0, rotation: 0 });
      gsapObj.set(pourStreamRef.current, { scaleY: 0, opacity: 0, transformOrigin: 'top center' });
      gsapObj.set(cartonWrapperRef.current, { y: 150, scale: 0.5, opacity: 0 });

      // Initial opacity for text sections
      gsapObj.set(text1Ref.current, { opacity: 1, y: 0 });
      gsapObj.set(text2Ref.current, { opacity: 0, y: 50 });
      gsapObj.set(text3Ref.current, { opacity: 0, y: 50 });
      gsapObj.set(text4Ref.current, { opacity: 0, y: 50 });

      // Single Master Timeline linked to ScrollTrigger
      const tl = gsapObj.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.25) setActivePhase(1);
            else if (p < 0.50) setActivePhase(2);
            else if (p < 0.75) setActivePhase(3);
            else setActivePhase(4);
          }
        }
      });

      // ----------------------------------------------------
      // PHASE 1 (0% -> 25%): The Seedling (Systems Architect)
      // ----------------------------------------------------
      tl.to(mangoRef.current, {
        scale: 1.1,
        rotation: 10,
        duration: 2,
        ease: 'power1.inOut'
      }, 0)
      .to(leafRef.current, {
        rotation: 25,
        duration: 2,
        ease: 'sine.inOut'
      }, 0);

      // Transition Section 1 out / Section 2 in (around 22% - 28%)
      tl.to(text1Ref.current, {
        opacity: 0,
        y: -40,
        duration: 1
      }, 1.8)
      .to(text2Ref.current, {
        opacity: 1,
        y: 0,
        duration: 1
      }, 2.2);

      // ----------------------------------------------------
      // PHASE 2 (25% -> 50%): The Ripening (Aman - Data & AI)
      // ----------------------------------------------------
      // Morph mango visual color & glow from Green to Golden Yellow
      tl.to(mangoVisualRef.current, {
        backgroundColor: '#F59E0B',
        boxShadow: '0 0 70px rgba(245, 158, 11, 0.7)',
        duration: 2
      }, 2.5)
      .to(mangoRef.current, {
        y: -15,
        rotation: -8,
        scale: 1.25,
        duration: 2,
        ease: 'sine.inOut'
      }, 2.5);

      // Transition Section 2 out / Section 3 in (around 47% - 53%)
      tl.to(text2Ref.current, {
        opacity: 0,
        y: -40,
        duration: 1
      }, 4.2)
      .to(text3Ref.current, {
        opacity: 1,
        y: 0,
        duration: 1
      }, 4.6);

      // ----------------------------------------------------
      // PHASE 3 (50% -> 75%): The Blender (UI/UX Developer)
      // ----------------------------------------------------
      // Blender slides up
      tl.to(blenderRef.current, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'back.out(1.2)'
      }, 5.0);

      // Golden Mango drops inside blender container
      tl.to(mangoRef.current, {
        y: 110,
        scale: 0.4,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.in'
      }, 5.4);

      // Blender Lid snaps closed
      tl.to(blenderLidRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'bounce.out'
      }, 6.2);

      // Vortex spins & liquid turns orange swirl
      tl.to(vortexRef.current, {
        scale: 1,
        opacity: 1,
        rotation: 720,
        duration: 1.8,
        ease: 'power2.inOut'
      }, 6.5);

      // Transition Section 3 out / Section 4 in (around 72% - 78%)
      tl.to(text3Ref.current, {
        opacity: 0,
        y: -40,
        duration: 1
      }, 7.0)
      .to(text4Ref.current, {
        opacity: 1,
        y: 0,
        duration: 1
      }, 7.4);

      // ----------------------------------------------------
      // PHASE 4 (75% -> 100%): The Pour & Carton (Security & Delivery)
      // ----------------------------------------------------
      // Blender tilts to pour
      tl.to(blenderRef.current, {
        rotation: -45,
        x: -40,
        duration: 1.2,
        ease: 'power2.inOut'
      }, 7.5);

      // Pour liquid stream activates
      tl.to(pourStreamRef.current, {
        scaleY: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'power1.in'
      }, 8.0);

      // Carton container enters with spring bounce
      tl.to(cartonWrapperRef.current, {
        y: 40,
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: 'back.out(1.7)'
      }, 8.2);

      // Pour finishes & blender resets slightly
      tl.to(pourStreamRef.current, {
        opacity: 0,
        duration: 0.5
      }, 8.9)
      .to(blenderRef.current, {
        opacity: 0.3,
        scale: 0.85,
        duration: 0.8
      }, 9.0);

      // Carton card flip action on end of scroll
      tl.to(cartonInnerRef.current, {
        rotateY: 180,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => setIsCartonFlipped(true),
        onReverseComplete: () => setIsCartonFlipped(false)
      }, 9.2);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSkipToBoard = () => {
    if (onEnterBoard) onEnterBoard();
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-slate-950 text-slate-100 font-sans min-h-[400vh] selection:bg-amber-500 selection:text-slate-950"
    >
      {/* Dynamic Background Gradient Aura */}
      <div 
        className={`fixed inset-0 pointer-events-none transition-colors duration-1000 z-0 ${
          activePhase === 1 
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/60 via-slate-950 to-slate-950'
            : activePhase === 2
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/60 via-slate-950 to-slate-950'
            : activePhase === 3
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-950/60 via-slate-950 to-slate-950'
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/20 via-orange-950/60 to-slate-950'
        }`}
      />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-slate-950/75 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <SparklesIcon />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              THE MANGO HARVEST
            </h1>
            <p className="text-xs text-slate-400 font-mono">Interactive Credits & Storyboard</p>
          </div>
        </div>

        {/* Phase Indicators */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-4 py-1.5 text-xs font-mono">
          {[
            { id: 1, label: '01. Seedling' },
            { id: 2, label: '02. Ripening' },
            { id: 3, label: '03. Blender' },
            { id: 4, label: '04. The Pour' },
          ].map((phase) => (
            <span
              key={phase.id}
              className={`px-3 py-1 rounded-full transition-all duration-300 ${
                activePhase === phase.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {phase.label}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSkipToBoard}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs tracking-wide shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Enter Board</span>
            <ArrowRightIcon />
          </button>
        </div>
      </header>

      {/* PINNED CENTRAL STAGE (STAYS FIXED IN VIEWPORT CENTER) */}
      <div 
        className="sticky top-0 h-screen w-full flex items-center justify-center pointer-events-none z-10 overflow-hidden"
      >
        {/* Glow Aura Ring behind graphics */}
        <div 
          className={`absolute w-80 h-80 rounded-full blur-3xl transition-all duration-700 opacity-60 ${
            activePhase === 1 ? 'bg-emerald-500' :
            activePhase === 2 ? 'bg-amber-400' :
            activePhase === 3 ? 'bg-orange-500' : 'bg-amber-500'
          }`}
        />

        {/* CENTRAL TRANSFORMING VISUAL CONTAINER */}
        <div className="relative w-80 h-96 flex items-center justify-center">

          {/* 1. MANGO VISUAL (Phase 1 & 2) */}
          <div 
            ref={mangoRef} 
            className="absolute z-20 flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
          >
            {/* Stem */}
            <div className="w-3 h-7 bg-amber-900 rounded-t-sm relative -mb-1 shadow-inner" />
            {/* Leaf */}
            <div 
              ref={leafRef} 
              className="absolute -top-3 right-12 w-12 h-6 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full rotate-45 shadow-md border border-emerald-300/40"
            />
            {/* Morphing Mango Body */}
            <div 
              ref={mangoVisualRef}
              className="w-48 h-64 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 rounded-[40%_60%_70%_30%/50%_60%_40%_50%] shadow-[0_0_50px_rgba(16,185,129,0.5)] border-2 border-white/20 relative overflow-hidden flex items-center justify-center transition-colors duration-500"
            >
              {/* Gloss Specular Highlight */}
              <div className="absolute top-4 left-6 w-16 h-28 bg-white/25 rounded-full blur-md rotate-12 pointer-events-none" />
              <div className="text-slate-950/20 font-black text-6xl select-none rotate-90">
                🥭
              </div>
            </div>
          </div>

          {/* 2. BLENDER CONTAINER (Phase 3) */}
          <div 
            ref={blenderRef} 
            className="absolute z-10 w-56 h-80 flex flex-col items-center justify-end pointer-events-auto"
          >
            {/* Lid */}
            <div 
              ref={blenderLidRef} 
              className="w-44 h-8 bg-slate-800 border-2 border-slate-600 rounded-t-xl flex items-center justify-center shadow-lg relative z-30"
            >
              <div className="w-10 h-4 bg-amber-500 rounded-t-md border border-amber-300" />
            </div>

            {/* Glass Jar */}
            <div className="w-48 h-64 backdrop-blur-md bg-white/10 border-2 border-white/30 rounded-b-2xl relative overflow-hidden flex flex-col justify-end shadow-2xl">
              {/* Measurement markings */}
              <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-[9px] font-mono text-white/40 border-r border-white/20 pr-1">
                <span>800ml</span>
                <span>600ml</span>
                <span>400ml</span>
                <span>200ml</span>
              </div>

              {/* Swirling Vortex Smoothie */}
              <div 
                ref={vortexRef} 
                className="w-full h-44 bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-400 rounded-t-full relative overflow-hidden flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_30%,_rgba(255,255,255,0.3)_70%)] animate-spin" style={{ animationDuration: '3s' }} />
                <div className="text-xs font-mono font-bold text-slate-950 bg-white/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  BLENDING...
                </div>
              </div>
            </div>

            {/* Stainless Steel Base */}
            <div className="w-56 h-12 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-2 border-slate-600 rounded-b-xl flex items-center justify-between px-6 shadow-xl">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-400" />
              <div className="w-12 h-3 bg-slate-900 rounded-full border border-slate-600" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
            </div>
          </div>

          {/* STREAM POUR VISUAL (Phase 4 transition) */}
          <div 
            ref={pourStreamRef} 
            className="absolute top-40 right-10 w-6 h-36 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.8)] z-20 pointer-events-none"
          />

          {/* 3. TETRA PAK CARTON (Phase 4) */}
          <div 
            ref={cartonWrapperRef} 
            className="absolute z-30 w-64 h-88 [perspective:1000px] pointer-events-auto cursor-pointer"
            onClick={() => setIsCartonFlipped(!isCartonFlipped)}
          >
            <div 
              ref={cartonInnerRef}
              className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] ${
                isCartonFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* FRONT SIDE: Carton Cover */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 border-2 border-amber-300/40 shadow-2xl flex flex-col justify-between text-slate-950">
                {/* Top Fold */}
                <div className="flex justify-between items-center border-b border-slate-950/20 pb-2">
                  <span className="text-[10px] font-mono font-black tracking-widest uppercase">100% PURE RECREATION</span>
                  <div className="w-4 h-4 rounded-full bg-slate-950/20 flex items-center justify-center text-[10px]">🧃</div>
                </div>

                {/* Main Brand */}
                <div className="text-center my-auto">
                  <div className="text-4xl mb-1 filter drop-shadow-md">🥭</div>
                  <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                    MANGO HARVEST
                  </h2>
                  <p className="text-xs font-bold text-slate-900/80 mt-1 uppercase tracking-wider">
                    CREDITS SMOOTHIE
                  </p>
                  <div className="mt-3 inline-block bg-slate-950 text-amber-400 text-[10px] font-mono px-3 py-1 rounded-full font-bold shadow-md">
                    SERVES 4 TEAM MEMBERS
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="bg-slate-950/10 rounded-xl p-2 text-center border border-slate-950/10">
                  <p className="text-[10px] font-bold text-slate-950">Click to Flip Nutritional Virtues ↻</p>
                </div>
              </div>

              {/* BACK SIDE: Nutritional Virtues Label */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-slate-900 text-slate-100 rounded-3xl p-5 border-2 border-amber-500/50 shadow-2xl flex flex-col justify-between font-mono">
                <div>
                  <div className="border-b-4 border-slate-100 pb-1 mb-2 flex justify-between items-end">
                    <h3 className="text-base font-black tracking-tight text-amber-400 uppercase">NUTRITION FACTS</h3>
                    <span className="text-[10px] text-slate-400">1 CAN / 400vh</span>
                  </div>

                  <p className="text-[9px] text-slate-400 border-b border-slate-700 pb-1 mb-2">
                    Amount Per Serving % Daily Value*
                  </p>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between">
                        <span className="font-bold text-emerald-400">Intellect (Systems)</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                        <div className="w-[100%] h-full bg-emerald-400" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="font-bold text-amber-400">Resilience (AI & Data)</span>
                        <span>98%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                        <div className="w-[98%] h-full bg-amber-400" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="font-bold text-orange-400">Discipline (UI/UX)</span>
                        <span>95%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                        <div className="w-[95%] h-full bg-orange-400" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span className="font-bold text-sky-400">Security & Delivery</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                        <div className="w-[100%] h-full bg-sky-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2 text-[9px] text-slate-400 text-center">
                  * Percent Virtues based on a 2,000 calorie production roadmap.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FLOATING TEXT SECTIONS OVERLAY (HEIGHT 400VH) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6">

        {/* SECTION 1: 0% - 25% (The Seedling -> Systems Architect) */}
        <section className="min-h-screen flex items-center justify-start py-20">
          <div 
            ref={text1Ref} 
            className="w-full md:w-1/2 lg:w-5/12 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 shadow-2xl shadow-emerald-950/40 relative group"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500 text-slate-950 font-mono font-black text-xs rounded-full uppercase tracking-wider shadow-md">
              01 / THE SEEDLING
            </div>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CpuIcon />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-300">Systems Architect</h3>
                <p className="text-xs text-slate-400 font-mono">Foundational Engineering</p>
              </div>
            </div>

            <h4 className="text-2xl font-black text-slate-100 mb-3 leading-snug">
              Core Low-Level Memory & Network Bedrock
            </h4>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Laying down the high-throughput foundation. Engineered low-level memory allocation routines, object-oriented Java system patterns, and resilient socket routing for zero latency.
            </p>

            {/* Feature Pills */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>Low-Level C Memory Allocation & Pointer Safety</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>Java Object-Oriented System Architecture</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>CCNA Networking Principles & Packet Routing</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-emerald-400/90">
              <span>⚡ 0.2ms Packet Sync</span>
              <span>🛡️ Zero Memory Leaks</span>
            </div>
          </div>
        </section>


        {/* SECTION 2: 25% - 50% (The Ripening -> Data & AI Engineer Aman) */}
        <section className="min-h-screen flex items-center justify-end py-20">
          <div 
            ref={text2Ref} 
            className="w-full md:w-1/2 lg:w-5/12 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-8 shadow-2xl shadow-amber-950/40 relative group"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 bg-amber-500 text-slate-950 font-mono font-black text-xs rounded-full uppercase tracking-wider shadow-md">
              02 / THE RIPENING
            </div>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <BrainIcon />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-300">Aman Thakur</h3>
                <p className="text-xs text-slate-400 font-mono">Data & AI Engineer (Research Intern)</p>
              </div>
            </div>

            <h4 className="text-2xl font-black text-slate-100 mb-3 leading-snug">
              Signal Processing & Local Qwen 2.5 Intelligence
            </h4>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Constructed Python digital signal processing (DSP) pipelines to filter surface electromyography (EMG) muscle signals for silent speech recognition, alongside deploying local Qwen 2.5 AI environments.
            </p>

            {/* Feature Pills */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>Python Signal Processing Pipelines & DSP Filtering</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>Surface Electromyography (EMG) Silent Speech AI</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>Local AI Environments & Qwen 2.5 Execution</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-amber-400/90">
              <span>🧠 98.4% EMG Accuracy</span>
              <span>⚡ Offline LLM Inference</span>
            </div>
          </div>
        </section>


        {/* SECTION 3: 50% - 75% (The Blender -> UI/UX & Motion Developer) */}
        <section className="min-h-screen flex items-center justify-start py-20">
          <div 
            ref={text3Ref} 
            className="w-full md:w-1/2 lg:w-5/12 bg-slate-900/90 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-8 shadow-2xl shadow-orange-950/40 relative group"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 bg-orange-500 text-slate-950 font-mono font-black text-xs rounded-full uppercase tracking-wider shadow-md">
              03 / THE BLENDER
            </div>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <SparklesIcon />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-300">UI/UX & Motion Developer</h3>
                <p className="text-xs text-slate-400 font-mono">Creative Experience Lead</p>
              </div>
            </div>

            <h4 className="text-2xl font-black text-slate-100 mb-3 leading-snug">
              Tactile Micro-Interactions & React Portals
            </h4>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Blended visual aesthetics with technical rigor. Crafted custom GSAP timelines, Framer Motion portal overlays, and accessible dnd-kit drag-and-drop Kanban mechanics.
            </p>

            {/* Feature Pills */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>Tactile Micro-Interactions & 60fps GSAP Motion</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>React Portals & Celebration Particle Canvas</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>Accessible dnd-kit Drag-and-Drop Architecture</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-orange-400/90">
              <span>🎨 60 FPS Fluid Motion</span>
              <span>♿ 100 A11y Rating</span>
            </div>
          </div>
        </section>


        {/* SECTION 4: 75% - 100% (The Pour -> Security & Delivery Lead) */}
        <section className="min-h-screen flex items-center justify-end py-20">
          <div 
            ref={text4Ref} 
            className="w-full md:w-1/2 lg:w-5/12 bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 rounded-3xl p-8 shadow-2xl shadow-sky-950/40 relative group"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 bg-sky-400 text-slate-950 font-mono font-black text-xs rounded-full uppercase tracking-wider shadow-md">
              04 / THE HARVEST & POUR
            </div>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <ShieldCheckIcon />
              </div>
              <div>
                <h3 className="text-xl font-bold text-sky-300">Security & Delivery Lead</h3>
                <p className="text-xs text-slate-400 font-mono">Adversary Emulation & DevSecOps</p>
              </div>
            </div>

            <h4 className="text-2xl font-black text-slate-100 mb-3 leading-snug">
              Threat Intelligence & Final Delivery Audit
            </h4>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Hardened system integrity. Analyzed APT threat actors such as OCEANLOTUS (APT32), mapped tradecraft to the Lockheed Martin Cyber Kill Chain, and conducted final security auditing.
            </p>

            {/* Feature Pills */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>OCEANLOTUS (APT32) Threat Intel & Tradecraft Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>Lockheed Martin Cyber Kill Chain Mapping</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <CheckCircleIcon />
                <span>Zero-Trust Security Auditing & Release Validation</span>
              </div>
            </div>

            {/* CTA BUTTON */}
            <div className="mt-8 pt-4 border-t border-slate-800">
              <button
                onClick={handleSkipToBoard}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black py-4 px-6 rounded-2xl text-base tracking-wide shadow-xl shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer group/btn"
              >
                <span>ENTER THE HARVEST BOARD</span>
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover/btn:translate-x-1.5" />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER SCROLL PROMPT */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 text-slate-400 text-xs font-mono pointer-events-none opacity-80">
        <span>SCROLL TO UNFOLD STORY</span>
        <ChevronDownIcon />
      </div>
    </div>
  );
}
