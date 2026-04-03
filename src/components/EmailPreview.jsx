import { getAvatarColor } from '../utils/helpers';

export default function EmailPreview({ boats, athletes, publishData, onDone }) {
  // Collect all assigned athletes with their boat/seat info
  const assignments = [];
  boats.forEach((boat) => {
    boat.seats.forEach((seat) => {
      if (seat.athleteId) {
        const athlete = athletes.find((a) => a.id === seat.athleteId);
        if (athlete) {
          assignments.push({ athlete, boat, seat });
        }
      }
    });
  });

  // Pick the first assignment to show as sample email
  const sample = assignments[0];

  return (
    <div className="fixed inset-0 bg-[#F7F8FA]/95 backdrop-blur-md flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="w-full max-w-lg mx-4">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#22C55E]/20 flex items-center justify-center mx-auto mb-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-[#111827] text-2xl font-bold">Lineup Published</h2>
          <p className="text-[#6B7280] text-sm mt-1">
            {publishData.title} — {publishData.date}, {publishData.time}
          </p>
        </div>

        {/* Sample Email Preview */}
        {sample && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 mb-4">
            <div className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-3">
              Email Preview
            </div>
            <div className="text-[#6B7280] text-xs mb-1">
              Subject: <span className="text-[#111827] font-medium">RowIQ — Lineup Published: {publishData.title} ({publishData.date}, {publishData.time})</span>
            </div>
            <div className="border-t border-[#E5E7EB] mt-3 pt-3 text-sm text-[#374151] space-y-2">
              <p>Hi {sample.athlete.name.split(' ')[0]},</p>
              <p>
                You've been assigned to <span className="text-[#111827] font-medium">{sample.boat.name}</span>,
                Seat <span className="text-[#111827] font-medium">{sample.seat.seatNum}</span> for tomorrow's session.
              </p>
              <p className="text-[#6B7280]">Your crew:</p>
              <div className="pl-2 space-y-0.5">
                {sample.boat.seats
                  .filter((s) => s.athleteId)
                  .map((s) => {
                    const a = athletes.find((at) => at.id === s.athleteId);
                    return a ? (
                      <div key={s.seatNum} className="text-[#374151] text-xs">
                        {s.seatNum}: {a.name}
                      </div>
                    ) : null;
                  })}
              </div>
              {publishData.note && (
                <p className="text-[#6B7280] italic">"{publishData.note}"</p>
              )}
              <p className="text-[#6B7280]">
                See you on the water.<br />
                — Coach
              </p>
            </div>
          </div>
        )}

        {/* Sent list */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 mb-6">
          <div className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-3">
            Notifications Sent
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {assignments.map(({ athlete }) => (
              <div key={athlete.id} className="flex items-center gap-3 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#111827] text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: getAvatarColor(athlete.colorIndex) }}
                >
                  {athlete.initials}
                </div>
                <span className="text-[#111827] font-medium">{athlete.name}</span>
                <span className="text-[#6B7280] text-xs ml-auto">Email sent</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onDone}
          className="w-full py-3 rounded-xl text-[#111827] bg-[#2563EB] hover:bg-[#1d4ed8] transition-colors font-bold text-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}
