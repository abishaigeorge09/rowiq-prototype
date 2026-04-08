import { useState, useEffect } from 'react';
import { getAvatarColor } from '../utils/helpers';

function OarDots({ oarSide }) {
  if (!oarSide) return null;
  return (
    <span className="flex gap-0.5 items-center ml-1">
      {(oarSide === 'port' || oarSide === 'both') && (
        <span className="w-2 h-2 rounded-full bg-[#DC2626] block" />
      )}
      {(oarSide === 'starboard' || oarSide === 'both') && (
        <span className="w-2 h-2 rounded-full bg-[#16A34A] block" />
      )}
    </span>
  );
}

export default function FillBoatSheet({ boat, athletes, pairs = [], onFillSeats, onClose }) {
  const [tab, setTab] = useState('athletes'); // 'athletes' | 'pairs'
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

  const assignedIds = new Set(boat.seats.filter((s) => s.athleteId).map((s) => s.athleteId));
  const availableAthletes = athletes.filter((a) => !assignedIds.has(a.id));
  const openSeatCount = boat.seats.filter((s) => !s.athleteId).length;

  // Available pairs: both athletes must be available and boat must have ≥2 open seats
  const availablePairs = pairs.filter((p) => {
    const portA = athletes.find((a) => a.id === p.portAthleteId);
    const stbdA = athletes.find((a) => a.id === p.starboardAthleteId);
    return portA && stbdA && !assignedIds.has(p.portAthleteId) && !assignedIds.has(p.starboardAthleteId);
  });

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < openSeatCount
        ? [...prev, id]
        : prev
    );
  }

  function selectPair(pair) {
    if (openSeatCount < 2) return;
    const ids = [pair.portAthleteId, pair.starboardAthleteId];
    // Check both aren't already selected
    const allSelected = ids.every((id) => selected.includes(id));
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      // Remove any overlap, then add both if room
      const without = selected.filter((id) => !ids.includes(id));
      if (without.length + 2 <= openSeatCount) {
        setSelected([...without, ...ids]);
      }
    }
  }

  function handleConfirm() {
    if (selected.length > 0) onFillSeats(selected);
    else handleClose();
  }

  const filteredAthletes = availableAthletes.filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Tabs */}
        <div className="flex px-5 pt-3 gap-2 shrink-0">
          {['athletes', 'pairs'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected([]); setSearch(''); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tab === t
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {t === 'athletes' ? 'Athletes' : `⛓ Pairs${availablePairs.length > 0 ? ` (${availablePairs.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* Search (athletes tab only) */}
        {tab === 'athletes' && (
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
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-2">

          {/* Athletes tab */}
          {tab === 'athletes' && (
            <>
              {availableAthletes.length === 0 ? (
                <p className="text-center text-[#9CA3AF] text-sm py-10">All athletes are already seated.</p>
              ) : filteredAthletes.length === 0 ? (
                <p className="text-center text-[#9CA3AF] text-sm py-6">No athletes match "{search}"</p>
              ) : (
                <div className="space-y-2">
                  {filteredAthletes.map((a) => {
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
                        <div className="flex-1 min-w-0">
                          <p className="text-[#111827] text-sm font-semibold truncate">{a.name}</p>
                          <div className="flex items-center gap-1 text-[#9CA3AF] text-xs">
                            <span>{a.position}</span>
                            <OarDots oarSide={a.oarSide} />
                          </div>
                        </div>
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
            </>
          )}

          {/* Pairs tab */}
          {tab === 'pairs' && (
            <>
              {availablePairs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[#9CA3AF] text-sm mb-1">No pairs available</p>
                  <p className="text-[#D1D5DB] text-xs">Create pairs from the Pairs button in the Boats header</p>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  {availablePairs.map((pair) => {
                    const portA = athletes.find((a) => a.id === pair.portAthleteId);
                    const stbdA = athletes.find((a) => a.id === pair.starboardAthleteId);
                    const bothSelected = selected.includes(pair.portAthleteId) && selected.includes(pair.starboardAthleteId);
                    return (
                      <button
                        key={pair.id}
                        onClick={() => selectPair(pair)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                          bothSelected
                            ? 'border-[#2563EB] bg-[#EFF6FF]'
                            : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <span className="text-lg shrink-0">⛓</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#111827] text-sm font-semibold">{pair.name}</p>
                          <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mt-0.5">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#DC2626] block" />
                              {portA?.name.split(' ')[0]}
                            </span>
                            <span>+</span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#16A34A] block" />
                              {stbdA?.name.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                        {bothSelected && (
                          <span className="shrink-0 text-[#2563EB] text-xs font-bold">Selected ✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-4 border-t border-[#F3F4F6] shrink-0 space-y-2">
          {tab === 'athletes' && (
            <p className="text-[#9CA3AF] text-xs text-center">Athletes fill seats in the order you tap them</p>
          )}
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
