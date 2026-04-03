import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTimerMs, formatTimerShort, getAvatarColor } from '../utils/helpers';

function placementLabel(n) {
  if (n === 1) return '🥇';
  if (n === 2) return '🥈';
  if (n === 3) return '🥉';
  return `${n}th`;
}

function BoatTimer({ boat, athletes, startTime, pausedOffset, isPaused, finishTime, allBoatElapsed, onStart, onPause, onResume, onFinish }) {
  const [elapsed, setElapsed] = useState(0);
  const [splits, setSplits] = useState([]);
  const rafRef = useRef(null);

  const isRunning = startTime && !isPaused && !finishTime;
  const isFinished = !!finishTime;

  const update = useCallback(() => {
    if (!startTime || isPaused || finishTime) return;
    setElapsed(Date.now() - startTime - (pausedOffset || 0));
    rafRef.current = requestAnimationFrame(update);
  }, [startTime, isPaused, finishTime, pausedOffset]);

  useEffect(() => {
    if (isRunning) rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isRunning, update]);

  useEffect(() => {
    if (finishTime && startTime) setElapsed(finishTime - startTime - (pausedOffset || 0));
  }, [finishTime, startTime, pausedOffset]);

  useEffect(() => {
    if (isPaused && startTime) setElapsed(Date.now() - startTime - (pausedOffset || 0));
  }, [isPaused, startTime, pausedOffset]);

  function handleSplit() {
    if (!isRunning) return;
    const now = elapsed;
    const lastSplit = splits.length > 0 ? splits[splits.length - 1].cumulative : 0;
    const interval = now - lastSplit;
    const avgInterval = now / (splits.length + 1);
    setSplits((prev) => [...prev, { num: prev.length + 1, cumulative: now, interval, delta: interval - avgInterval }]);
  }

  const leaderboardEntries = Object.entries(allBoatElapsed)
    .map(([id, el]) => ({ id, elapsed: el }))
    .sort((a, b) => b.elapsed - a.elapsed);
  const leader = leaderboardEntries[0];
  const showLeaderboard = leaderboardEntries.length >= 2;
  const myRank = leaderboardEntries.findIndex((e) => e.id === boat.id) + 1;

  const crew = boat.seats.filter((s) => s.athleteId).map((s) => athletes.find((a) => a.id === s.athleteId)).filter(Boolean);

  return (
    <div className="flex flex-col h-full select-none bg-white">
      {/* Crew avatars */}
      <div className="flex items-center gap-1.5 px-5 pt-4 pb-2 flex-wrap">
        {crew.slice(0, 8).map((a) => (
          <div key={a.id} className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            style={{ backgroundColor: getAvatarColor(a.colorIndex) }} title={a.name}>
            {a.initials}
          </div>
        ))}
        {crew.length > 8 && <span className="text-[#9CA3AF] text-xs ml-1">+{crew.length - 8}</span>}
      </div>

      {/* Main timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-4">
        <div
          className={`font-black tracking-tight leading-none tabular-nums ${
            isFinished ? 'text-[#16A34A]' : isPaused ? 'text-[#D97706]' : 'text-[#111827]'
          }`}
          style={{ fontSize: 'clamp(3.5rem, 18vw, 5.5rem)', fontFamily: 'Georgia, serif' }}
        >
          {formatTimerMs(elapsed)}
        </div>
        {isPaused && !isFinished && (
          <div className="mt-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold tracking-widest">
            PAUSED
          </div>
        )}
        {isFinished && (
          <div className="mt-2 text-[#16A34A] text-sm font-bold">{placementLabel(myRank)} Finished</div>
        )}
      </div>

      {/* Leaderboard strip */}
      {showLeaderboard && (
        <div className="mx-5 mb-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] overflow-hidden">
          {leaderboardEntries.map((entry, idx) => (
            <div key={entry.id} className={`flex items-center justify-between px-4 py-2.5 border-b border-[#F3F4F6] last:border-0 ${entry.id === boat.id ? 'bg-blue-50/60' : ''}`}>
              <span className="text-[#9CA3AF] text-xs font-mono w-5">{idx + 1}.</span>
              <span className={`text-xs font-semibold flex-1 ml-2 truncate ${entry.id === boat.id ? 'text-[#2563EB]' : 'text-[#6B7280]'}`}>{entry.id}</span>
              <span className="text-xs font-mono text-[#111827] ml-2">{formatTimerMs(entry.elapsed)}</span>
              {idx > 0 && <span className="text-xs font-mono text-[#DC2626] ml-3">+{formatTimerMs(entry.elapsed - leaderboardEntries[0].elapsed)}</span>}
              {idx === 0 && <span className="text-[#16A34A] text-xs ml-3">●</span>}
            </div>
          ))}
        </div>
      )}

      {/* Splits */}
      {splits.length > 0 && (
        <div className="mx-5 mb-3 max-h-28 overflow-y-auto rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
          {[...splits].reverse().map((s) => (
            <div key={s.num} className="flex items-center justify-between px-4 py-2 border-b border-[#F3F4F6] last:border-0">
              <span className="text-[#9CA3AF] text-xs">Split {s.num}</span>
              <span className="text-[#111827] font-mono text-xs">{formatTimerMs(s.cumulative)}</span>
              <span className={`font-mono text-xs ${s.delta > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                {s.delta > 0 ? '+' : ''}{formatTimerShort(Math.abs(s.delta))}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="px-5 pb-6 space-y-3">
        {!startTime && (
          <button onClick={() => onStart(boat.id)}
            className="w-full h-14 rounded-2xl bg-[#2563EB] text-white font-black text-lg tracking-widest hover:bg-[#1d4ed8] active:scale-95 transition-all shadow-sm">
            START
          </button>
        )}
        {startTime && !isFinished && (
          <>
            <div className="flex gap-3">
              <button
                onClick={isPaused ? onResume : onPause}
                className={`flex-1 h-12 rounded-xl font-bold text-sm tracking-wide active:scale-95 transition-all ${
                  isPaused ? 'bg-[#16A34A] text-white hover:bg-green-700' : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] border border-[#E5E7EB]'
                }`}>
                {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
              </button>
              <button onClick={handleSplit} disabled={isPaused}
                className="flex-1 h-12 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] font-bold text-sm tracking-wide hover:bg-[#E5E7EB] disabled:opacity-40 active:scale-95 transition-all">
                SPLIT
              </button>
            </div>
            <button onClick={() => onFinish(boat.id, Date.now())}
              className="w-full h-14 rounded-2xl bg-[#DC2626] text-white font-black text-lg tracking-widest hover:bg-red-700 active:scale-95 transition-all shadow-sm">
              FINISH
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Stopwatch({ boats, athletes, boatStartTimes, pausedOffsets, pausedBoats, finishTimes, allBoatElapsed, onStart, onPause, onResume, onFinish }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeBoats = boats.filter((b) => b.seats.some((s) => s.athleteId));
  const clampedIdx = Math.min(activeIdx, activeBoats.length - 1);
  const currentBoat = activeBoats[clampedIdx];

  if (!currentBoat) {
    return (
      <div className="flex items-center justify-center h-64 text-[#9CA3AF] text-sm">
        No athletes assigned to boats yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {activeBoats.length > 1 && (
        <div className="flex gap-1 px-4 pt-3 overflow-x-auto scrollbar-none border-b border-[#F3F4F6]">
          {activeBoats.map((b, i) => (
            <button key={b.id} onClick={() => setActiveIdx(i)}
              className={`shrink-0 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                i === clampedIdx ? 'text-[#2563EB] border-[#2563EB]' : 'text-[#6B7280] border-transparent hover:text-[#111827]'
              }`}>
              {b.name}
              {finishTimes[b.id] && <span className="ml-1.5 text-[#16A34A] text-xs">✓</span>}
              {boatStartTimes[b.id] && !finishTimes[b.id] && !pausedBoats?.[b.id] && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <BoatTimer
          key={currentBoat.id}
          boat={currentBoat}
          athletes={athletes}
          startTime={boatStartTimes[currentBoat.id]}
          pausedOffset={pausedOffsets?.[currentBoat.id] || 0}
          isPaused={pausedBoats?.[currentBoat.id] || false}
          finishTime={finishTimes[currentBoat.id]}
          allBoatElapsed={allBoatElapsed}
          onStart={onStart}
          onPause={() => onPause(currentBoat.id)}
          onResume={() => onResume(currentBoat.id)}
          onFinish={onFinish}
        />
      </div>
    </div>
  );
}
