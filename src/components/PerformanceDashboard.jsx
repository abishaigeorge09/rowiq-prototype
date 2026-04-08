import { useMemo, useState } from 'react';
import { getAvatarColor, exportCSV, formatTimerMs } from '../utils/helpers';
import { formatDate, formatPlacement } from '../utils/history';

function formatElapsed(ms) {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000);
  const tenth = Math.floor((ms % 1000) / 100);
  return `${m}:${String(s).padStart(2, '0')}.${tenth}`;
}

function formatDelta(deltaMs) {
  if (deltaMs === null) return null;
  const abs = Math.abs(deltaMs);
  const s = Math.floor(abs / 1000) % 60;
  const m = Math.floor(abs / 60000);
  const tenth = Math.floor((abs % 1000) / 100);
  const str = m > 0 ? `${m}:${String(s).padStart(2,'0')}.${tenth}` : `${s}.${tenth}s`;
  return deltaMs < 0 ? `-${str}` : `+${str}`;
}

function StatPill({ label, value, sub }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex-1 min-w-[130px]">
      <div className="text-[#9CA3AF] text-[10px] font-semibold uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[#111827] font-bold text-lg leading-tight">{value}</div>
      {sub && <div className="text-[#6B7280] text-xs mt-0.5">{sub}</div>}
    </div>
  );
}

function ExportButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] text-xs font-semibold transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {label}
    </button>
  );
}

function MonthSessionsView({ monthLabel, groups, expandedGroups, toggleGroup, athletes }) {
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [showSwapsByGroup, setShowSwapsByGroup] = useState({});

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return (groups || []).filter((group) => {
      const base = group?.[0];
      const title = (base?.title || '').toLowerCase();
      const note = (base?.note || '').toLowerCase();
      return title.includes(q) || note.includes(q);
    });
  }, [groups, query]);

  const total = filteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const viewPage = Math.min(page, totalPages);
  const startIdx = (viewPage - 1) * pageSize;
  const pageGroups = filteredGroups.slice(startIdx, startIdx + pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[#111827] text-xl font-bold">Sessions</h2>
          <p className="text-[#6B7280] text-sm mt-1">
            {monthLabel ? `${monthLabel} · ` : ''}
            {total} {total === 1 ? 'session' : 'sessions'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search sessions…"
              className="h-9 w-[220px] bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="h-9 bg-white border border-[#E5E7EB] rounded-xl px-3 text-sm font-semibold text-[#374151] outline-none focus:border-[#2563EB]"
          >
            {[5, 10, 15, 25].map((n) => (
              <option key={n} value={n}>{n}/page</option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={viewPage <= 1}
              className="h-9 w-9 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] disabled:opacity-40"
              title="Previous page"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div className="text-xs font-semibold text-[#6B7280] px-2">
              Page {viewPage} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={viewPage >= totalPages}
              className="h-9 w-9 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] disabled:opacity-40"
              title="Next page"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>

      {pageGroups.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center shadow-sm">
          <p className="text-[#9CA3AF] text-sm">No sessions match your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pageGroups.map((group, localGIdx) => {
            const base = group[0];
            const gKey = `${monthLabel || 'all'}-${startIdx + localGIdx}`;
            const isExpanded = expandedGroups[gKey];

            return (
              <div key={`session-${gKey}`} className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                <button
                  onClick={() => toggleGroup(gKey)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#F9FAFB] transition-colors text-left"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-[#111827] font-bold text-base">{base?.title ? base.title.split(' · ')[0] : 'Session'}</h3>
                      <span className="text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border border-blue-100">
                        {group.length} {group.length === 1 ? 'Run' : 'Runs'}
                      </span>
                    </div>
                    <p className="text-[#6B7280] text-xs font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      {formatDate(base?.date)} {base?.time ? `· ${base.time}` : ''}
                    </p>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 border border-[#E5E7EB] bg-white text-[#6B7280] shadow-sm ${isExpanded ? 'rotate-180 bg-[#F3F4F6] text-[#111827]' : ''}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-[#F3F4F6] bg-white pt-3">
                    {/* Lineups first: show athletes in each boat for every run */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider">Lineups</h4>
                      <div className="space-y-3">
                        {(group || []).map((run, runIdx) => (
                          <div key={run.id} className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-bold text-[#111827]">
                                {run.title ? run.title.split(' · ').pop() : `Run ${runIdx + 1}`}
                              </div>
                              <div className="text-xs font-semibold text-[#6B7280]">
                                {run.time ? run.time : ''}
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {(run.boats || []).map((boat) => (
                                <div key={boat.id} className="bg-white border border-[#E5E7EB] rounded-xl p-3">
                                  <div className="text-xs font-bold text-[#111827]">{boat.name}</div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {(boat.athletes || [])
                                      .slice()
                                      .sort((a, b) => (a.seatNum || 0) - (b.seatNum || 0))
                                      .map((m) => {
                                        const full = athletes.find((at) => at.id === m.id) || m;
                                        return (
                                          <div key={`${boat.id}-${m.id}-${m.seatNum || 0}`} className="flex items-center gap-2 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl px-2.5 py-2">
                                            <div
                                              className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                                              style={{ backgroundColor: getAvatarColor(full.colorIndex ?? 0) }}
                                              title={full.name}
                                            >
                                              {full.initials}
                                            </div>
                                            <div className="min-w-0">
                                              <div className="text-[11px] font-semibold text-[#111827] truncate">
                                                {full.name}
                                              </div>
                                              <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                                                Seat {m.seatNum || '—'}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Collapsible swaps/deltas */}
                    {group.length > 1 && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowSwapsByGroup((prev) => ({ ...prev, [gKey]: !prev[gKey] }))}
                          className="w-full flex items-center justify-between bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 hover:bg-[#F9FAFB] transition-colors"
                        >
                          <span className="text-sm font-bold text-[#111827]">
                            {showSwapsByGroup[gKey] ? 'Hide swaps made' : 'See swaps made'}
                          </span>
                          <span className="text-[#9CA3AF]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </span>
                        </button>
                      </div>
                    )}

                    {group.length > 1 && showSwapsByGroup[gKey] && (
                      <div className="space-y-4 mt-4">
                        {(group || []).slice(1).map((run, i) => {
                          const prev = group[i] || {};
                          const runChanges = [];
                          (run?.boats || []).forEach((runBoat) => {
                            const prevBoat = (prev?.boats || []).find((b) => b.id === runBoat?.id);
                            if (!prevBoat) return;

                            const runAthletes = runBoat?.athletes || [];
                            const prevAthletes = prevBoat?.athletes || [];

                            runAthletes.forEach((runAthlete) => {
                              const prevAthlete = prevAthletes.find((a) => a.seatNum === runAthlete.seatNum);
                              if (prevAthlete && prevAthlete.id !== runAthlete.id) {
                                runChanges.push({
                                  boatName: runBoat.name,
                                  seatNum: runAthlete.seatNum,
                                  from: prevAthlete.name ? prevAthlete.name.split(' ')[0] : 'Unknown',
                                  to: runAthlete.name ? runAthlete.name.split(' ')[0] : 'Unknown',
                                });
                              }
                            });
                          });

                          return (
                            <div key={run.id} className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl overflow-hidden">
                              <div className="bg-[#F3F4F6] px-4 py-2.5 border-b border-[#E5E7EB] flex justify-between items-center">
                                <div className="font-semibold text-sm text-[#111827]">
                                  {prev.title ? prev.title.split(' · ').pop() : 'Run'} → {run.title ? run.title.split(' · ').pop() : 'Run'}
                                </div>
                                {runChanges.length === 0 ? (
                                  <span className="text-xs font-semibold text-[#6B7280]">No athletes swapped</span>
                                ) : (
                                  <span className="text-xs font-bold text-[#2563EB] bg-blue-100 px-2 py-0.5 rounded-full">{runChanges.length} Swaps Detected</span>
                                )}
                              </div>

                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-[10px] uppercase font-bold text-[#9CA3AF] mb-2 tracking-wider">Lineup Changes</h4>
                                  {runChanges.length > 0 ? (
                                    <ul className="space-y-2">
                                      {runChanges.map((c, idx) => (
                                        <li key={idx} className="text-xs text-[#374151] flex items-center gap-2 bg-[#F9FAFB] px-3 py-2 rounded-lg border border-[#F3F4F6]">
                                          <span className="font-semibold">{c.boatName} (Seat {c.seatNum}):</span>
                                          <span className="text-[#DC2626] line-through decoration-[#FCA5A5]">{c.from}</span>
                                          <span className="text-[#9CA3AF]">→</span>
                                          <span className="text-[#16A34A] font-bold">{c.to}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="text-xs text-[#9CA3AF] italic bg-[#F9FAFB] px-3 py-2 rounded-lg border border-[#F3F4F6]">Identical lineup</div>
                                  )}
                                </div>

                                <div>
                                  <h4 className="text-[10px] uppercase font-bold text-[#9CA3AF] mb-2 tracking-wider">Performance Impact vs Previous Run</h4>
                                  <div className="space-y-2">
                                    {(run?.results?.boats || []).map((rBoat) => {
                                      const pBoat = (prev?.results?.boats || []).find((b) => b.boatId === rBoat?.boatId);
                                      if (!pBoat || typeof pBoat.elapsed !== 'number' || typeof rBoat.elapsed !== 'number') return null;
                                      const delta = rBoat.elapsed - pBoat.elapsed;
                                      const deltaStr = formatDelta(delta);

                                      return (
                                        <div key={rBoat.boatId} className="flex items-center justify-between text-xs bg-[#F9FAFB] px-3 py-2 rounded-lg border border-[#F3F4F6]">
                                          <span className="font-semibold text-[#374151]">{rBoat.boatName}</span>
                                          <div className="flex items-center gap-3">
                                            <span className="text-[#6B7280] font-mono">{formatTimerMs(rBoat.elapsed)}</span>
                                            <span className={`font-mono w-[65px] text-right font-bold tracking-wide ${delta < 0 ? 'text-[#16A34A]' : delta > 0 ? 'text-[#DC2626]' : 'text-[#9CA3AF]'}`}>
                                              {deltaStr || '0.0s'}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* If single-run session, still show a leaderboard below lineups */}
                    {group.length === 1 && group[0]?.results?.boats?.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider">Run Results</h4>
                        {[...(group[0]?.results?.boats || [])]
                          .slice()
                          .sort((a, b) => a.placement - b.placement)
                          .map((boat) => (
                            <div key={boat.boatId} className="flex items-center justify-between bg-white border border-[#E5E7EB] shadow-sm rounded-xl px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className={`font-bold text-sm w-6 ${boat.placement === 1 ? 'text-[#F59E0B]' : 'text-[#6B7280]'}`}>
                                  {formatPlacement(boat.placement)}
                                </span>
                                <span className="text-[#111827] text-sm font-bold">{boat.boatName}</span>
                              </div>
                              <span className="font-mono text-sm tracking-wide text-[#111827] font-bold">
                                {boat.finishTime || formatElapsed(boat.elapsed)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AthleteDetail({ stat, onBack }) {
  const { athlete, appearances, boatSummaries, totalSessions, bestFinish } = stat;

  // Chronological for trend deltas
  const chronoAppearances = [...appearances]
    .filter((a) => a.elapsed != null)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const sortedAppearances = [...appearances].sort((a, b) =>
    (b.date || '').localeCompare(a.date || '')
  );

  const fastestTime = boatSummaries.reduce((best, bs) => {
    if (bs.bestTime && (best === null || bs.bestTime < best)) return bs.bestTime;
    return best;
  }, null);

  // Build delta map: lineupId → delta vs previous session (same boat)
  const deltaMap = {};
  const prevByBoat = {};
  for (const ap of chronoAppearances) {
    const prev = prevByBoat[ap.boatName];
    if (prev != null) deltaMap[ap.lineupId + ap.boatName] = ap.elapsed - prev;
    prevByBoat[ap.boatName] = ap.elapsed;
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] text-sm transition-colors mb-5"
      >
        ← All Athletes
      </button>

      {/* Athlete header card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 mb-5">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
          >
            {athlete.initials}
          </div>
          <div>
            <h3 className="text-[#111827] text-xl font-bold">{athlete.name}</h3>
            <span className="text-[#6B7280] text-sm">{athlete.position}</span>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="bg-[#F7F8FA] rounded-xl px-4 py-2.5 text-center">
            <div className="text-[#111827] font-bold text-lg">{totalSessions}</div>
            <div className="text-[#9CA3AF] text-[10px] uppercase tracking-wider">Sessions</div>
          </div>
          {bestFinish && (
            <div className="bg-[#F7F8FA] rounded-xl px-4 py-2.5 text-center">
              <div className={`font-bold text-lg ${bestFinish === 1 ? 'text-[#F59E0B]' : 'text-[#111827]'}`}>
                {formatPlacement(bestFinish)}
              </div>
              <div className="text-[#9CA3AF] text-[10px] uppercase tracking-wider">Best Finish</div>
            </div>
          )}
          {fastestTime && (
            <div className="bg-[#F7F8FA] rounded-xl px-4 py-2.5 text-center">
              <div className="text-[#111827] font-bold text-lg font-mono">{formatElapsed(fastestTime)}</div>
              <div className="text-[#9CA3AF] text-[10px] uppercase tracking-wider">Fastest</div>
            </div>
          )}
        </div>
      </div>

      {/* Per-boat stats */}
      {boatSummaries.length > 0 && (
        <div className="mb-5">
          <h4 className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider mb-3">Per-Boat Stats</h4>
          <div className="space-y-2">
            {boatSummaries.map((bs) => (
              <div key={bs.boatName} className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[#111827] font-semibold text-sm">{bs.boatName}</span>
                  <span className="text-[#9CA3AF] text-xs">{bs.count}× rowed</span>
                  {bs.wins > 0 && (
                    <span className="text-[#F59E0B] text-xs font-semibold">{bs.wins} 🥇</span>
                  )}
                </div>
                <div className="flex items-center gap-5">
                  {bs.bestTime && (
                    <div className="text-right">
                      <div className="text-[#111827] font-mono text-sm">{formatElapsed(bs.bestTime)}</div>
                      <div className="text-[#9CA3AF] text-[9px] uppercase">Best</div>
                    </div>
                  )}
                  {bs.avgTime && bs.count > 1 && (
                    <div className="text-right">
                      <div className="text-[#6B7280] font-mono text-sm">{formatElapsed(bs.avgTime)}</div>
                      <div className="text-[#9CA3AF] text-[9px] uppercase">Avg</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session timeline with trend deltas */}
      <div>
        <h4 className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider mb-3">Session History</h4>
        <div className="space-y-2">
          {sortedAppearances.map((entry, i) => {
            const deltaKey = entry.lineupId + entry.boatName;
            const delta = entry.elapsed ? deltaMap[deltaKey] : null;
            const deltaStr = formatDelta(delta);
            return (
              <div
                key={`${entry.lineupId}-${i}`}
                className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-[#111827] text-sm font-medium">{entry.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[#9CA3AF] text-xs">{formatDate(entry.date)}</span>
                    <span className="text-[#9CA3AF] text-xs">·</span>
                    <span className="text-[#6B7280] text-xs">{entry.boatName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {deltaStr && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      delta < 0
                        ? 'bg-green-50 text-[#16A34A]'
                        : 'bg-red-50 text-[#DC2626]'
                    }`}>
                      {deltaStr}
                    </span>
                  )}
                  <span className="text-[#111827] font-mono text-sm">
                    {entry.finishTime || formatElapsed(entry.elapsed) || '—'}
                  </span>
                  {entry.placement ? (
                    <span className={`text-xs font-bold w-8 text-right ${entry.placement === 1 ? 'text-[#F59E0B]' : 'text-[#374151]'}`}>
                      {formatPlacement(entry.placement)}
                    </span>
                  ) : (
                    <span className="text-[#9CA3AF] text-xs w-8 text-right">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const DATE_RANGES = [
  { label: 'Last Month', value: '1m' },
  { label: 'Last 3 Months', value: '3m' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'All Time', value: 'all' },
];
const POSITIONS = ['All', 'Stroke', 'Mid', 'Bow'];
const SORT_OPTIONS = [
  { label: 'Sessions', value: 'sessions' },
  { label: 'Best Time', value: 'bestTime' },
  { label: 'Win %', value: 'winPct' },
  { label: 'Best Finish', value: 'bestFinish' },
];

export default function PerformanceDashboard({ athletes, publishedLineups }) {
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const [positionFilter, setPositionFilter] = useState('All');
  const [athleteSort, setAthleteSort] = useState('sessions');
  const [boatSortCol, setBoatSortCol] = useState('sessions');
  const [boatSortDir, setBoatSortDir] = useState('desc');

  // Compute cutoff date from filter
  const filteredLineups = useMemo(() => {
    if (dateRange === 'all') return publishedLineups;
    const now = new Date();
    const months = dateRange === '1m' ? 1 : dateRange === '3m' ? 3 : 6;
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - months);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return publishedLineups.filter((l) => l.date >= cutoffStr);
  }, [publishedLineups, dateRange]);

  const completedLineups = useMemo(() => filteredLineups.filter((l) => l.results), [filteredLineups]);

  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = (gIdx) => setExpandedGroups(prev => ({ ...prev, [gIdx]: !prev[gIdx] }));

  const [activeTab, setActiveTab] = useState('overview');

  // Group Multi-Session runs by workoutId
  const sessionGroups = useMemo(() => {
    try {
      const groups = {};
      completedLineups.forEach(l => {
        const wid = l.results?.workoutId || l.workoutId || l.id; // backwards compat
        if (!groups[wid]) groups[wid] = [];
        groups[wid].push(l);
      });
      return Object.values(groups)
        .map(group => group.sort((a,b) => (new Date(a.publishedAt || 0).getTime()) - (new Date(b.publishedAt || 0).getTime())))
        .sort((a,b) => (new Date(b[b.length-1].publishedAt || 0).getTime()) - (new Date(a[a.length-1].publishedAt || 0).getTime()));
    } catch(e) {
      console.error('Session group logic crash:', e);
      return [];
    }
  }, [completedLineups]);

  // Group Sessions by Month and Year
  const sessionsByMonth = useMemo(() => {
    try {
      const months = {};
      sessionGroups.forEach(group => {
        const base = group[0];
        // Ensure date parsing doesn't shift by appending time.
        const dt = base.date ? new Date(`${base.date}T12:00:00Z`) : new Date(base.publishedAt || 0);
        const monthYear = dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        
        if (!months[monthYear]) {
          months[monthYear] = {
            label: monthYear,
            year: dt.getFullYear(),
            month: dt.getMonth(),
            timestamp: new Date(dt.getFullYear(), dt.getMonth(), 1).getTime(),
            groups: []
          };
        }
        months[monthYear].groups.push(group);
      });
      return Object.values(months).sort((a,b) => b.timestamp - a.timestamp);
    } catch(e) {
      console.error('Month grouping logic crash', e);
      return [];
    }
  }, [sessionGroups]);

  // Season summary stats (respect date filter)
  const seasonStats = useMemo(() => {
    let fastestElapsed = null;
    let fastestBoatName = '';
    let fastestFinishTime = '';
    for (const lineup of completedLineups) {
      for (const boat of lineup.results.boats) {
        if (boat.elapsed && (fastestElapsed === null || boat.elapsed < fastestElapsed)) {
          fastestElapsed = boat.elapsed;
          fastestBoatName = boat.boatName;
          fastestFinishTime = boat.finishTime || formatElapsed(boat.elapsed);
        }
      }
    }

    const counts = {};
    for (const lineup of completedLineups) {
      for (const boat of lineup.boats) {
        for (const member of (boat.athletes || [])) {
          counts[member.id] = (counts[member.id] || 0) + 1;
        }
      }
    }
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topAthlete = athletes.find((a) => a.id === topId);
    const topCount = counts[topId] || 0;

    return { totalCompleted: completedLineups.length, fastestFinishTime, fastestBoatName, topAthlete, topCount };
  }, [athletes, completedLineups]);

  // Boat leaderboard stats
  const boatLeaderboard = useMemo(() => {
    const boatMap = {};
    for (const lineup of completedLineups) {
      for (const result of lineup.results.boats) {
        if (!boatMap[result.boatName]) boatMap[result.boatName] = { boatName: result.boatName, sessions: 0, wins: 0, times: [] };
        const b = boatMap[result.boatName];
        b.sessions++;
        if (result.placement === 1) b.wins++;
        if (result.elapsed) b.times.push(result.elapsed);
      }
    }
    return Object.values(boatMap).map((b) => ({
      ...b,
      winPct: b.sessions > 0 ? Math.round((b.wins / b.sessions) * 100) : 0,
      bestTime: b.times.length ? Math.min(...b.times) : null,
      avgTime: b.times.length ? Math.round(b.times.reduce((s, t) => s + t, 0) / b.times.length) : null,
    }));
  }, [completedLineups]);

  const sortedBoatLeaderboard = useMemo(() => {
    return [...boatLeaderboard].sort((a, b) => {
      let av = a[boatSortCol], bv = b[boatSortCol];
      if (av == null) av = boatSortDir === 'asc' ? Infinity : -Infinity;
      if (bv == null) bv = boatSortDir === 'asc' ? Infinity : -Infinity;
      return boatSortDir === 'asc' ? av - bv : bv - av;
    });
  }, [boatLeaderboard, boatSortCol, boatSortDir]);

  function toggleBoatSort(col) {
    if (boatSortCol === col) setBoatSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setBoatSortCol(col); setBoatSortDir('desc'); }
  }

  // Per-athlete stats (respect date + position filters)
  const athleteStats = useMemo(() => {
    const filteredAthletes = positionFilter === 'All'
      ? athletes
      : athletes.filter((a) => a.position === positionFilter);

    return filteredAthletes.map((athlete) => {
      const appearances = [];
      for (const lineup of filteredLineups) {
        for (const boat of lineup.boats) {
          const seat = (boat.athletes || []).find((a) => a.id === athlete.id);
          if (!seat) continue;
          let elapsed = null, finishTimeStr = null, placement = null;
          if (lineup.results) {
            const br = lineup.results.boats.find((b) => b.boatId === boat.id);
            if (br) { elapsed = br.elapsed; finishTimeStr = br.finishTime; placement = br.placement; }
          }
          appearances.push({ lineupId: lineup.id, title: lineup.title, date: lineup.date, boatName: boat.name, boatId: boat.id, elapsed, finishTime: finishTimeStr, placement });
        }
      }

      const byBoat = {};
      for (const ap of appearances) {
        if (!byBoat[ap.boatName]) byBoat[ap.boatName] = [];
        byBoat[ap.boatName].push(ap);
      }
      const boatSummaries = Object.entries(byBoat).map(([boatName, rows]) => {
        const withTimes = rows.filter((r) => r.elapsed != null);
        const bestTime = withTimes.length ? Math.min(...withTimes.map((r) => r.elapsed)) : null;
        const avgTime = withTimes.length ? withTimes.reduce((s, r) => s + r.elapsed, 0) / withTimes.length : null;
        const wins = rows.filter((r) => r.placement === 1).length;
        return { boatName, count: rows.length, bestTime, avgTime, wins };
      }).sort((a, b) => (a.bestTime || Infinity) - (b.bestTime || Infinity));

      const totalSessions = appearances.length;
      const totalWins = appearances.filter((a) => a.placement === 1).length;
      const winPct = totalSessions > 0 ? Math.round((totalWins / totalSessions) * 100) : 0;
      const bestFinish = appearances.reduce((best, ap) => {
        if (ap.placement && (best === null || ap.placement < best)) return ap.placement;
        return best;
      }, null);
      const bestTime = boatSummaries.reduce((best, bs) => {
        if (bs.bestTime && (best === null || bs.bestTime < best)) return bs.bestTime;
        return best;
      }, null);

      return { athlete, appearances, boatSummaries, totalSessions, totalWins, winPct, bestFinish, bestTime };
    })
      .filter((s) => s.totalSessions > 0)
      .sort((a, b) => {
        if (athleteSort === 'sessions') return b.totalSessions - a.totalSessions;
        if (athleteSort === 'bestTime') return (a.bestTime || Infinity) - (b.bestTime || Infinity);
        if (athleteSort === 'winPct') return b.winPct - a.winPct;
        if (athleteSort === 'bestFinish') return (a.bestFinish || 99) - (b.bestFinish || 99);
        return 0;
      });
  }, [athletes, filteredLineups, positionFilter, athleteSort]);

  const selectedStat = athleteStats.find((s) => s.athlete.id === selectedAthleteId);

  const sessionsByDate = useMemo(() => {
    return [...completedLineups].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [completedLineups]);

  // ── Export handlers ──
  function handleExportSessions() {
    const rows = [];
    for (const lineup of completedLineups) {
      for (const result of lineup.results.boats) {
        const boatAthletes = lineup.boats.find((b) => b.id === result.boatId)?.athletes || [];
        const row = {
          Date: lineup.date,
          Session: lineup.title,
          Boat: result.boatName,
          Placement: result.placement,
          Time: result.finishTime || formatElapsed(result.elapsed),
          'Elapsed (ms)': result.elapsed || '',
        };
        boatAthletes.forEach((a, i) => { row[`Seat ${a.seatNum || i + 1}`] = a.name; });
        rows.push(row);
      }
    }
    exportCSV(rows, 'rowiq_sessions.csv');
  }

  function handleExportAthleteStats() {
    const rows = athleteStats.map(({ athlete, totalSessions, totalWins, winPct, bestFinish, bestTime, boatSummaries }) => ({
      Name: athlete.name,
      Email: athlete.email,
      Position: athlete.position,
      Sessions: totalSessions,
      Wins: totalWins,
      'Win %': `${winPct}%`,
      'Best Finish': bestFinish ? formatPlacement(bestFinish) : '—',
      'Best Time': formatElapsed(bestTime),
      'Avg Time': formatElapsed(boatSummaries[0]?.avgTime),
      'Boats Rowed': boatSummaries.map((bs) => bs.boatName).join(' | '),
    }));
    exportCSV(rows, 'rowiq_athlete_stats.csv');
  }

  function handleExportRoster() {
    const rows = athletes.map((athlete) => {
      const stat = athleteStats.find((s) => s.athlete.id === athlete.id);
      return {
        Name: athlete.name,
        Email: athlete.email,
        Position: athlete.position,
        'Total Sessions': stat?.totalSessions || 0,
        'Boats Rowed': stat?.boatSummaries.length || 0,
      };
    });
    exportCSV(rows, 'rowiq_roster.csv');
  }

  if (athletes.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-none mx-auto w-full">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center">
          <p className="text-[#9CA3AF] text-sm">No athletes loaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-none mx-auto w-full space-y-6">

      {/* ── Filter Bar ── */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3">
        {/* Date range */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#9CA3AF] text-[10px] font-semibold uppercase tracking-wider w-16 shrink-0">Period</span>
          <div className="flex gap-1.5 flex-wrap">
            {DATE_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  dateRange === r.value
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Position */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#9CA3AF] text-[10px] font-semibold uppercase tracking-wider w-16 shrink-0">Position</span>
          <div className="flex gap-1.5 flex-wrap">
            {POSITIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPositionFilter(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  positionFilter === p
                    ? 'bg-[#111827] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Athlete sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#9CA3AF] text-[10px] font-semibold uppercase tracking-wider w-16 shrink-0">Sort By</span>
          <div className="flex gap-1.5 flex-wrap">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setAthleteSort(s.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  athleteSort === s.value
                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Subpage Controller ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden border-t border-[#E5E7EB]">
        
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-56 shrink-0 bg-[#F9FAFB] border-b md:border-b-0 md:border-r border-[#E5E7EB] flex flex-col z-10 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-1">
             <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2.5 px-3">Dashboards</div>
             <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${activeTab === 'overview' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-[#4B5563] hover:bg-[#E5E7EB]'}`}>
               Season Overview
             </button>
             <button onClick={() => setActiveTab('athletes')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${activeTab === 'athletes' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#4B5563] hover:bg-[#E5E7EB]'}`}>
               Athlete Ledger
             </button>
             
             <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2.5 mt-6 px-3">Monthly Sessions</div>
             {sessionsByMonth.map((monthData, idx) => {
                const tabId = `month-${idx}`;
                const isActive = activeTab === tabId;
                return (
                  <button 
                    key={tabId} 
                    onClick={() => setActiveTab(tabId)} 
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${isActive ? 'bg-[#111827] text-white shadow-sm' : 'text-[#4B5563] hover:bg-[#E5E7EB]'}`}
                  >
                    <span className="truncate pr-2">{monthData.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${isActive ? 'bg-white/20' : 'bg-[#D1D5DB] text-[#111827]'}`}>
                      {monthData.groups.length}
                    </span>
                  </button>
                )
             })}
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-white relative pb-10 custom-scrollbar">

          {activeTab === 'overview' && (
            <>
              {/* ── Season Overview ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase">Season Stats</h2>
                  <div className="flex gap-2">
                    <ExportButton label="Sessions" onClick={handleExportSessions} />
                    <ExportButton label="Athletes" onClick={handleExportAthleteStats} />
                    <ExportButton label="Roster" onClick={handleExportRoster} />
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <StatPill label="Sessions" value={seasonStats.totalCompleted} sub="completed" />
                  <StatPill label="Athletes" value={athleteStats.length} sub="with session data" />
                  {seasonStats.fastestFinishTime && (
                    <StatPill label="Season Best" value={seasonStats.fastestFinishTime} sub={seasonStats.fastestBoatName} />
                  )}
                  {seasonStats.topAthlete && (
                    <StatPill label="Most Active" value={seasonStats.topAthlete.name.split(' ')[0]} sub={`${seasonStats.topCount} sessions`} />
                  )}
                </div>
              </div>

              {/* ── Boat Leaderboard ── */}
              {boatLeaderboard.length > 0 && (
                <div>
                  <h2 className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-3">Boat Leaderboard</h2>
                  <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                <tr className="border-b border-[#F3F4F6]">
                  {[
                    { label: 'Boat', col: null },
                    { label: 'Sessions', col: 'sessions' },
                    { label: 'Wins', col: 'wins' },
                    { label: 'Win %', col: 'winPct' },
                    { label: 'Best Time', col: 'bestTime' },
                    { label: 'Avg Time', col: 'avgTime' },
                  ].map(({ label, col }) => (
                    <th
                      key={label}
                      onClick={col ? () => toggleBoatSort(col) : undefined}
                      className={`text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-4 py-2.5 ${col ? 'cursor-pointer hover:text-[#6B7280] select-none' : ''}`}
                    >
                      {label}
                      {col && boatSortCol === col && (
                        <span className="ml-1 text-[#2563EB]">{boatSortDir === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedBoatLeaderboard.map((boat, i) => (
                  <tr key={boat.boatName} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                    <td className="px-4 py-2.5 font-semibold text-[#111827]">{boat.boatName}</td>
                    <td className="px-4 py-2.5 text-[#6B7280]">{boat.sessions}</td>
                    <td className="px-4 py-2.5">
                      <span className={boat.wins > 0 ? 'text-[#F59E0B] font-semibold' : 'text-[#6B7280]'}>
                        {boat.wins > 0 ? `${boat.wins} 🥇` : '0'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#F3F4F6] rounded-full h-1.5">
                          <div
                            className="bg-[#2563EB] h-1.5 rounded-full"
                            style={{ width: `${boat.winPct}%` }}
                          />
                        </div>
                        <span className="text-[#6B7280] text-xs">{boat.winPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[#111827]">{formatElapsed(boat.bestTime)}</td>
                    <td className="px-4 py-2.5 font-mono text-[#6B7280]">{formatElapsed(boat.avgTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
            </>
          )}

          {activeTab === 'athletes' && (
            <div>
              <div className="mb-6">
                <h2 className="text-[#111827] text-xl font-bold">Athlete Ledger</h2>
                <p className="text-[#6B7280] text-sm mt-1">Select an athlete to view detailed performance metrics.</p>
              </div>
              {athleteStats.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center shadow-sm">
                  <p className="text-[#9CA3AF] text-sm">No session data for this filter.</p>
                </div>
              ) : selectedStat ? (
                <AthleteDetail stat={selectedStat} onBack={() => setSelectedAthleteId(null)} />
              ) : (
                <div className="space-y-2">
                  {athleteStats.map(({ athlete, boatSummaries, totalSessions, winPct, bestFinish, bestTime }) => (
                    <button
                      key={athlete.id}
                      onClick={() => setSelectedAthleteId(athlete.id)}
                      className="w-full text-left bg-white border border-[#E5E7EB] hover:border-[#2563EB]/50 rounded-xl p-4 shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
                        >
                          {athlete.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[#111827] font-semibold text-base group-hover:text-[#2563EB] transition-colors">
                            {athlete.name}
                          </div>
                          <div className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider">{athlete.position}</div>
                        </div>
                        <div className="flex items-center gap-5 shrink-0">
                          <div className="text-right">
                            <div className="text-[#111827] font-bold text-sm">{totalSessions}</div>
                            <div className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-wider">Runs</div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <div className="text-[#111827] font-bold text-sm">{winPct}%</div>
                            <div className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-wider">Win %</div>
                          </div>
                          {bestTime && (
                            <div className="text-right hidden sm:block">
                              <div className="text-[#111827] font-mono font-bold text-sm">{formatElapsed(bestTime)}</div>
                              <div className="text-[#9CA3AF] text-[10px] font-bold tracking-wider">{boatSummaries[0]?.boatName}</div>
                            </div>
                          )}
                          <span className="text-[#D1D5DB] group-hover:text-[#2563EB] transition-colors ml-1">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab.startsWith('month-') && (() => {
            const idx = Number(activeTab.replace('month-', ''));
            const monthData = sessionsByMonth[idx];
            return (
              <MonthSessionsView
                monthLabel={monthData?.label}
                groups={monthData?.groups || []}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                athletes={athletes}
              />
            );
          })()}

          <div className="pt-10">
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6 text-center">
              <div className="text-[#111827] font-bold">You’re all caught up</div>
              <div className="text-[#6B7280] text-sm mt-1">
                Tip: use the month list on the left to jump quickly, and search within a month to find a session.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
