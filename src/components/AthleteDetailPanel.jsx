import { useState, useEffect, useRef } from 'react';
import StatBox from './StatBox';
import CrewCard from './CrewCard';
import { getAvatarColor } from '../utils/helpers';
import { getAthleteHistory, getAthleteStats, formatDate, formatPlacement } from '../utils/history';
import { formatTimer } from '../utils/helpers';

const POSITIONS = ['Stroke', 'Bow', 'Mid'];

function InlineEdit({ value, onSave, className, inputClassName, multiline }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function commit() {
    if (draft.trim() !== value) {
      onSave(draft.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  }

  if (editing) {
    const Tag = multiline ? 'textarea' : 'input';
    return (
      <Tag
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        rows={multiline ? 2 : undefined}
        className={`bg-white border border-[#2563EB] rounded-lg px-2 py-1 text-[#111827] focus:outline-none resize-none w-full ${inputClassName || ''}`}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`group flex items-center gap-1.5 text-left hover:opacity-80 transition-opacity ${className || ''}`}
    >
      <span>{value}</span>
      {saved ? (
        <span className="text-[#16A34A] text-xs">✓</span>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0 text-[#9CA3AF]"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )}
    </button>
  );
}

function HistoryEntry({ entry, allAthletes, onSelectAthlete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors"
      >
        <div className="flex items-center gap-3 text-left min-w-0">
          <div className="shrink-0">
            <div className="text-[#111827] text-sm font-semibold">{entry.boatName}</div>
            <div className="text-[#9CA3AF] text-xs">Seat {entry.seatNum} · {entry.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[#9CA3AF] text-xs">{formatDate(entry.date)}</span>
          {entry.results?.boatResult?.placement && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              entry.results.boatResult.placement === 1
                ? 'bg-amber-50 text-[#F59E0B]'
                : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}>
              {formatPlacement(entry.results.boatResult.placement)}
            </span>
          )}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-[#9CA3AF] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#F3F4F6] px-4 py-3 space-y-3">
          {/* Crew */}
          <div>
            <p className="text-[#9CA3AF] text-[10px] font-semibold tracking-wider uppercase mb-1.5">Crew</p>
            <div className="space-y-0.5">
              {entry.crew.map((member) => {
                const fullAthlete = allAthletes.find((a) => a.id === member.id) || member;
                return (
                  <CrewCard
                    key={member.id}
                    athlete={fullAthlete}
                    seatNum={member.seatNum}
                    onClick={member.id !== entry.athleteId ? () => onSelectAthlete(member.id) : null}
                  />
                );
              })}
            </div>
          </div>

          {/* Results */}
          {entry.results?.boatResult ? (
            <div>
              <p className="text-[#9CA3AF] text-[10px] font-semibold tracking-wider uppercase mb-1.5">Result</p>
              <div className="flex items-center gap-4 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm">
                <span className={`font-bold ${
                  entry.results.boatResult.placement === 1
                    ? 'text-[#F59E0B]'
                    : 'text-[#6B7280]'
                }`}>
                  {formatPlacement(entry.results.boatResult.placement)}
                </span>
                <span className="text-[#111827] font-mono">
                  {formatTimer(entry.results.boatResult.elapsed || 0)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[#9CA3AF] text-xs italic">No session data recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AthleteDetailPanel({ athlete, athletes, publishedLineups, onClose, onSelectAthlete, onUpdateAthlete }) {
  const history = getAthleteHistory(athlete.id, publishedLineups);
  const stats = getAthleteStats(athlete.id, publishedLineups);

  function handleUpdate(field, value) {
    onUpdateAthlete({ id: athlete.id, [field]: value });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        style={{ top: '102px' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 bottom-0 z-40 w-full sm:w-[420px] bg-white border-l border-[#E5E7EB] flex flex-col shadow-xl"
        style={{ animation: 'slideInRight 0.25s ease-out', top: '102px' }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] shrink-0">
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#111827] transition-colors text-sm flex items-center gap-1"
          >
            ← Back
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Header */}
          <div className="px-5 py-5 border-b border-[#F3F4F6]">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
                style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
              >
                {athlete.initials}
              </div>
              <div className="flex-1 min-w-0">
                <InlineEdit
                  value={athlete.name}
                  onSave={(v) => handleUpdate('name', v)}
                  className="text-[#111827] text-xl font-bold"
                  inputClassName="text-xl font-bold"
                />
                <InlineEdit
                  value={athlete.email}
                  onSave={(v) => handleUpdate('email', v)}
                  className="text-[#9CA3AF] text-sm mt-0.5"
                  inputClassName="text-sm mt-0.5"
                />
                {/* Position selector */}
                <div className="flex items-center gap-2 mt-2">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => handleUpdate('position', pos)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        athlete.position === pos
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <div className="flex gap-3">
              <StatBox value={stats.totalSessions} label="Sessions" />
              <StatBox value={stats.boatsRowed} label="Boats Rowed" />
              <StatBox
                value={stats.bestFinish ? formatPlacement(stats.bestFinish) : '—'}
                label="Best Finish"
                gold={stats.bestFinish === 1}
              />
            </div>
          </div>

          {/* Boat History */}
          <div className="px-5 py-4">
            <p className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-3">
              Boat History
            </p>

            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-[#9CA3AF] text-sm">No boat assignments yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <HistoryEntry
                    key={`${entry.lineupId}-${i}`}
                    entry={{ ...entry, athleteId: athlete.id }}
                    allAthletes={athletes}
                    onSelectAthlete={onSelectAthlete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
