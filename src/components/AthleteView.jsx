import { useState } from 'react';
import StatBox from './StatBox';
import CrewCard from './CrewCard';
import { getAvatarColor, formatTimer, formatTimerShort } from '../utils/helpers';
import {
  getAthleteHistory,
  getAthleteStats,
  getCrewOverlap,
  getUpcomingSession,
  formatDate,
  formatPlacement,
} from '../utils/history';

function formatTime12h(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function NextSessionCard({ upcoming, athlete, athletes, publishedLineups }) {
  const { lineup, boat, seat } = upcoming;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[#111827] font-bold text-base">{lineup.title}</h3>
        <span className="bg-[#2563EB]/15 text-[#2563EB] text-xs font-semibold px-2.5 py-0.5 rounded-full">
          Upcoming
        </span>
      </div>
      <p className="text-[#6B7280] text-xs mb-4">
        {formatDate(lineup.date)}{lineup.time ? ` at ${formatTime12h(lineup.time)}` : ''}
      </p>

      {/* Your boat + seat */}
      <div className="bg-[#F7F8FA] rounded-xl px-4 py-3 mb-4">
        <p className="text-[#9CA3AF] text-[10px] font-semibold tracking-wider uppercase mb-1">Your Assignment</p>
        <p className="text-[#111827] text-xl font-bold">
          {boat.name} — Seat {seat.seatNum}
        </p>
      </div>

      {/* Crew */}
      <div>
        <p className="text-[#9CA3AF] text-[10px] font-semibold tracking-wider uppercase mb-2">Your Crew</p>
        <div className="space-y-0.5">
          {boat.athletes
            .sort((a, b) => a.seatNum - b.seatNum)
            .map((member) => {
              const fullAthlete = athletes.find((a) => a.id === member.id) || member;
              const isMe = member.id === athlete.id;
              // Count overlap from PREVIOUS lineups (exclude current one)
              const prevLineups = publishedLineups.filter((l) => l.id !== lineup.id);
              const overlap = isMe ? undefined : getCrewOverlap(athlete.id, member.id, prevLineups);
              return (
                <CrewCard
                  key={member.id}
                  athlete={fullAthlete}
                  seatNum={member.seatNum}
                  overlapCount={overlap}
                  isCurrentAthlete={isMe}
                />
              );
            })}
        </div>
      </div>

      {lineup.note && (
        <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
          <p className="text-[#6B7280] text-xs italic">"{lineup.note}"</p>
        </div>
      )}
    </div>
  );
}

function HistoryCard({ entry, athlete, athletes, publishedLineups, index, isLast }) {
  const [splitsOpen, setSplitsOpen] = useState(false);
  const [crewOpen, setCrewOpen] = useState(false);

  const placement = entry.results?.boatResult?.placement;
  const elapsed = entry.results?.boatResult?.elapsed;

  return (
    <div className="relative pl-6">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-[#F3F4F6]" />
      )}
      {/* Timeline dot */}
      <div className="absolute left-0 top-4 w-3.5 h-3.5 rounded-full bg-[#2563EB] border-2 border-[#0B1120]" />

      <div className="bg-white border border-[#E5E7EB] rounded-xl mb-3 overflow-hidden">
        {/* Main row */}
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[#111827] font-medium text-sm">{entry.title}</div>
              <div className="text-[#6B7280] text-xs mt-0.5">
                {entry.boatName} · Seat {entry.seatNum}
              </div>
              <div className="text-[#9CA3AF] text-xs mt-0.5">
                {formatDate(entry.date)}{entry.time ? ` at ${formatTime12h(entry.time)}` : ''}
              </div>
            </div>
            <div className="text-right shrink-0">
              {elapsed != null && (
                <div className="text-[#111827] font-mono text-sm">{formatTimer(elapsed)}</div>
              )}
              {placement && (
                <div className={`text-xs font-bold mt-0.5 ${
                  placement === 1 ? 'text-[#F59E0B]' : 'text-[#374151]'
                }`}>
                  {formatPlacement(placement)}
                </div>
              )}
              {!entry.results && (
                <span className="text-[#9CA3AF] text-xs">No results</span>
              )}
            </div>
          </div>
        </div>

        {/* All boats results */}
        {entry.results?.allBoats?.length > 0 && (
          <div className="border-t border-[#E5E7EB]">
            <button
              onClick={() => setSplitsOpen(!splitsOpen)}
              className="w-full text-left px-4 py-2 text-[#6B7280] text-xs hover:text-[#111827] transition-colors flex items-center gap-1"
            >
              <span>{splitsOpen ? '▾' : '▸'}</span> All Boats
            </button>
            {splitsOpen && (
              <div className="px-4 pb-3 space-y-1.5">
                {entry.results.allBoats
                  .sort((a, b) => a.placement - b.placement)
                  .map((boat) => {
                    const isMyBoat = boat.boatId === entry.boatId;
                    return (
                      <div
                        key={boat.boatId}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                          isMyBoat ? 'bg-[#2563EB]/10 border border-[#2563EB]/20' : 'bg-[#F7F8FA]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isMyBoat ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`}>
                            {formatPlacement(boat.placement)}
                          </span>
                          <span className={`text-xs ${isMyBoat ? 'text-[#111827] font-medium' : 'text-[#6B7280]'}`}>
                            {boat.boatName}
                          </span>
                          {isMyBoat && (
                            <span className="text-[9px] text-[#2563EB] font-semibold uppercase tracking-wider">you</span>
                          )}
                        </div>
                        <span className={`font-mono text-xs ${isMyBoat ? 'text-[#2563EB] font-semibold' : 'text-[#6B7280]'}`}>
                          {boat.finishTime || formatTimer(boat.elapsed)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Expandable crew */}
        <div className="border-t border-[#E5E7EB]">
          <button
            onClick={() => setCrewOpen(!crewOpen)}
            className="w-full text-left px-4 py-2 text-[#6B7280] text-xs hover:text-[#111827] transition-colors flex items-center gap-1"
          >
            <span>{crewOpen ? '▾' : '▸'}</span> Crew ({entry.crew.length})
          </button>
          {crewOpen && (
            <div className="pb-2">
              {entry.crew
                .sort((a, b) => a.seatNum - b.seatNum)
                .map((member) => {
                  const fullAthlete = athletes.find((a) => a.id === member.id) || member;
                  const isMe = member.id === athlete.id;
                  const prevLineups = publishedLineups.filter((l) => l.id !== entry.lineupId);
                  const overlap = isMe ? undefined : getCrewOverlap(athlete.id, member.id, prevLineups);
                  return (
                    <CrewCard
                      key={member.id}
                      athlete={fullAthlete}
                      seatNum={member.seatNum}
                      overlapCount={overlap}
                      isCurrentAthlete={isMe}
                    />
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AthleteView({ athlete, athletes, publishedLineups }) {
  const stats = getAthleteStats(athlete.id, publishedLineups);
  const upcoming = getUpcomingSession(athlete.id, publishedLineups);
  const history = getAthleteHistory(athlete.id, publishedLineups).filter((h) => h.results !== null);

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
      {/* Profile Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-[#111827] text-xl font-bold shrink-0"
            style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
          >
            {athlete.initials}
          </div>
          <div>
            <h2 className="text-[#111827] text-xl font-bold">{athlete.name}</h2>
            <p className="text-[#6B7280] text-sm">{athlete.email}</p>
            <span className="inline-block mt-1 bg-[#F3F4F6] text-[#374151] text-xs px-2.5 py-0.5 rounded-full">
              {athlete.position}
            </span>
          </div>
        </div>

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

      {/* Tomorrow's / Next Session */}
      <div>
        <h3 className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-3">
          Next Session
        </h3>
        {upcoming ? (
          <NextSessionCard
            upcoming={upcoming}
            athlete={athlete}
            athletes={athletes}
            publishedLineups={publishedLineups}
          />
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center">
            <p className="text-[#9CA3AF] text-sm">No upcoming sessions.</p>
          </div>
        )}
      </div>

      {/* Session History Timeline */}
      <div>
        <h3 className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-3">
          Session History
        </h3>
        {history.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center">
            <p className="text-[#9CA3AF] text-sm">No completed sessions yet.</p>
          </div>
        ) : (
          <div>
            {history.map((entry, i) => (
              <HistoryCard
                key={`${entry.lineupId}-${i}`}
                entry={entry}
                athlete={athlete}
                athletes={athletes}
                publishedLineups={publishedLineups}
                index={i}
                isLast={i === history.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
