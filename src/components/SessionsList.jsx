import { formatDate } from '../utils/history';
import { getAvatarColor } from '../utils/helpers';

export default function SessionsList({ publishedLineups, athletes, onStartSession }) {
  const queuedSessions = publishedLineups.filter(l => !l.results);

  return (
    <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <h2 className="text-[#111827] text-2xl font-bold mb-6">Upcoming Sessions</h2>
      {queuedSessions.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
          <p className="text-[#6B7280] font-semibold">No published sessions waiting to start.</p>
          <p className="text-[#9CA3AF] text-sm mt-1">Go to the Lineup tab, arrange your boats, and click Publish Lineup to queue one here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queuedSessions.map(lineup => (
            <div key={lineup.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:border-[#2563EB]/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[#111827] font-bold text-lg">{lineup.title}</h3>
                  <p className="text-[#6B7280] text-sm mt-0.5 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {formatDate(lineup.date)} {lineup.time ? `· ${lineup.time}` : ''}
                  </p>
                </div>
                <button 
                  onClick={() => onStartSession(lineup.id)}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold rounded-xl shadow-sm active:scale-95 transition-all text-sm flex items-center gap-2"
                >
                  Start Timer →
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {lineup.boats.map(boat => (
                  <div key={boat.id} className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl px-3 py-2 flex items-center gap-3">
                    <span className="text-[#111827] font-semibold text-sm">{boat.name}</span>
                    <div className="flex -space-x-1">
                      {boat.athletes.map(a => {
                         const athlete = athletes.find(at => at.id === a.id) || a;
                         return (
                            <div key={athlete.id} className="w-7 h-7 rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm relative"
                              style={{ backgroundColor: getAvatarColor(athlete.colorIndex || 0) }} title={athlete.name}>
                              {athlete.initials}
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
      )}
    </div>
  )
}
