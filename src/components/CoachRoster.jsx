import { useState } from 'react';
import AthleteDetailPanel from './AthleteDetailPanel';
import { getAvatarColor } from '../utils/helpers';

export default function CoachRoster({ athletes, boats, publishedLineups, onUpdateAthlete }) {
  const [search, setSearch] = useState('');
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);

  const filtered = athletes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  // Build assignment map: athleteId → { boatName, seatNum }
  const assignmentMap = {};
  boats.forEach((boat) => {
    boat.seats.forEach((seat) => {
      if (seat.athleteId) {
        assignmentMap[seat.athleteId] = { boatName: boat.name, seatNum: seat.seatNum };
      }
    });
  });

  const selectedAthlete = selectedAthleteId
    ? athletes.find((a) => a.id === selectedAthleteId)
    : null;

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase">
          Athlete Roster
        </h2>
        <span className="text-[#6B7280] text-sm">{athletes.length} athletes</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search athletes by name…"
          className="w-full bg-[#F7F8FA] border border-white/[0.1] rounded-lg pl-9 pr-4 py-2.5 text-[#111827] text-sm placeholder-[#475569] focus:outline-none focus:border-[#2563EB] transition-colors"
        />
      </div>

      {/* Athlete List */}
      {athletes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-[#111827] font-medium">No athletes loaded</p>
          <p className="text-[#6B7280] text-sm mt-1">Go to Lineup → load a sample roster or upload a CSV.</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-[#6B7280] text-sm text-center py-8">No athletes match "{search}".</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((athlete) => {
            const assignment = assignmentMap[athlete.id];
            return (
              <button
                key={athlete.id}
                onClick={() => setSelectedAthleteId(athlete.id)}
                className="w-full flex items-center gap-4 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all text-left group"
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[#111827] text-sm font-bold shrink-0"
                  style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
                >
                  {athlete.initials}
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <div className="text-[#111827] font-medium text-sm truncate">{athlete.name}</div>
                  <div className="text-[#6B7280] text-xs truncate mt-0.5">{athlete.email}</div>
                </div>

                {/* Assignment badge */}
                <div className="shrink-0">
                  {assignment ? (
                    <span className="bg-[#2563EB]/15 text-[#2563EB] text-xs font-medium px-2.5 py-1 rounded-full">
                      {assignment.boatName} · Seat {assignment.seatNum}
                    </span>
                  ) : (
                    <span className="text-[#9CA3AF] text-xs">Unassigned</span>
                  )}
                </div>

                {/* Chevron */}
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  className="text-[#9CA3AF] group-hover:text-[#6B7280] transition-colors shrink-0"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Athlete Detail Panel */}
      {selectedAthlete && (
        <AthleteDetailPanel
          athlete={selectedAthlete}
          athletes={athletes}
          publishedLineups={publishedLineups}
          onClose={() => setSelectedAthleteId(null)}
          onSelectAthlete={(id) => setSelectedAthleteId(id)}
          onUpdateAthlete={onUpdateAthlete}
        />
      )}
    </div>
  );
}
