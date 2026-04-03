import { useState, useCallback, useEffect, useRef } from 'react';
import Stopwatch from './Stopwatch';
import { formatTimerMs } from '../utils/helpers';

const SESSION_STORAGE_KEY = 'rowiq_session';

export default function LiveSession({ boats, athletes, publishData, onSaveSession, onBack }) {
  const [boatStartTimes, setBoatStartTimes] = useState({});
  const [pausedOffsets, setPausedOffsets] = useState({});
  const [pausedBoats, setPausedBoats] = useState({});
  const [pauseStarted, setPauseStarted] = useState({});
  const [finishTimes, setFinishTimes] = useState({});
  const [liveElapsed, setLiveElapsed] = useState({});
  const rafRef = useRef(null);

  const activeBoats = boats.filter((b) => b.seats.some((s) => s.athleteId));
  const anyStarted = activeBoats.some((b) => boatStartTimes[b.id]);
  const allFinished = activeBoats.length > 0 && activeBoats.every((b) => finishTimes[b.id]);
  const anyRunning = activeBoats.some((b) => boatStartTimes[b.id] && !finishTimes[b.id] && !pausedBoats[b.id]);

  // Persist session
  useEffect(() => {
    if (!anyStarted) return;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        boatStartTimes, pausedOffsets, pausedBoats, pauseStarted, finishTimes,
        publishData, savedAt: Date.now(),
      }));
    } catch { /* ignore */ }
  }, [boatStartTimes, pausedOffsets, pausedBoats, pauseStarted, finishTimes, publishData, anyStarted]);

  // Restore on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Date.now() - saved.savedAt > 8 * 60 * 60 * 1000) return;
      if (saved.boatStartTimes && Object.keys(saved.boatStartTimes).length) {
        setBoatStartTimes(saved.boatStartTimes);
        setPausedOffsets(saved.pausedOffsets || {});
        setPausedBoats(saved.pausedBoats || {});
        setPauseStarted(saved.pauseStarted || {});
        setFinishTimes(saved.finishTimes || {});
      }
    } catch { /* ignore */ }
  }, []);

  // Live elapsed for leaderboard
  const updateLive = useCallback(() => {
    const now = Date.now();
    const updated = {};
    activeBoats.forEach((b) => {
      const start = boatStartTimes[b.id];
      if (!start) { updated[b.id] = 0; return; }
      const paused = pausedBoats[b.id];
      const pausedMs = (pausedOffsets[b.id] || 0) + (paused && pauseStarted[b.id] ? now - pauseStarted[b.id] : 0);
      updated[b.id] = finishTimes[b.id]
        ? finishTimes[b.id] - start - (pausedOffsets[b.id] || 0)
        : now - start - pausedMs;
    });
    setLiveElapsed(updated);
    rafRef.current = requestAnimationFrame(updateLive);
  }, [activeBoats, boatStartTimes, pausedOffsets, pausedBoats, pauseStarted, finishTimes]);

  useEffect(() => {
    if (anyStarted) rafRef.current = requestAnimationFrame(updateLive);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [anyStarted, updateLive]);

  function startBoat(boatId) { setBoatStartTimes((prev) => ({ ...prev, [boatId]: Date.now() })); }
  function startAll() {
    const now = Date.now();
    const starts = {};
    activeBoats.forEach((b) => { if (!boatStartTimes[b.id]) starts[b.id] = now; });
    setBoatStartTimes((prev) => ({ ...prev, ...starts }));
  }
  function handlePause(boatId) {
    if (!boatStartTimes[boatId] || finishTimes[boatId]) return;
    setPausedBoats((prev) => ({ ...prev, [boatId]: true }));
    setPauseStarted((prev) => ({ ...prev, [boatId]: Date.now() }));
  }
  function handleResume(boatId) {
    const now = Date.now();
    const added = now - (pauseStarted[boatId] || now);
    setPausedOffsets((prev) => ({ ...prev, [boatId]: (prev[boatId] || 0) + added }));
    setPausedBoats((prev) => ({ ...prev, [boatId]: false }));
    setPauseStarted((prev) => { const n = { ...prev }; delete n[boatId]; return n; });
  }
  function handleFinish(boatId, time) {
    if (pausedBoats[boatId]) handleResume(boatId);
    setFinishTimes((prev) => ({ ...prev, [boatId]: time }));
  }
  function handleEndAll() {
    const now = Date.now();
    activeBoats.forEach((b) => { if (pausedBoats[b.id]) handleResume(b.id); });
    const finals = {};
    activeBoats.forEach((b) => { if (boatStartTimes[b.id] && !finishTimes[b.id]) finals[b.id] = now; });
    setFinishTimes((prev) => ({ ...prev, ...finals }));
  }

  function handleSave() {
    const results = activeBoats
      .map((boat) => {
        const start = boatStartTimes[boat.id];
        const finish = finishTimes[boat.id];
        const elapsed = start && finish ? finish - start - (pausedOffsets[boat.id] || 0) : null;
        return {
          boatId: boat.id,
          boatName: boat.name,
          finishTime: elapsed != null ? formatTimerMs(elapsed) : null,
          elapsed,
          crew: boat.seats.filter((s) => s.athleteId).map((s) => {
            const a = athletes.find((at) => at.id === s.athleteId);
            return a ? { ...a, seatNum: s.seatNum } : null;
          }).filter(Boolean),
        };
      })
      .sort((a, b) => (a.elapsed || Infinity) - (b.elapsed || Infinity));
    try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* ignore */ }
    onSaveSession({
      id: crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`,
      title: publishData?.title || 'Session',
      date: publishData?.date || new Date().toISOString().split('T')[0],
      time: publishData?.time || new Date().toLocaleTimeString(),
      results,
      startTime: Math.min(...Object.values(boatStartTimes).filter(Boolean)),
    });
  }

  function handleNewSession() {
    try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* ignore */ }
    setBoatStartTimes({});
    setPausedOffsets({});
    setPausedBoats({});
    setPauseStarted({});
    setFinishTimes({});
    setLiveElapsed({});
  }

  const placements = {};
  const finishedBoats = activeBoats
    .filter((b) => finishTimes[b.id] && boatStartTimes[b.id])
    .sort((a, b) => {
      const ea = finishTimes[a.id] - boatStartTimes[a.id] - (pausedOffsets[a.id] || 0);
      const eb = finishTimes[b.id] - boatStartTimes[b.id] - (pausedOffsets[b.id] || 0);
      return ea - eb;
    });
  finishedBoats.forEach((b, i) => { placements[b.id] = i + 1; });

  const notStartedBoats = activeBoats.filter((b) => !boatStartTimes[b.id]);

  const allBoatElapsed = {};
  activeBoats.forEach((b) => { allBoatElapsed[b.name] = liveElapsed[b.id] || 0; });

  return (
    <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <button onClick={onBack} className="text-[#9CA3AF] text-sm hover:text-[#2563EB] transition-colors mb-1 flex items-center gap-1">
            ← Lineup
          </button>
          <h2 className="text-[#111827] text-xl font-bold">{publishData?.title || 'Live Session'}</h2>
          {publishData?.date && (
            <p className="text-[#6B7280] text-sm mt-0.5">{publishData.date}{publishData.time && ` · ${publishData.time}`}</p>
          )}
        </div>
        <div className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
          !anyStarted ? 'bg-[#F3F4F6] text-[#6B7280]'
          : anyRunning ? 'bg-blue-50 text-[#2563EB]'
          : allFinished ? 'bg-green-50 text-[#16A34A]'
          : 'bg-amber-50 text-amber-700'
        }`}>
          {!anyStarted ? 'Ready' : anyRunning ? '● In Progress' : allFinished ? '✓ Completed' : 'Paused'}
        </div>
      </div>

      {/* Start all / End all */}
      {notStartedBoats.length > 1 && (
        <div className="mb-4">
          <button onClick={startAll} className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-bold hover:bg-[#1d4ed8] transition-colors active:scale-95 shadow-sm">
            🚣 Start Race — All Boats
          </button>
        </div>
      )}
      {anyRunning && (
        <div className="mb-4">
          <button onClick={handleEndAll} className="w-full py-2.5 rounded-xl border border-[#FCA5A5] bg-red-50 text-[#DC2626] font-semibold hover:bg-red-100 transition-colors text-sm">
            End All Boats
          </button>
        </div>
      )}

      {/* Stopwatch */}
      {activeBoats.length > 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden mb-4 shadow-sm" style={{ minHeight: 480 }}>
          <Stopwatch
            boats={boats}
            athletes={athletes}
            boatStartTimes={boatStartTimes}
            pausedOffsets={pausedOffsets}
            pausedBoats={pausedBoats}
            finishTimes={finishTimes}
            allBoatElapsed={allBoatElapsed}
            onStart={startBoat}
            onPause={handlePause}
            onResume={handleResume}
            onFinish={handleFinish}
          />
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center mb-4">
          <p className="text-[#9CA3AF] text-sm">No athletes assigned. Go to Lineup to set up boats.</p>
        </div>
      )}

      {/* Final results + save */}
      {allFinished && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
            <h3 className="text-[#111827] font-bold mb-3 text-base">Final Results</h3>
            <div className="space-y-2">
              {finishedBoats.map((boat, i) => {
                const elapsed = finishTimes[boat.id] - boatStartTimes[boat.id] - (pausedOffsets[boat.id] || 0);
                const winnerElapsed = finishTimes[finishedBoats[0].id] - boatStartTimes[finishedBoats[0].id] - (pausedOffsets[finishedBoats[0].id] || 0);
                const gap = elapsed - winnerElapsed;
                return (
                  <div key={boat.id} className="flex items-center justify-between bg-[#F9FAFB] rounded-xl px-4 py-3 border border-[#F3F4F6]">
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${i === 0 ? 'text-[#D97706]' : i === 1 ? 'text-[#9CA3AF]' : 'text-[#B45309]'}`}>{i + 1}</span>
                      <span className="text-[#111827] font-semibold">{boat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#111827] font-mono text-sm font-semibold">{formatTimerMs(elapsed)}</span>
                      {gap > 0 && <span className="text-[#DC2626] font-mono text-xs">+{formatTimerMs(gap)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleNewSession}
              className="flex-1 py-3.5 rounded-xl bg-[#F3F4F6] text-[#374151] font-semibold text-sm hover:bg-[#E5E7EB] transition-colors active:scale-95">
              New Session
            </button>
            <button onClick={handleSave}
              className="flex-1 py-3.5 rounded-xl bg-[#16A34A] text-white font-bold text-sm hover:bg-green-700 transition-colors active:scale-[0.98] shadow-sm">
              Save Results →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
