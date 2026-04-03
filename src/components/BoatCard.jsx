import { useState } from 'react';
import SeatCircle from './SeatCircle';
import FillBoatSheet from './FillBoatSheet';
import { getAssignedCount } from '../utils/helpers';

function RowingShellSVG({ size }) {
  const width = 340;
  const seatCount = size;
  const hullPadding = 18;
  const seatSpacing = (width - hullPadding * 2) / (seatCount + 1);

  return (
    <svg viewBox={`0 0 ${width} 60`} className="w-full h-auto my-2 opacity-70">
      {/* Hull */}
      <path
        d={`M ${hullPadding + 8} 30
            Q ${hullPadding - 5} 30, ${hullPadding - 2} 27
            L ${hullPadding + 2} 23
            Q ${hullPadding + 5} 20, ${hullPadding + 15} 20
            L ${width - hullPadding - 15} 20
            Q ${width - hullPadding - 5} 20, ${width - hullPadding} 25
            L ${width - hullPadding + 3} 30
            Q ${width - hullPadding} 35, ${width - hullPadding - 5} 40
            L ${width - hullPadding - 15} 40
            L ${hullPadding + 15} 40
            Q ${hullPadding + 5} 40, ${hullPadding} 35
            L ${hullPadding - 2} 33
            Q ${hullPadding - 5} 30, ${hullPadding + 8} 30 Z`}
        fill="rgba(37,99,235,0.05)"
        stroke="#D1D5DB"
        strokeWidth="1.2"
      />
      <line x1={hullPadding + 15} y1="30" x2={width - hullPadding - 10} y2="30" stroke="#E5E7EB" strokeWidth="0.75" />
      {/* Rudder */}
      <polygon
        points={`${hullPadding - 3},27 ${hullPadding - 8},30 ${hullPadding - 3},33`}
        fill="none"
        stroke="#D1D5DB"
        strokeWidth="0.75"
      />
      {/* Seats + oars */}
      {Array.from({ length: seatCount }).map((_, i) => {
        const cx = hullPadding + seatSpacing * (i + 1);
        const isPort = i % 2 === 0;
        const oarY = isPort ? 17 : 43;
        const oarEndY = isPort ? 7 : 53;
        return (
          <g key={i}>
            <circle cx={cx} cy="30" r="3" fill="none" stroke="#9CA3AF" strokeWidth="1" />
            <line x1={cx} y1={oarY} x2={cx + (isPort ? -5 : 5)} y2={oarEndY} stroke="#E5E7EB" strokeWidth="0.75" />
            <ellipse
              cx={cx + (isPort ? -6 : 6)} cy={oarEndY + (isPort ? -1 : 1)}
              rx="1.8" ry="3.5" fill="none" stroke="#E5E7EB" strokeWidth="0.5"
              transform={`rotate(${isPort ? -15 : 15}, ${cx + (isPort ? -6 : 6)}, ${oarEndY + (isPort ? -1 : 1)})`}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function BoatCard({ boat, athletes, onToggleSize, onRemove, published, onTapSelect, onFillSeats }) {
  const [showFillSheet, setShowFillSheet] = useState(false);
  const assignedCount = getAssignedCount(boat);
  const openSeats = boat.seats.filter((s) => !s.athleteId);

  function getAthleteForSeat(seat) {
    if (!seat.athleteId) return null;
    return athletes.find((a) => a.id === seat.athleteId) || null;
  }

  // Split seats into rows for uniform layout
  const topRow = boat.seats.slice(0, 4);
  const bottomRow = boat.size === 8 ? boat.seats.slice(4) : [];

  return (
    <>
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 w-[360px] shrink-0 flex flex-col" style={{ minHeight: 300 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-[#111827] font-semibold text-base">
              {boat.name}
              {published && <span className="ml-2 text-[#16A34A] text-xs font-medium">Published ✓</span>}
            </h3>
            <p className="text-[#9CA3AF] text-xs mt-0.5">{assignedCount}/{boat.size} assigned</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Fill Boat button */}
            {!published && openSeats.length > 0 && athletes.length > 0 && (
              <button
                onClick={() => setShowFillSheet(true)}
                className="px-3 py-1 rounded-lg bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                Fill
              </button>
            )}

            {/* Size toggle */}
            {!published && (
              <div className="flex bg-[#F3F4F6] rounded-lg p-0.5">
                <button
                  onClick={() => onToggleSize(boat.id, 4)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    boat.size === 4 ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  4×
                </button>
                <button
                  onClick={() => onToggleSize(boat.id, 8)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    boat.size === 8 ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  8×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SVG Hull */}
        <RowingShellSVG size={boat.size} />

        {/* Seat grid — 2 rows for 8-seat, 1 row for 4-seat */}
        <div className="flex flex-col gap-3 flex-1 justify-center mt-1">
          {/* Top row (seats 1-4) */}
          <div className="flex gap-2 justify-center">
            {topRow.map((seat) => (
              <SeatCircle
                key={seat.seatNum}
                seat={seat}
                boatId={boat.id}
                athlete={getAthleteForSeat(seat)}
                onRemove={(seatNum) => onRemove(boat.id, seatNum)}
                published={published}
                onTapSelect={(seatNum) => onTapSelect && onTapSelect(boat.id, seatNum)}
              />
            ))}
          </div>
          {/* Bottom row (seats 5-8, 8-seat only) */}
          {bottomRow.length > 0 && (
            <div className="flex gap-2 justify-center">
              {bottomRow.map((seat) => (
                <SeatCircle
                  key={seat.seatNum}
                  seat={seat}
                  boatId={boat.id}
                  athlete={getAthleteForSeat(seat)}
                  onRemove={(seatNum) => onRemove(boat.id, seatNum)}
                  published={published}
                  onTapSelect={(seatNum) => onTapSelect && onTapSelect(boat.id, seatNum)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showFillSheet && (
        <FillBoatSheet
          boat={boat}
          athletes={athletes}
          onFillSeats={(athleteIds) => {
            onFillSeats?.(boat.id, athleteIds);
            setShowFillSheet(false);
          }}
          onClose={() => setShowFillSheet(false)}
        />
      )}
    </>
  );
}
