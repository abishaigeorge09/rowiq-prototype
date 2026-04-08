import { useState } from 'react';
import SeatCircle from './SeatCircle';
import FillBoatSheet from './FillBoatSheet';
import { getAssignedCount } from '../utils/helpers';

// Boat type options mapped to seat count
const BOAT_TYPES = [
  { label: '1x', size: 1 },
  { label: '2x', size: 2 },
  { label: '4+', size: 4 },
  { label: '8+', size: 8 },
];

// Top-down hull SVG — slim vertical strip
function HullSVG() {
  return (
    <svg viewBox="0 0 24 120" className="w-6 h-full opacity-50" preserveAspectRatio="none">
      <path
        d="M 4 8 Q 2 10 2 12 L 2 108 Q 2 110 4 112 L 12 118 L 20 112 Q 22 110 22 108 L 22 12 Q 22 10 20 8 L 12 3 Z"
        fill="rgba(37,99,235,0.06)"
        stroke="#D1D5DB"
        strokeWidth="1.2"
      />
      <line x1="12" y1="8" x2="12" y2="112" stroke="#E5E7EB" strokeWidth="0.75" />
    </svg>
  );
}

export default function BoatCard({
  boat, athletes, onToggleSize, onRemove, published, onTapSelect, onFillSeats,
  pairs,
  swapMode, swapSource, onSwapSelect,
}) {
  const [showFillSheet, setShowFillSheet] = useState(false);
  const assignedCount = getAssignedCount(boat);
  const openSeats = boat.seats.filter((s) => !s.athleteId);

  function getAthleteForSeat(seat) {
    if (!seat.athleteId) return null;
    return athletes.find((a) => a.id === seat.athleteId) || null;
  }

  // Split seats: even → port (left), odd → starboard (right)
  const portSeats = boat.seats.filter((s) => s.seatNum % 2 === 0).sort((a, b) => a.seatNum - b.seatNum);
  const stbdSeats = boat.seats.filter((s) => s.seatNum % 2 !== 0).sort((a, b) => a.seatNum - b.seatNum);

  // For 1-seat: just render a single centered seat
  const isSingle = boat.size === 1;

  const currentTypeLabel = BOAT_TYPES.find((t) => t.size === boat.size)?.label ?? `${boat.size}`;

  return (
    <>
      <div
        className="bg-white border border-[#E5E7EB] rounded-xl p-4 shrink-0 flex flex-col"
        style={{ width: 360, minHeight: 300 }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[#111827] font-semibold text-base leading-tight">
              {boat.name}
              {published && <span className="ml-2 text-[#16A34A] text-xs font-medium">Published ✓</span>}
            </h3>
            <p className="text-[#9CA3AF] text-xs mt-0.5">{assignedCount}/{boat.size} assigned</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Fill button */}
            {!published && !swapMode && openSeats.length > 0 && athletes.length > 0 && (
              <button
                onClick={() => setShowFillSheet(true)}
                className="px-3 py-1 rounded-lg bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                Fill
              </button>
            )}

            {/* Boat type toggle */}
            {!published && !swapMode && (
              <div className="flex bg-[#F3F4F6] rounded-lg p-0.5">
                {BOAT_TYPES.map(({ label, size }) => (
                  <button
                    key={label}
                    onClick={() => onToggleSize(boat.id, size)}
                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                      boat.size === size
                        ? 'bg-white text-[#2563EB] shadow-sm'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Show type label when published */}
            {(published || swapMode) && (
              <span className="text-[#9CA3AF] text-xs font-semibold bg-[#F3F4F6] px-2 py-1 rounded-lg">
                {currentTypeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Port / Starboard split layout */}
        {isSingle ? (
          /* Single scull — just center the one seat */
          <div className="flex-1 flex items-center justify-center">
            <SeatCircle
              seat={boat.seats[0]}
              boatId={boat.id}
              athlete={getAthleteForSeat(boat.seats[0])}
              onRemove={(seatNum) => onRemove(boat.id, seatNum)}
              published={published}
              onTapSelect={(seatNum) => onTapSelect && onTapSelect(boat.id, seatNum)}
              swapMode={swapMode}
              swapSource={swapSource}
              onSwapSelect={onSwapSelect}
              isPortSide={false}
            />
          </div>
        ) : (
          <div className="flex-1 flex gap-1 min-h-0">
            {/* STARBOARD column — left side */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
                <span className="text-[#16A34A] text-[10px] font-bold tracking-widest uppercase">Stbd</span>
              </div>
              <div className="flex flex-col gap-2 items-center">
                {stbdSeats.map((seat) => (
                  <SeatCircle
                    key={seat.seatNum}
                    seat={seat}
                    boatId={boat.id}
                    athlete={getAthleteForSeat(seat)}
                    onRemove={(seatNum) => onRemove(boat.id, seatNum)}
                    published={published}
                    onTapSelect={(seatNum) => onTapSelect && onTapSelect(boat.id, seatNum)}
                    swapMode={swapMode}
                    swapSource={swapSource}
                    onSwapSelect={onSwapSelect}
                    isPortSide={false}
                  />
                ))}
              </div>
            </div>

            {/* Center hull */}
            <div className="flex items-stretch justify-center w-8 shrink-0 py-6">
              <HullSVG />
            </div>

            {/* PORT column — right side */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-end gap-1 mb-2">
                <span className="text-[#DC2626] text-[10px] font-bold tracking-widest uppercase">Port</span>
                <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
              </div>
              <div className="flex flex-col gap-2 items-center">
                {portSeats.map((seat) => (
                  <SeatCircle
                    key={seat.seatNum}
                    seat={seat}
                    boatId={boat.id}
                    athlete={getAthleteForSeat(seat)}
                    onRemove={(seatNum) => onRemove(boat.id, seatNum)}
                    published={published}
                    onTapSelect={(seatNum) => onTapSelect && onTapSelect(boat.id, seatNum)}
                    swapMode={swapMode}
                    swapSource={swapSource}
                    onSwapSelect={onSwapSelect}
                    isPortSide={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showFillSheet && (
        <FillBoatSheet
          boat={boat}
          athletes={athletes}
          pairs={pairs}
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
