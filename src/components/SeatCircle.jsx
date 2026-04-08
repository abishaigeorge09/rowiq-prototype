import { useDroppable } from '@dnd-kit/core';
import { getAvatarColor } from '../utils/helpers';

function OarDots({ oarSide }) {
  if (!oarSide) return null;
  return (
    <div className="absolute -bottom-0.5 -right-0.5 flex gap-0.5">
      {(oarSide === 'port' || oarSide === 'both') && (
        <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-1 ring-white block" />
      )}
      {(oarSide === 'starboard' || oarSide === 'both') && (
        <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] ring-1 ring-white block" />
      )}
    </div>
  );
}

export default function SeatCircle({
  seat, boatId, athlete, onRemove, published, onTapSelect,
  swapMode, swapSource, onSwapSelect,
  isPortSide,
}) {
  const filled = athlete !== null;

  // mismatch: athlete has a strong side preference placed on wrong side
  const isMismatch = filled && athlete.oarSide && athlete.oarSide !== 'both' && isPortSide !== undefined && (
    (isPortSide && athlete.oarSide === 'starboard') ||
    (!isPortSide && athlete.oarSide === 'port')
  );

  const isSwapSource = swapMode && swapSource &&
    swapSource.boatId === boatId && swapSource.seatNum === seat.seatNum;

  const { setNodeRef, isOver } = useDroppable({
    id: `seat-${boatId}-${seat.seatNum}`,
    data: { boatId, seatNum: seat.seatNum, currentAthleteId: athlete?.id ?? null },
    disabled: published && !swapMode,
  });

  function handleClick() {
    if (published && !swapMode) return;
    if (swapMode && filled && onSwapSelect) {
      onSwapSelect({ boatId, seatNum: seat.seatNum, athleteId: athlete.id });
      return;
    }
    if (!filled && onTapSelect) {
      onTapSelect(seat.seatNum);
    }
  }

  if (filled) {
    let ringClass = 'ring-2 ring-white';
    if (isSwapSource) ringClass = 'ring-2 ring-[#2563EB]';
    else if (swapMode) ringClass = 'ring-2 ring-[#2563EB]/40 ring-dashed';
    else if (isMismatch) ringClass = 'ring-2 ring-amber-400/70';

    return (
      <div
        ref={setNodeRef}
        className="flex flex-col items-center gap-1 min-w-[44px]"
        onClick={handleClick}
      >
        <div className={`relative ${swapMode ? 'cursor-pointer' : 'group'}`}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${ringClass} ${swapMode ? 'hover:scale-105 transition-transform' : ''}`}
            style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
          >
            {athlete.initials}
          </div>
          <OarDots oarSide={athlete.oarSide} />
          {!published && !swapMode && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(seat.seatNum); }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#DC2626] text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
            >
              ×
            </button>
          )}
        </div>
        <span className="text-[#111827] text-[10px] font-semibold truncate max-w-[44px] text-center">
          {athlete.name.split(' ')[0]}
        </span>
        <span className="text-[#9CA3AF] text-[9px]">#{seat.seatNum}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col items-center gap-1 min-w-[44px]"
      onClick={handleClick}
    >
      <div
        className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${
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
