import React, { useState } from 'react';
import { useGardenStore } from '../../store/useGardenStore';
import { Difficulty, Virtue } from '../../types/garden';
import { VIRTUES, VIRTUE_META, DIFFICULTY_META } from '../../constants/gardenConstants';
import { X, Plus } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const { createTask, users, currentUser, currentWorkspaceId } = useGardenStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [tags, setTags] = useState('Core, Product');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const baseXP = difficulty === 'HARD' ? 60 : difficulty === 'MEDIUM' ? 35 : 20;
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);

    const defaultVirtueWeights: Record<Virtue, number> = {
      Intellect: 50,
      Discipline: 30,
      Harmony: 20,
      Resilience: 0,
      Vitality: 0,
    };

    const created = createTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      tags: tagList.length > 0 ? tagList : ['General'],
      difficulty,
      virtueWeights: defaultVirtueWeights,
      xp: baseXP,
      templateType: difficulty === 'HARD' ? 'Deep Work' : 'Standard',
      estimatedMinutes: Number(estimatedMinutes) || 30,
      assigneeId,
      workspaceId: currentWorkspaceId,
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    });

    if (created) {
      onClose();
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-[#172554] shadow-[6px_6px_0_#172554] w-full max-w-lg overflow-hidden flex flex-col font-['Space_Grotesk'] text-[#172554]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#172554] text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥭</span>
            <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider text-white m-0">CREATE NEW TASK</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:text-yellow-300 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172554] mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design responsive navigation bar"
              className="w-full px-3 py-2 bg-slate-50 border-2 border-[#172554] font-['Inter'] text-sm text-[#172554] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172554] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about the task objective..."
              className="w-full px-3 py-2 bg-slate-50 border-2 border-[#172554] font-['Inter'] text-sm text-[#172554] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172554] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-[#172554] text-xs font-bold text-[#172554]"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172554] mb-1">
                Difficulty / XP
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-[#172554] text-xs font-bold text-[#172554]"
              >
                <option value="EASY">Easy (+20 XP)</option>
                <option value="MEDIUM">Medium (+35 XP)</option>
                <option value="HARD">Hard (+60 XP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172554] mb-1">
                Team Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-[#172554] text-xs font-bold text-[#172554]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172554] mb-1">
                Estimated Minutes
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                min="5"
                max="240"
                className="w-full px-3 py-2 bg-slate-50 border-2 border-[#172554] font-['Inter'] text-xs font-bold text-[#172554]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172554] mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Design, Sprint, Core"
              className="w-full px-3 py-2 bg-slate-50 border-2 border-[#172554] font-['Inter'] text-xs text-[#172554]"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-slate-300 font-bold text-xs uppercase text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider border-2 border-[#172554] shadow-[2px_2px_0_#172554] transition"
            >
              CREATE TASK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
