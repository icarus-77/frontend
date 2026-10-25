import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { VIRTUES, VIRTUE_META } from '../../constants/gardenConstants';
import { Virtue } from '../../types/garden';
import { MangoCarton } from '../common/MangoCarton';
import confetti from 'canvas-confetti';
import { Sparkles, X, Check, Award, Flame, RotateCcw } from 'lucide-react';

export const BlenderModal: React.FC = () => {
  const {
    currentWorkspaceId,
    columnsByWorkspace,
    tasks,
    isCelebrating,
    celebrationData,
    triggerHarvestCelebration,
    closeCelebration,
    clearHarvestedTasks,
    selectedRecipeId,
    customRecipes,
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [animStage, setAnimStage] = useState<'blending' | 'ready'>('blending');
  const [flipCarton, setFlipCarton] = useState(false);
  const hasTriggeredRef = useRef(false);

  // 1. Monitor workspace tasks:
  const wsCols = columnsByWorkspace[currentWorkspaceId] || { raw: [], ripening: [], harvested: [] };
  const allWorkspaceTaskIds = useMemo(() => {
    return [...wsCols.raw, ...wsCols.ripening, ...wsCols.harvested];
  }, [wsCols]);

  const workspaceTasks = useMemo(() => {
    return allWorkspaceTaskIds.map((id) => tasks[id]).filter(Boolean);
  }, [allWorkspaceTaskIds, tasks]);

  // Check condition: tasks.length > 0 AND tasks.every(t => t.stage === 'harvested')
  const isAllHarvested = useMemo(() => {
    if (workspaceTasks.length === 0) return false;
    return workspaceTasks.every((t) => t.stage === 'harvested' || wsCols.harvested.includes(t.id));
  }, [workspaceTasks, wsCols]);

  useEffect(() => {
    if (isAllHarvested && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      triggerHarvestCelebration();
      setIsOpen(true);
      setAnimStage('blending');

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FACC15', '#22C55E', '#2563EB', '#FB923C'],
        });
      } catch (e) {
        // ignore
      }

      const timer = setTimeout(() => {
        setAnimStage('ready');
        try {
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#FACC15', '#38BDF8', '#34D399', '#FB923C'],
          });
        } catch (e) {
          // ignore
        }
      }, 1600);

      return () => clearTimeout(timer);
    } else if (!isAllHarvested) {
      hasTriggeredRef.current = false;
    }
  }, [isAllHarvested, triggerHarvestCelebration]);

  // Support manual trigger as well
  useEffect(() => {
    if (isCelebrating && !isOpen) {
      setIsOpen(true);
      setAnimStage('ready');
    }
  }, [isCelebrating, isOpen]);

  // Calculate session virtues & earned XP
  const { sessionVirtues, totalEarnedXp, recipe } = useMemo(() => {
    const rec = customRecipes.find((r) => r.id === selectedRecipeId) || customRecipes[0];
    const rawVirtues: Record<Virtue, number> = {
      Intellect: 0,
      Resilience: 0,
      Discipline: 0,
      Harmony: 0,
      Vitality: 0,
    };

    let xpSum = 0;
    workspaceTasks.forEach((t) => {
      const mult = t.pollinatedBonus || 1.0;
      xpSum += Math.round(t.xp * mult);
      for (const v of VIRTUES) {
        rawVirtues[v] += t.virtueWeights[v] || 0;
      }
    });

    const totalWeight = Object.values(rawVirtues).reduce((a, b) => a + b, 0);
    const normalized: Record<Virtue, number> = { ...rawVirtues };
    if (totalWeight > 0) {
      for (const v of VIRTUES) {
        normalized[v] = Math.round((rawVirtues[v] / totalWeight) * 100);
      }
    } else {
      normalized.Intellect = 45;
      normalized.Discipline = 35;
      normalized.Harmony = 20;
    }

    return {
      sessionVirtues: normalized,
      totalEarnedXp: xpSum || 250,
      recipe: rec,
    };
  }, [workspaceTasks, customRecipes, selectedRecipeId]);

  if (!isOpen && !isCelebrating) return null;

  const handleCollect = () => {
    clearHarvestedTasks();
    setIsOpen(false);
    closeCelebration();
    hasTriggeredRef.current = false;
  };

  const handleClose = () => {
    setIsOpen(false);
    closeCelebration();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172554]/80 backdrop-blur-sm animate-fade-in font-['Space_Grotesk']">
      <div className="relative w-full max-w-xl bg-white border-2 border-[#172554] shadow-[8px_8px_0_#172554] p-6 sm:p-8 flex flex-col items-center text-center text-[#172554] max-h-[95vh] overflow-y-auto">
        {/* Dismiss Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 border-2 border-[#172554] bg-[#FAFAF8] hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5 text-[#172554]" />
        </button>

        {animStage === 'blending' ? (
          /* Animated CSS Blender Stage */
          <div className="py-8 flex flex-col items-center space-y-6">
            <div className="relative">
              {/* Blender SVG Container with shake and liquid rise */}
              <div className="animate-bounce">
                <svg width="140" height="220" viewBox="0 0 180 300" fill="none" className="filter drop-shadow-[4px_6px_0_#172554]">
                  {/* Jar */}
                  <path d="M40 42 L24 210 L156 210 L140 42 Z" fill="#EFF6FF" stroke="#172554" strokeWidth="5" strokeLinejoin="round" />

                  {/* Rising Mango Smoothie Liquid */}
                  <path
                    d="M32 120 Q90 110 148 120 L156 210 L24 210 Z"
                    fill="url(#blender-smoothie-grad)"
                    stroke="#172554"
                    strokeWidth="3"
                  />

                  {/* Spinning Blender Blades */}
                  <g transform="translate(90, 205)" className="origin-center animate-spin" style={{ animationDuration: '0.4s' }}>
                    <path d="M-28 -5 L28 5 L24 10 L-24 2 Z" fill="#172554" />
                    <circle cx="0" cy="0" r="6" fill="#FACC15" stroke="#172554" strokeWidth="2" />
                  </g>

                  {/* Lid */}
                  <path d="M46 42 L134 42 L124 14 L56 14 Z" fill="#2563EB" stroke="#172554" strokeWidth="5" strokeLinejoin="round" />
                  <rect x="75" y="6" width="30" height="10" rx="3" fill="#FACC15" stroke="#172554" strokeWidth="2" />

                  {/* Countertop Motor Base */}
                  <rect x="22" y="218" width="136" height="64" rx="8" fill="#FB923C" stroke="#172554" strokeWidth="5" />
                  <rect x="62" y="234" width="56" height="16" rx="3" fill="#FACC15" stroke="#172554" strokeWidth="2" />
                  <circle cx="146" cy="250" r="7" fill="#22C55E" stroke="#172554" strokeWidth="2" />

                  <defs>
                    <linearGradient id="blender-smoothie-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFE033" />
                      <stop offset="100%" stopColor="#FB923C" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '3s' }}>
                <Sparkles className="w-8 h-8 text-[#FACC15]" />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
                All Board Tasks Harvested!
              </p>
              <h2 className="font-['Bebas_Neue'] text-4xl sm:text-5xl tracking-wide text-[#172554] m-0">
                BLENDING SPRINT SESSION...
              </h2>
              <p className="font-['Inter'] text-xs text-slate-600 mt-2">
                Extracting virtue statistics and formulating your session Tetrapack.
              </p>
            </div>
          </div>
        ) : (
          /* Ready Stage: Nutritional Breakdown & Collect Button */
          <div className="w-full flex flex-col items-center py-2 animate-fade-in space-y-5">
            <div>
              <div className="inline-block px-3 py-1 bg-[#FACC15] text-[#172554] border-2 border-[#172554] text-[10px] font-extrabold uppercase tracking-widest shadow-[2px_2px_0_#172554] mb-2">
                100% Board Harvest Achieved
              </div>
              <h2 className="font-['Bebas_Neue'] text-4xl sm:text-5xl text-[#172554] tracking-wider m-0">
                HARVEST CELEBRATION!
              </h2>
              <p className="font-['Inter'] text-xs text-[#172554]/75 mt-1">
                Batch Formula: <strong>{recipe.name}</strong> · Earned{' '}
                <strong className="text-[#2563EB]">+{totalEarnedXp} Total XP</strong>
              </p>
            </div>

            {/* Interactive 3D Carton / Nutrition View */}
            <div
              onClick={() => setFlipCarton(!flipCarton)}
              className="w-full max-w-sm cursor-pointer bg-[#FAFAF8] border-2 border-[#172554] shadow-[4px_4px_0_#172554] p-5 transition hover:-translate-y-1"
            >
              {!flipCarton ? (
                <div className="flex flex-col items-center">
                  <div className="transition-transform duration-300 hover:scale-105">
                    <MangoCarton size="sm" />
                  </div>
                  <div className="font-['Bebas_Neue'] text-2xl text-[#172554] tracking-wide mt-3">
                    {recipe.name}
                  </div>
                  <p className="text-xs text-slate-500 italic">"{recipe.tagline}"</p>
                  <p className="text-[10px] text-[#2563EB] font-bold uppercase mt-3 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Click carton to view Virtue Nutrition breakdown
                  </p>
                </div>
              ) : (
                <div className="text-left space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-[#172554]">
                    <div>
                      <div className="text-xs font-extrabold uppercase text-[#172554] tracking-wider">
                        Virtue Nutrition Facts
                      </div>
                      <div className="text-[10px] text-slate-500">Yield: {workspaceTasks.length} Harvested Tasks</div>
                    </div>
                    <RotateCcw className="w-4 h-4 text-[#172554]" />
                  </div>

                  {/* Virtue Progress Bars */}
                  <div className="space-y-2">
                    {VIRTUES.map((v) => (
                      <div key={v} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold flex items-center gap-1">
                            <span>{VIRTUE_META[v].icon}</span>
                            <span>{v}</span>
                          </span>
                          <span className="font-mono font-bold text-[#2563EB]">
                            {sessionVirtues[v] || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 border border-[#172554]">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${sessionVirtues[v] || 0}%`,
                              backgroundColor: VIRTUE_META[v].color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 text-center pt-2">
                    Click to flip back to carton cover
                  </p>
                </div>
              )}
            </div>

            {/* Collect Session Tetrapack Button */}
            <div className="w-full pt-2">
              <button
                onClick={handleCollect}
                className="w-full py-3.5 bg-[#FACC15] hover:bg-yellow-300 text-[#172554] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest border-2 border-[#172554] shadow-[4px_4px_0_#172554] transition active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#172554]" />
                Collect Session Tetrapack ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlenderModal;
