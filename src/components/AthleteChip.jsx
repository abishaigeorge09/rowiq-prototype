import { useDraggable } from '@dnd-kit/core';
import { getAvatarColor } from '../utils/helpers';

function OarDots({ oarSide }) {
  if (!oarSide) return null;
  return (
    <div className="flex items-center gap-0.5 ml-1">
      {(oarSide === 'port' || oarSide === 'both') && (
        <span className="w-2 h-2 rounded-full bg-[#DC2626] block" title="Port" />
      )}
      {(oarSide === 'starboard' || oarSide === 'both') && (
        <span className="w-2 h-2 rounded-full bg-[#16A34A] block" title="Starboard" />
      )}
    </div>
  );
}

export default function AthleteChip({ athlete, isAssigned, inPair }) {
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
      <div className="min-w-0 flex-1">
        <div className="text-[#111827] text-sm font-medium truncate">{athlete.name}</div>
        <div className="flex items-center gap-1 text-[#9CA3AF] text-xs">
          <span>{athlete.position}</span>
          <OarDots oarSide={athlete.oarSide} />
          {inPair && <span title="In a pair" className="text-[#6B7280]">⛓</span>}
        </div>
      </div>
    </div>
  );
}
