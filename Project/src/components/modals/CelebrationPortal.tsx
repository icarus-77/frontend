import React, { useEffect, useState } from 'react';
import { useGardenStore } from '../../store/useGardenStore';
import { MangoCarton } from '../common/MangoCarton';
import confetti from 'canvas-confetti';
import { X, Check } from 'lucide-react';

export const CelebrationPortal: React.FC = () => {
  const { isCelebrating, celebrationData, closeCelebration } = useGardenStore();

  useEffect(() => {
    if (!isCelebrating) return;

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#22C55E', '#2563EB', '#FB923C'],
      });
    } catch (e) {
      // ignore
    }
  }, [isCelebrating]);

  if (!isCelebrating || !celebrationData) return null;

  const { recipe, xpGained, batchNumber, harvestedTasks } = celebrationData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border-2 border-[#172554] shadow-[8px_8px_0_#172554] p-8 flex flex-col items-center text-center font-['Space_Grotesk'] text-[#172554]">
        {/* Close Button */}
        <button
          onClick={closeCelebration}
          className="absolute top-4 right-4 p-1.5 border border-[#172554] hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5 text-[#172554]" />
        </button>

        {/* Carton Illustration */}
        <div className="my-2 transition-transform duration-300 hover:scale-105">
          <MangoCarton size="md" />
        </div>

        <p className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest text-[#2563EB] mt-4 mb-1">
          Session Harvest Complete · Batch #{batchNumber}
        </p>

        <h2 className="font-['Bebas_Neue'] text-5xl text-[#172554] tracking-wider m-0">
          ALL TASKS BLENDED!
        </h2>

        <p className="font-['Inter'] text-sm text-[#172554]/75 mt-2 max-w-sm">
          Successfully completed <strong>{harvestedTasks.length} tasks</strong> and earned{' '}
          <strong className="text-[#2563EB]">+{xpGained} XP</strong> for the workspace.
        </p>

        <div className="w-full bg-[#FAFAF8] border-2 border-[#172554] p-3.5 my-5 text-left text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold uppercase">Recipe Blend:</span>
            <strong className="text-[#172554]">{recipe.name}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold uppercase">Flavor Profile:</span>
            <span className="text-[#172554]">{recipe.flavorNotes}</span>
          </div>
        </div>

        <button
          onClick={closeCelebration}
          className="px-8 py-3 bg-[#22C55E] hover:bg-green-600 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest border-2 border-[#172554] shadow-[3px_3px_0_#172554] transition flex items-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          CLAIM & CONTINUE
        </button>
      </div>
    </div>
  );
};
