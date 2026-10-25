import React, { useState } from 'react';
import { useGardenStore } from '../../store/useGardenStore';
import { Task } from '../../types/garden';
import { X, ArrowRight, Gift } from 'lucide-react';

interface CrossPollinateModalProps {
  task: Task | null;
  onClose: () => void;
}

export const CrossPollinateModal: React.FC<CrossPollinateModalProps> = ({ task, onClose }) => {
  const { users, reassignTask } = useGardenStore();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  if (!task) return null;

  const currentAssignee = users.find((u) => u.id === task.assigneeId) || users[0];
  const eligibleTeammates = users.filter((u) => u.id !== task.assigneeId);

  const handleConfirm = () => {
    if (!selectedUserId) return;
    reassignTask(task.id, selectedUserId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-[#172554] shadow-[6px_6px_0_#172554] w-full max-w-md overflow-hidden font-['Space_Grotesk'] text-[#172554]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#172554] text-white">
          <div>
            <h3 className="font-['Bebas_Neue'] text-2xl tracking-wider text-white m-0">REASSIGN TASK</h3>
            <p className="text-[10px] uppercase font-bold text-yellow-300 tracking-wider">
              Collaboration Bonus: +25% Team XP
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:text-yellow-300 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 border-2 border-[#172554]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Task Title</div>
            <div className="font-bold text-sm text-[#172554] mt-0.5">{task.title}</div>
            <div className="text-xs text-slate-600 mt-1">
              Current Assignee: <strong>{currentAssignee.name}</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172554] mb-2">
              Select Teammate to Reassign
            </label>
            <div className="space-y-2">
              {eligibleTeammates.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUserId(u.id)}
                  className={`w-full p-2.5 border-2 text-left flex items-center justify-between transition ${
                    selectedUserId === u.id
                      ? 'border-[#2563EB] bg-blue-50 font-bold'
                      : 'border-slate-300 hover:border-[#172554] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{u.avatar}</span>
                    <div>
                      <div className="text-xs font-bold text-[#172554]">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.title}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-300 text-[#172554] border border-[#172554]">
                    +25% XP
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border-2 border-slate-300 font-bold text-xs uppercase text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              disabled={!selectedUserId}
              onClick={handleConfirm}
              className="px-5 py-2 bg-[#FACC15] hover:bg-yellow-300 disabled:opacity-50 text-[#172554] font-bold text-xs uppercase tracking-wider border-2 border-[#172554] shadow-[2px_2px_0_#172554] transition"
            >
              CONFIRM REASSIGN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
