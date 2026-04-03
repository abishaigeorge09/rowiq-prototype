import { useState, useEffect } from 'react';
import { getAvatarColor } from '../utils/helpers';

export default function FillBoatSheet({ boat, athletes, onFillSeats, onClose }) {
  const [selected, setSelected] = useState([]);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  const assignedIds = new Set(
    boat.seats.filter((s) => s.athleteId).map((s) => s.athleteId)
  );
  const availableAthletes = athletes.filter((a) => !assignedIds.has(a.id));
  const openSeatCount = boat.seats.filter((s) => !s.athleteId).length;

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < openSeatCount
        ? [...prev, id]
        : prev
    );
  }

  function handleConfirm() {
    if (selected.length > 0) onFillSeats(selected);
    else handleClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-280 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div className={`relative bg-white rounded-t-2xl w-full max-h-[80dvh] flex flex-col shadow-xl transition-transform duration-280 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6] shrink-0">
          <div>
            <h2 className="text-[#111827] font-bold text-base">Fill {boat.name}</h2>
            <p className="text-[#9CA3AF] text-xs mt-0.5">
              {selected.length > 0
                ? `${selected.length} of ${openSeatCount} seats selected`
                : `${openSeatCount} open seats — tap to select`}
            </p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB] transition-colors">
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search athletes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl h-10 pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>
        </div>

        {/* Athlete grid */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {availableAthletes.length === 0 ? (
            <p className="text-center text-[#9CA3AF] text-sm py-10">All athletes are already seated.</p>
          ) : (
            <div className="space-y-2">
              {availableAthletes
                .filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()))
                .length === 0 && (
                  <p className="text-center text-[#9CA3AF] text-sm py-6">No athletes match "{search}"</p>
              )}
              {availableAthletes
                .filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()))
                .map((a) => {
                const idx = selected.indexOf(a.id);
                const isSel = idx !== -1;
                const isMaxed = !isSel && selected.length >= openSeatCount;

                return (
                  <button
                    key={a.id}
                    onClick={() => !isMaxed && toggle(a.id)}
                    disabled={isMaxed}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                      isSel
                        ? 'border-[#2563EB] bg-[#EFF6FF]'
                        : isMaxed
                        ? 'border-[#E5E7EB] bg-[#F9FAFB] opacity-40 cursor-not-allowed'
                        : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] cursor-pointer'
                    }`}
                  >
                    {/* Avatar with order number */}
                    <div className="relative shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: getAvatarColor(a.colorIndex) }}
                      >
                        {a.initials}
                      </div>
                      {isSel && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#2563EB] border-2 border-white flex items-center justify-center text-white text-[9px] font-black">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Name + position */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#111827] text-sm font-semibold truncate">{a.name}</p>
                      <p className="text-[#9CA3AF] text-xs">{a.position}</p>
                    </div>

                    {/* Seat assignment label */}
                    {isSel ? (
                      <span className="shrink-0 text-[#2563EB] text-xs font-bold">Seat {idx + 1}</span>
                    ) : (
                      <span className="shrink-0 w-5 h-5 rounded-full border-2 border-[#D1D5DB]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-4 border-t border-[#F3F4F6] shrink-0 space-y-2">
          <p className="text-[#9CA3AF] text-xs text-center">Athletes fill Seat 1, 2, 3… in the order you tap them</p>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
          >
            {selected.length > 0
              ? `Assign ${selected.length} Athlete${selected.length > 1 ? 's' : ''} →`
              : 'Select athletes above'}
          </button>
        </div>
      </div>
    </div>
  );
}
