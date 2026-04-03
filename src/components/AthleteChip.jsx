import { useDraggable } from '@dnd-kit/core';
import { getAvatarColor } from '../utils/helpers';

export default function AthleteChip({ athlete, isAssigned }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: athlete.id,
    disabled: isAssigned,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 bg-white border rounded-xl px-3 py-2.5 transition-all touch-none ${
        isAssigned
          ? 'opacity-30 cursor-not-allowed border-[#E5E7EB]'
          : isDragging
          ? 'opacity-40 cursor-grabbing scale-[1.03] shadow-lg border-[#2563EB]/30 shadow-blue-100'
          : 'cursor-grab border-[#E5E7EB] hover:border-[#2563EB]/40 hover:shadow-sm active:scale-[1.03]'
      }`}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
      >
        {athlete.initials}
      </div>
      <div className="min-w-0">
        <div className="text-[#111827] text-sm font-medium truncate">{athlete.name}</div>
        <div className="text-[#9CA3AF] text-xs">{athlete.position}</div>
      </div>
    </div>
  );
}
