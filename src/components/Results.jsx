import { useState } from 'react';
import { formatTimer, getAvatarColor } from '../utils/helpers';

export default function Results({ sessions }) {
  const [expandedId, setExpandedId] = useState(null);

  if (sessions.length === 0) {
    return (
      <div className="px-6 py-12 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-[#111827] font-semibold text-lg">No sessions yet</h3>
          <p className="text-[#6B7280] text-sm mt-1">Complete a live session to see results here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <h2 className="text-[#111827] text-2xl font-bold mb-4">Session History</h2>

      <div className="space-y-3">
        {sessions.map((session) => {
          const winner = session.results[0];
          const isExpanded = expandedId === session.id;

          return (
            <div key={session.id} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
              {/* Summary */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : session.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <h3 className="text-[#111827] font-bold">{session.title}</h3>
                  <p className="text-[#6B7280] text-sm mt-0.5">
                    {session.date} • {session.results.length} boats
                  </p>
                </div>
                <div className="text-right">
                  {winner && (
                    <>
                      <div className="text-[#F59E0B] text-sm font-medium">{winner.boatName}</div>
                      <div className="text-[#111827] font-mono text-sm">{formatTimer(winner.elapsed)}</div>
                    </>
                  )}
                  <span className="text-[#9CA3AF] text-xs">{isExpanded ? '▾' : '▸'}</span>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-[#E5E7EB]">
                  {/* Standings */}
                  <div className="mt-4 mb-4">
                    <div className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-2">
                      Standings
                    </div>
                    <div className="space-y-2">
                      {session.results.map((result, i) => {
                        const gap = result.elapsed - session.results[0].elapsed;
                        return (
                          <div key={result.boatId} className="bg-[#F7F8FA] rounded-lg px-4 py-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className={`font-bold text-sm ${
                                  i === 0 ? 'text-[#F59E0B]' : i === 1 ? 'text-[#374151]' : 'text-[#CD7F32]'
                                }`}>
                                  {i + 1}
                                </span>
                                <span className="text-[#111827] font-medium text-sm">{result.boatName}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[#111827] font-mono text-sm">
                                  {result.elapsed ? formatTimer(result.elapsed) : 'DNF'}
                                </span>
                                {gap > 0 && (
                                  <span className="text-[#EF4444] font-mono text-xs">+{formatTimer(gap)}</span>
                                )}
                              </div>
                            </div>

                            {/* Crew */}
                            <div className="flex items-center gap-1 mt-2">
                              {result.crew.map((a) => (
                                <div
                                  key={a.id}
                                  className="flex items-center gap-1 bg-[#F3F4F6] rounded-full px-2 py-0.5"
                                >
                                  <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                                    style={{ backgroundColor: getAvatarColor(a.colorIndex) }}
                                  >
                                    {a.initials}
                                  </div>
                                  <span className="text-[#374151] text-[10px]">{a.name.split(' ')[0]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
