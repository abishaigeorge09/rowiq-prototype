import { getAvatarColor } from '../utils/helpers';

export default function CrewCard({ athlete, seatNum, overlapCount, isCurrentAthlete, onClick }) {
  const isFirst = overlapCount === 0;

  return (
    <button
      onClick={onClick}
      disabled={isCurrentAthlete || !onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left ${
        isCurrentAthlete
          ? 'bg-[#2563EB]/10 border border-[#2563EB]/20 cursor-default'
          : onClick
          ? 'hover:bg-[#F9FAFB] cursor-pointer'
          : 'cursor-default'
      }`}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
      >
        {athlete.initials}
      </div>

      {/* Name + seat */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[#111827] text-sm font-medium truncate">{athlete.name}</span>
          {isCurrentAthlete && (
            <span className="text-[#2563EB] text-[10px] font-semibold shrink-0">YOU</span>
          )}
        </div>
        <div className="text-[#9CA3AF] text-xs">
          Seat {seatNum} · {athlete.position}
        </div>
      </div>

      {/* Overlap badge — only shown when not the current athlete */}
      {!isCurrentAthlete && overlapCount !== undefined && (
        <div className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          isFirst
            ? 'bg-[#2563EB]/15 text-[#2563EB]'
            : 'bg-[#F3F4F6] text-[#6B7280]'
        }`}>
          {isFirst ? 'First time' : `${overlapCount}× together`}
        </div>
      )}
    </button>
  );
}
