import React from 'react';
import { MangoCarton } from '../common/MangoCarton';
import { ArrowRight, Plus } from 'lucide-react';

interface HeroSectionProps {
  onAddTask: () => void;
  onScrollToBoard: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onAddTask, onScrollToBoard }) => {
  return (
    <section className="relative overflow-hidden bg-[#2563EB] text-white pt-24 pb-20 px-6 sm:px-12 border-b-2 border-[#172554]">
      {/* Ambient Decorative Graphic Bubbles */}
      <div className="absolute w-[430px] h-[430px] rounded-full bg-white/[0.06] blur-[45px] left-[56%] -top-[6%] pointer-events-none" />
      <div className="absolute w-[210px] h-[210px] rounded-full bg-white/[0.09] border border-white/15 left-[5%] top-[54%] pointer-events-none" />
      <div className="absolute w-[95px] h-[95px] rounded-full bg-white/[0.12] border border-white/20 left-[83%] top-[67%] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 relative z-10">
        <div>
          <p className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-[0.18em] text-white/70 mb-3">
            Mango Chango Studio · Team Collaboration
          </p>

          <h1 className="font-['Bebas_Neue'] text-7xl sm:text-8xl lg:text-9xl tracking-tight leading-[0.88] text-white drop-shadow-[4px_4px_0_rgba(23,37,84,0.35)] mb-6">
            RIPEN<br />
            YOUR<br />
            WORK.
          </h1>

          <p className="font-['Inter'] text-lg sm:text-xl font-medium text-white/90 max-w-md leading-relaxed mb-8">
            Turn unfinished tasks into something golden. Plan with your team, move items through progress, and blend completed wins.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onScrollToBoard}
              className="px-7 py-3.5 rounded-none bg-[#FACC15] hover:bg-yellow-300 text-[#172554] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 shadow-[4px_4px_0_#172554] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#172554] flex items-center gap-2"
            >
              VIEW BOARD
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={onAddTask}
              className="px-6 py-3 rounded-none bg-white/15 hover:bg-white/25 text-white border-2 border-white/60 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest transition"
            >
              + NEW TASK
            </button>
          </div>
        </div>

        {/* 3D Mango Carton Illustration */}
        <div className="flex justify-center items-center py-6">
          <div className="transition-transform duration-500 hover:scale-105 filter drop-shadow-[0_24px_40px_rgba(23,37,84,0.4)]">
            <MangoCarton size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
};
