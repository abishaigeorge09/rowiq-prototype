import { useDroppable } from '@dnd-kit/core';
import { getAvatarColor } from '../utils/helpers';

export default function SeatCircle({ seat, boatId, athlete, onRemove, published, onTapSelect }) {
  const filled = athlete !== null;

  const { setNodeRef, isOver } = useDroppable({
    id: `seat-${boatId}-${seat.seatNum}`,
    data: { boatId, seatNum: seat.seatNum },
    disabled: filled || published,
  });

  function handleClick() {
    if (published) return;
    if (!filled && onTapSelect) {
      onTapSelect(seat.seatNum);
    }
  }

  if (filled) {
    return (
      <div className="flex flex-col items-center gap-1 min-w-[52px]">
        <div className="relative group">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm"
            style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
          >
            {athlete.initials}
          </div>
          {!published && (
            <button
              onClick={() => onRemove(seat.seatNum)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#DC2626] text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
            >
              ×
            </button>
          )}
        </div>
        <span className="text-[#111827] text-[10px] font-semibold truncate max-w-[52px]">
          {athlete.name.split(' ')[0]}
        </span>
        <span className="text-[#9CA3AF] text-[9px]">#{seat.seatNum}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col items-center gap-1 min-w-[52px]"
      onClick={handleClick}
    >
      <div
        className={`w-11 h-11 rounded-full border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${
          isOver
            ? 'border-[#2563EB] bg-blue-50 shadow-sm scale-110'
            : 'border-[#D1D5DB] hover:border-[#2563EB]/50 hover:bg-blue-50/50'
        }`}
      >
        <span className="text-[#9CA3AF] text-xs font-semibold">{seat.seatNum}</span>
      </div>
      <span className="text-[#D1D5DB] text-[9px]">Open</span>
    </div>
  );
}
