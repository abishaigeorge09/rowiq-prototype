import { useState, useEffect } from 'react';
import { getAvatarColor } from '../utils/helpers';

export default function ImportRosterSheet({ athletes, batches, boats, isAssigned, onImport, onClose }) {
  const [activeBatch, setActiveBatch] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  function toggle(id) {
    if (isAssigned(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const toAdd = athletes.filter((a) => selected.has(a.id));
    if (toAdd.length) onImport(toAdd);
    else handleClose();
  }

  const displayedAthletes = activeBatch
    ? athletes.filter((a) => a.batchId === activeBatch)
    : athletes;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-280 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`relative bg-white rounded-t-2xl w-full max-h-[85dvh] flex flex-col shadow-xl transition-transform duration-280 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6]">
          <div>
            <h2 className="text-[#111827] font-bold text-base">Import from Roster</h2>
            <p className="text-[#9CA3AF] text-xs mt-0.5">
              {selected.size > 0 ? `${selected.size} selected` : 'Tap athletes to select'}
            </p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {batches.length > 1 && (
          <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-none border-b border-[#F3F4F6]">
            <button onClick={() => setActiveBatch(null)} className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${activeBatch === null ? 'bg-[#2563EB] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'}`}>
              All ({athletes.length})
            </button>
            {batches.map((b) => (
              <button key={b.id} onClick={() => setActiveBatch(activeBatch === b.id ? null : b.id)} className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${activeBatch === b.id ? 'bg-[#2563EB] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'}`}>
                {b.name} ({b.count})
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayedAthletes.map((a) => {
              const seated = isAssigned(a.id);
              const sel = selected.has(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  disabled={seated}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    seated ? 'border-[#E5E7EB] bg-[#F9FAFB] opacity-40 cursor-not-allowed'
                    : sel ? 'border-[#2563EB] bg-blue-50'
                    : 'border-[#E5E7EB] bg-white hover:border-[#2563EB]/40 active:scale-95'
                  }`}
                >
                  <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: getAvatarColor(a.colorIndex) }}>
                    {a.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#111827] text-xs font-semibold truncate">{a.name}</p>
                    <p className="text-[#9CA3AF] text-[10px]">{seated ? 'In boat' : a.position}</p>
                  </div>
                  {sel && (
                    <div className="ml-auto shrink-0 w-4 h-4 rounded-full bg-[#2563EB] flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 pb-6 pt-3 border-t border-[#F3F4F6]">
          <button
            onClick={handleAdd}
            disabled={selected.size === 0}
            className="w-full py-3.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1d4ed8] transition-colors active:scale-[0.98]"
          >
            {selected.size > 0 ? `Add ${selected.size} Athlete${selected.size > 1 ? 's' : ''}` : 'Select athletes above'}
          </button>
        </div>
      </div>
    </div>
  );
}
