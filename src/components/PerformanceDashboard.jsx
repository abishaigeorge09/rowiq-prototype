import { useMemo, useState } from 'react';
import { getAvatarColor } from '../utils/helpers';
import { formatDate, formatPlacement } from '../utils/history';

function formatElapsed(ms) {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000);
  const tenth = Math.floor((ms % 1000) / 100);
  return `${m}:${String(s).padStart(2, '0')}.${tenth}`;
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

function AthleteDetail({ stat, onBack }) {
  const { athlete, appearances, boatSummaries, totalSessions, bestFinish } = stat;

  const sortedAppearances = [...appearances].sort((a, b) =>
    (b.date || '').localeCompare(a.date || '')
  );

  const fastestTime = boatSummaries.reduce((best, bs) => {
    if (bs.bestTime && (best === null || bs.bestTime < best)) return bs.bestTime;
    return best;
  }, null);

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
            className="w-14 h-14 rounded-full flex items-center justify-center text-[#111827] font-bold text-lg shrink-0"
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

      {/* Session timeline */}
      <div>
        <h4 className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider mb-3">Session History</h4>
        <div className="space-y-2">
          {sortedAppearances.map((entry, i) => (
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
              <div className="flex items-center gap-4 shrink-0">
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PerformanceDashboard({ athletes, publishedLineups }) {
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);

  // Season summary stats
  const seasonStats = useMemo(() => {
    const completed = publishedLineups.filter((l) => l.results);

    let fastestElapsed = null;
    let fastestBoatName = '';
    let fastestFinishTime = '';
    for (const lineup of completed) {
      for (const boat of lineup.results.boats) {
        if (boat.elapsed && (fastestElapsed === null || boat.elapsed < fastestElapsed)) {
          fastestElapsed = boat.elapsed;
          fastestBoatName = boat.boatName;
          fastestFinishTime = boat.finishTime || formatElapsed(boat.elapsed);
        }
      }
    }

    const counts = {};
    for (const lineup of completed) {
      for (const boat of lineup.boats) {
        for (const member of boat.athletes) {
          counts[member.id] = (counts[member.id] || 0) + 1;
        }
      }
    }
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topAthlete = athletes.find((a) => a.id === topId);
    const topCount = counts[topId] || 0;

    return { totalCompleted: completed.length, fastestFinishTime, fastestBoatName, topAthlete, topCount };
  }, [athletes, publishedLineups]);

  // Per-athlete stats
  const athleteStats = useMemo(() => {
    return athletes.map((athlete) => {
      const appearances = [];
      for (const lineup of publishedLineups) {
        for (const boat of lineup.boats) {
          const seat = boat.athletes.find((a) => a.id === athlete.id);
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
      const bestFinish = appearances.reduce((best, ap) => {
        if (ap.placement && (best === null || ap.placement < best)) return ap.placement;
        return best;
      }, null);

      return { athlete, appearances, boatSummaries, totalSessions, bestFinish };
    })
      .filter((s) => s.totalSessions > 0)
      .sort((a, b) => b.totalSessions - a.totalSessions);
  }, [athletes, publishedLineups]);

  const selectedStat = athleteStats.find((s) => s.athlete.id === selectedAthleteId);

  const sessionsByDate = useMemo(() => {
    return [...publishedLineups]
      .filter((l) => l.results)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [publishedLineups]);

  if (athletes.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center">
          <p className="text-[#9CA3AF] text-sm">No athletes loaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto space-y-8">

      {/* ── Season Overview ── */}
      <div>
        <h2 className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-3">Season Overview</h2>
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

      {/* ── Session History ── */}
      <div>
        <h2 className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-4">Session History</h2>
        {sessionsByDate.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center">
            <p className="text-[#9CA3AF] text-sm">No completed sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessionsByDate.map((lineup) => (
              <div key={lineup.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[#111827] font-semibold">{lineup.title}</h3>
                    <p className="text-[#6B7280] text-xs mt-0.5">
                      {formatDate(lineup.date)}{lineup.time ? ` · ${lineup.time}` : ''}
                    </p>
                  </div>
                  <span className="text-[#16A34A] text-xs font-semibold bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[...lineup.results.boats]
                    .sort((a, b) => a.placement - b.placement)
                    .map((boat) => (
                      <div key={boat.boatId} className="flex items-center justify-between bg-[#F7F8FA] rounded-lg px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-sm w-6 ${boat.placement === 1 ? 'text-[#F59E0B]' : 'text-[#6B7280]'}`}>
                            {formatPlacement(boat.placement)}
                          </span>
                          <span className="text-[#111827] text-sm font-medium">{boat.boatName}</span>
                          <div className="flex items-center gap-0.5 ml-1">
                            {lineup.boats.find((b) => b.id === boat.boatId)?.athletes.slice(0, 6).map((m) => {
                              const full = athletes.find((at) => at.id === m.id) || m;
                              return (
                                <div
                                  key={m.id}
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                                  style={{ backgroundColor: getAvatarColor(full.colorIndex ?? 0) }}
                                  title={full.name}
                                >
                                  {full.initials}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <span className="font-mono text-sm text-[#111827]">
                          {boat.finishTime || formatElapsed(boat.elapsed)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Athlete Performance ── */}
      <div>
        <h2 className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-4">Athlete Performance</h2>
        {athleteStats.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center">
            <p className="text-[#9CA3AF] text-sm">No session data yet.</p>
          </div>
        ) : selectedStat ? (
          <AthleteDetail stat={selectedStat} onBack={() => setSelectedAthleteId(null)} />
        ) : (
          <div className="space-y-2">
            {athleteStats.map(({ athlete, boatSummaries, totalSessions, bestFinish }) => (
              <button
                key={athlete.id}
                onClick={() => setSelectedAthleteId(athlete.id)}
                className="w-full text-left bg-white border border-[#E5E7EB] hover:border-[#2563EB]/50 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#111827] text-xs font-bold shrink-0"
                    style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
                  >
                    {athlete.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#111827] font-semibold text-sm group-hover:text-[#2563EB] transition-colors">
                      {athlete.name}
                    </div>
                    <div className="text-[#6B7280] text-xs">{athlete.position}</div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[#111827] font-bold text-sm">{totalSessions}</div>
                      <div className="text-[#9CA3AF] text-[10px]">Sessions</div>
                    </div>
                    {bestFinish && (
                      <div className="text-right">
                        <div className={`font-bold text-sm ${bestFinish === 1 ? 'text-[#F59E0B]' : 'text-[#111827]'}`}>
                          {formatPlacement(bestFinish)}
                        </div>
                        <div className="text-[#9CA3AF] text-[10px]">Best</div>
                      </div>
                    )}
                    {boatSummaries[0]?.bestTime && (
                      <div className="text-right hidden sm:block">
                        <div className="text-[#111827] font-mono text-sm">{formatElapsed(boatSummaries[0].bestTime)}</div>
                        <div className="text-[#9CA3AF] text-[10px]">{boatSummaries[0].boatName}</div>
                      </div>
                    )}
                    <span className="text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors ml-1">›</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
