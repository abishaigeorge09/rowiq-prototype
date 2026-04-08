import { useState, useEffect } from 'react';
import { getAvatarColor, generateId } from '../utils/helpers';

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

function AthletePicker({ label, color, athletes, excludeId, value, onChange }) {
  const [search, setSearch] = useState('');
  const filtered = athletes.filter(
    (a) =>
      a.id !== excludeId &&
      (!search || a.name.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{label}</span>
      </div>
      <div className="relative mb-2">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          placeholder={`Search ${label.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl h-9 pl-8 pr-3 text-xs text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB]"
        />
      </div>
      <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-[#E5E7EB] p-1">
        {filtered.length === 0 ? (
          <p className="text-[#9CA3AF] text-xs text-center py-3">No athletes found</p>
        ) : (
          filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => onChange(a.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                value === a.id
                  ? 'bg-[#EFF6FF] border border-[#2563EB]/30'
                  : 'hover:bg-[#F9FAFB]'
              }`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ backgroundColor: getAvatarColor(a.colorIndex) }}
              >
                {a.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[#111827] text-xs font-semibold truncate">{a.name}</p>
              </div>
              <OarDots oarSide={a.oarSide} />
              {value === a.id && <span className="text-[#2563EB] text-xs shrink-0">✓</span>}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function PairsManager({ athletes, pairs, onAddPair, onRemovePair, onClose }) {
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'create'
  const [portId, setPortId] = useState('');
  const [stbdId, setStbdId] = useState('');
  const [pairName, setPairName] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  function handleCreate() {
    if (!portId || !stbdId || portId === stbdId) return;
    const portAthlete = athletes.find((a) => a.id === portId);
    const stbdAthlete = athletes.find((a) => a.id === stbdId);
    const name = pairName.trim() ||
      `${portAthlete?.name.split(' ')[0]} & ${stbdAthlete?.name.split(' ')[0]}`;
    onAddPair({ id: generateId(), name, portAthleteId: portId, starboardAthleteId: stbdId });
    setPortId('');
    setStbdId('');
    setPairName('');
    setView('list');
  }

  const canCreate = portId && stbdId && portId !== stbdId;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-280 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div className={`relative bg-white rounded-t-2xl w-full max-h-[85dvh] flex flex-col shadow-xl transition-transform duration-280 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6] shrink-0">
          <div className="flex items-center gap-2">
            {view === 'create' && (
              <button onClick={() => setView('list')} className="text-[#6B7280] mr-1">←</button>
            )}
            <h2 className="text-[#111827] font-bold text-base">
              {view === 'list' ? '⛓ Pairs' : 'New Pair'}
            </h2>
            {view === 'list' && (
              <span className="text-[#9CA3AF] text-xs">{pairs.length} pair{pairs.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {view === 'list' && (
              <button
                onClick={() => setView('create')}
                className="px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-[#1d4ed8] transition-colors"
              >
                + New Pair
              </button>
            )}
            <button onClick={handleClose} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB]">
              ✕
            </button>
          </div>
        </div>

        {/* Pair list */}
        {view === 'list' && (
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {pairs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-4xl">⛓</span>
                <p className="text-[#6B7280] text-sm text-center">No pairs yet. Create one to assign two athletes together.</p>
                <button
                  onClick={() => setView('create')}
                  className="px-5 py-2 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-colors"
                >
                  Create First Pair
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {pairs.map((pair) => {
                  const portA = athletes.find((a) => a.id === pair.portAthleteId);
                  const stbdA = athletes.find((a) => a.id === pair.starboardAthleteId);
                  return (
                    <div key={pair.id} className="flex items-center gap-3 bg-[#F9FAFB] rounded-xl px-4 py-3 border border-[#E5E7EB]">
                      <span className="text-xl shrink-0">⛓</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#111827] text-sm font-semibold">{pair.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                            <span className="w-2 h-2 rounded-full bg-[#DC2626] block" />
                            {portA ? (
                              <span className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: getAvatarColor(portA.colorIndex) }}>
                                  {portA.initials}
                                </div>
                                {portA.name.split(' ')[0]}
                              </span>
                            ) : 'Unknown'}
                          </span>
                          <span className="text-[#D1D5DB] text-xs">+</span>
                          <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                            <span className="w-2 h-2 rounded-full bg-[#16A34A] block" />
                            {stbdA ? (
                              <span className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: getAvatarColor(stbdA.colorIndex) }}>
                                  {stbdA.initials}
                                </div>
                                {stbdA.name.split(' ')[0]}
                              </span>
                            ) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemovePair(pair.id)}
                        className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] hover:text-[#DC2626] hover:border-[#DC2626]/30 transition-colors shrink-0 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Create view */}
        {view === 'create' && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#6B7280] font-bold block mb-1.5">Pair Name (optional)</label>
              <input
                placeholder="e.g. Johnson & Lee"
                value={pairName}
                onChange={(e) => setPairName(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl h-10 px-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB]"
              />
            </div>
            <AthletePicker
              label="Port athlete"
              color="#DC2626"
              athletes={athletes}
              excludeId={stbdId}
              value={portId}
              onChange={setPortId}
            />
            <AthletePicker
              label="Starboard athlete"
              color="#16A34A"
              athletes={athletes}
              excludeId={portId}
              value={stbdId}
              onChange={setStbdId}
            />
          </div>
        )}

        {/* Footer for create view */}
        {view === 'create' && (
          <div className="px-5 pb-6 pt-4 border-t border-[#F3F4F6] shrink-0">
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#2563EB] text-white hover:bg-[#1d4ed8] active:scale-[0.98]"
            >
              {canCreate ? 'Save Pair →' : 'Select both athletes above'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
