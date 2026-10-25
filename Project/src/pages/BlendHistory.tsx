import React, { useState } from 'react';
import { useGardenStore } from '../store/useGardenStore';
import { TetrapackArchiveItem, Virtue } from '../types/garden';
import { VIRTUES, VIRTUE_META } from '../constants/gardenConstants';
import { MangoCarton } from '../components/common/MangoCarton';
import { Search, Calendar, X, RotateCcw } from 'lucide-react';

export const BlendHistory: React.FC = () => {
  const { archive, users, customRecipes } = useGardenStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState<string>('all');
  const [inspectItem, setInspectItem] = useState<TetrapackArchiveItem | null>(null);
  const [inspectFlipped, setInspectFlipped] = useState(false);

  const filteredArchive = archive.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchBatch = item.batchNumber.toLowerCase().includes(q);
      const matchRecipe = item.recipeName.toLowerCase().includes(q);
      if (!matchTitle && !matchBatch && !matchRecipe) return false;
    }

    if (filterMember !== 'all') {
      const hasMember = item.participants.some((p) => p.id === filterMember);
      if (!hasMember) return false;
    }

    return true;
  });

  const totalBatches = archive.length;
  const totalArchiveXp = archive.reduce((sum, item) => sum + item.totalXp, 0);

  return (
    <div className="bg-[#FAFAF8] text-[#172554] min-h-screen py-12 px-4 sm:px-8 font-['Space_Grotesk']">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-[#172554]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#22C55E] mb-1">
              07 / HARVEST REPOSITORY & BATCHES
            </p>
            <h1 className="font-['Bebas_Neue'] text-5xl sm:text-6xl text-[#172554] tracking-tight leading-none m-0">
              BLEND ARCHIVE.
            </h1>
            <p className="font-['Inter'] text-sm text-[#172554]/70 mt-2">
              Browse past completed session cartons, virtue yields, and collaborative blend recipes.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white border-2 border-[#172554] p-3 shadow-[3px_3px_0_#172554]">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Batches</div>
              <div className="font-['Bebas_Neue'] text-3xl leading-none text-[#172554]">{totalBatches} CARTONS</div>
            </div>
            <div className="w-px h-8 bg-[#172554]/20" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Collective XP</div>
              <div className="font-['Bebas_Neue'] text-3xl leading-none text-[#2563EB]">
                {totalArchiveXp.toLocaleString()} XP
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border-2 border-[#172554] p-4 shadow-[3px_3px_0_#172554]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batch or recipe..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border-2 border-[#172554] text-xs font-medium text-[#172554] focus:outline-none w-48"
              />
            </div>

            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border-2 border-[#172554] text-xs font-bold text-[#172554]"
            >
              <option value="all">All Teammates</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-bold">
            Showing {filteredArchive.length} of {totalBatches} batches
          </div>
        </div>

        {/* Cartons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArchive.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setInspectItem(item);
                setInspectFlipped(false);
              }}
              className="bg-white border-2 border-[#172554] p-5 shadow-[4px_4px_0_#172554] hover:-translate-y-1 hover:shadow-[6px_6px_0_#172554] transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-yellow-200 border border-[#172554]">
                    BATCH {item.batchNumber}
                  </span>
                  <span className="text-xs font-bold text-[#172554]">★ {item.rating.toFixed(1)}</span>
                </div>

                <div className="flex items-center gap-3 my-3">
                  <div className="w-12 h-12 bg-yellow-50 border-2 border-[#172554] flex items-center justify-center text-2xl shrink-0">
                    🧃
                  </div>
                  <div>
                    <h3 className="font-['Bebas_Neue'] text-2xl text-[#172554] leading-tight m-0">
                      {item.recipeName}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.title}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 border-2 border-[#172554] space-y-1.5 my-3 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Session Yield:</span>
                    <span className="text-[#2563EB]">+{item.totalXp} XP</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tasks Completed:</span>
                    <span>{item.taskCount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.date}
                </span>

                <div className="flex -space-x-1.5">
                  {item.participants.map((p) => (
                    <div
                      key={p.id}
                      title={p.name}
                      className="w-5 h-5 rounded-full border border-[#172554] bg-white flex items-center justify-center text-[10px]"
                    >
                      {p.avatar}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carton Inspect Modal */}
        {inspectItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-2 border-[#172554] shadow-[8px_8px_0_#172554] w-full max-w-md p-6 relative text-center">
              <button
                onClick={() => setInspectItem(null)}
                className="absolute top-4 right-4 p-1 border border-[#172554] hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-[#172554]" />
              </button>

              <div className="pt-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-yellow-200 border border-[#172554]">
                  Batch #{inspectItem.batchNumber}
                </span>
                <h2 className="font-['Bebas_Neue'] text-4xl text-[#172554] tracking-wide mt-2 mb-1">
                  {inspectItem.recipeName}
                </h2>
                <p className="text-xs text-slate-500">{inspectItem.title}</p>
              </div>

              {/* 3D Carton / Nutrition View */}
              <div
                onClick={() => setInspectFlipped(!inspectFlipped)}
                className="my-5 p-5 border-2 border-[#172554] bg-yellow-50 cursor-pointer shadow-[3px_3px_0_#172554]"
              >
                {!inspectFlipped ? (
                  <div className="flex flex-col items-center">
                    <MangoCarton size="sm" />
                    <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Click carton to view Virtue Nutrition Table
                    </p>
                  </div>
                ) : (
                  <div className="text-left">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-[#172554] mb-3">
                      <span className="text-xs font-bold uppercase text-[#172554]">Virtue Nutrition Table</span>
                      <RotateCcw className="w-4 h-4 text-[#172554]" />
                    </div>

                    <div className="space-y-2">
                      {VIRTUES.map((v) => (
                        <div key={v} className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#172554]">{v}</span>
                          <span className="font-mono font-bold text-[#2563EB]">{inspectItem.virtues[v] || 0}%</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-slate-500 mt-4 text-center">
                      Click to flip back to carton cover
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setInspectItem(null)}
                className="w-full py-2 bg-[#172554] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#2563EB] transition"
              >
                CLOSE CARTON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
