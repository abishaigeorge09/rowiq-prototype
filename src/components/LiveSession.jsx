import { useState, useCallback, useEffect, useRef } from 'react';
import Stopwatch from './Stopwatch';
import { formatTimerMs, generateId } from '../utils/helpers';
import CreateRunSwapModal from './CreateRunSwapModal';

const SESSION_STORAGE_KEY = 'rowiq_session_multi';

export default function LiveSession({ initialBoats, athletes, publishData, onSaveSession, onBack, onGoToHistory }) {
  // State for all runs in the session
  const [runs, setRuns] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.runs && parsed.runs.length > 0) {
           // Only restore if the saved session belongs to the current lineup!
           const loadedWorkoutId = parsed.runs[0].workoutId || parsed.runs[0].lineupId;
           if (loadedWorkoutId === publishData?.lineupId) {
             return parsed.runs;
           }
        }
      }
    } catch { /* ignore */ }

    // First run is derived from initialBoats
    return [{
       id: generateId(),
       title: 'Run 1',
       lineupId: publishData?.lineupId,
       workoutId: publishData?.lineupId,
       boatsSnapshot: initialBoats,
       boatStartTimes: {},
       pausedOffsets: {},
       pausedBoats: {},
       pauseStarted: {},
       finishTimes: {}
    }];
  });

  const [activeRunId, setActiveRunId] = useState(runs[0].id);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [liveElapsed, setLiveElapsed] = useState({});
  const rafRef = useRef(null);

  const activeRun = runs.find(r => r.id === activeRunId);
  const boats = activeRun.boatsSnapshot;
  const activeBoats = boats.filter((b) => b.seats.some((s) => s.athleteId));

  const updateRun = (id, partial) => {
    setRuns(prev => prev.map(r => r.id === id ? { ...r, ...partial } : r));
  };

  // Persist runs
  useEffect(() => {
    const hasAnyStarted = runs.some(r => Object.keys(r.boatStartTimes).length > 0);
    if (!hasAnyStarted && runs.length === 1) return; // don't persist fresh single tab until started
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ runs, savedAt: Date.now() }));
    } catch { /* ignore */ }
  }, [runs]);

  // Live elapsed is computed for the *activeRun*
  const updateLive = useCallback(() => {
    if (!activeRun) return;
    const now = Date.now();
    const updated = {};
    activeBoats.forEach((b) => {
      const start = activeRun.boatStartTimes[b.id];
      if (!start) { updated[b.id] = 0; return; }
      const paused = activeRun.pausedBoats[b.id];
      const pausedMs = (activeRun.pausedOffsets[b.id] || 0) + (paused && activeRun.pauseStarted[b.id] ? now - activeRun.pauseStarted[b.id] : 0);
      updated[b.id] = activeRun.finishTimes[b.id]
        ? activeRun.finishTimes[b.id] - start - (activeRun.pausedOffsets[b.id] || 0)
        : now - start - pausedMs;
    });
    setLiveElapsed(updated);
    rafRef.current = requestAnimationFrame(updateLive);
  }, [activeRun, activeBoats]);

  useEffect(() => {
    // Only run raf if active run has started boats
    if (activeRun && Object.keys(activeRun.boatStartTimes).length > 0) {
      rafRef.current = requestAnimationFrame(updateLive);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [activeRun, updateLive]);

  function startBoat(boatId) { 
    updateRun(activeRunId, { boatStartTimes: { ...activeRun.boatStartTimes, [boatId]: Date.now() } });
  }

  function startAll() {
    const now = Date.now();
    const starts = {};
    activeBoats.forEach((b) => { if (!activeRun.boatStartTimes[b.id]) starts[b.id] = now; });
    updateRun(activeRunId, { boatStartTimes: { ...activeRun.boatStartTimes, ...starts } });
  }

  function handlePause(boatId) {
    if (!activeRun.boatStartTimes[boatId] || activeRun.finishTimes[boatId]) return;
    updateRun(activeRunId, { 
       pausedBoats: { ...activeRun.pausedBoats, [boatId]: true },
       pauseStarted: { ...activeRun.pauseStarted, [boatId]: Date.now() }
    });
  }

  function handleResume(boatId) {
    const now = Date.now();
    const added = now - (activeRun.pauseStarted[boatId] || now);
    const nPauseStarted = { ...activeRun.pauseStarted };
    delete nPauseStarted[boatId];
    updateRun(activeRunId, {
      pausedOffsets: { ...activeRun.pausedOffsets, [boatId]: (activeRun.pausedOffsets[boatId] || 0) + added },
      pausedBoats: { ...activeRun.pausedBoats, [boatId]: false },
      pauseStarted: nPauseStarted
    });
  }

  function handleFinish(boatId, time) {
    if (activeRun.pausedBoats[boatId]) handleResume(boatId);
    updateRun(activeRunId, { finishTimes: { ...activeRun.finishTimes, [boatId]: time } });
  }

  function handleEndAll() {
    const now = Date.now();
    let r = { ...activeRun };
    activeBoats.forEach((b) => { 
      if (r.pausedBoats[b.id]) {
        const added = now - (r.pauseStarted[b.id] || now);
        r.pausedOffsets[b.id] = (r.pausedOffsets[b.id] || 0) + added;
        r.pausedBoats[b.id] = false;
        delete r.pauseStarted[b.id];
      }
    });
    
    activeBoats.forEach((b) => { 
      if (r.boatStartTimes[b.id] && !r.finishTimes[b.id]) {
        r.finishTimes[b.id] = now;
      }
    });

    updateRun(activeRunId, r);
  }

  function handleCreateRun(newBoats) {
    const newRun = {
      id: generateId(),
      title: `Run ${runs.length + 1}`,
      lineupId: crypto.randomUUID ? crypto.randomUUID() : generateId(),
      workoutId: publishData?.lineupId,
      boatsSnapshot: newBoats,
      boatStartTimes: {},
      pausedOffsets: {},
      pausedBoats: {},
      pauseStarted: {},
      finishTimes: {}
    };
    setRuns([...runs, newRun]);
    setActiveRunId(newRun.id);
    setShowSwapModal(false);
  }

  function handleCompleteSession() {
    runs.forEach(r => saveRun(r));
    try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* ignore */ }
    onGoToHistory();
  }

  function saveRun(run) {
    const runBoats = run.boatsSnapshot.filter(b => b.seats.some(s => s.athleteId));
    const results = runBoats
      .map((boat) => {
        const start = run.boatStartTimes[boat.id];
        const finish = run.finishTimes[boat.id];
        const elapsed = start && finish ? finish - start - (run.pausedOffsets[boat.id] || 0) : null;
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

    onSaveSession({
      id: run.id,
      title: publishData?.title ? `${publishData.title} · ${run.title}` : run.title,
      lineupId: run.lineupId,
      workoutId: run.workoutId,
      boatsSnapshot: run.boatsSnapshot,
      date: publishData?.date || new Date().toISOString().split('T')[0],
      time: publishData?.time || new Date().toLocaleTimeString(),
      results,
      startTime: Math.min(...Object.values(run.boatStartTimes).filter(Boolean)),
    }, false); // isLastRun = false so App.jsx doesn't auto-redirect immediately
  }

  const anyStarted = activeBoats.some((b) => activeRun.boatStartTimes[b.id]);
  const allFinished = activeBoats.length > 0 && activeBoats.every((b) => activeRun.finishTimes[b.id]);
  const anyRunning = activeBoats.some((b) => activeRun.boatStartTimes[b.id] && !activeRun.finishTimes[b.id] && !activeRun.pausedBoats[b.id]);

  const allRunsFinished = runs.every(r => {
    const rBoats = r.boatsSnapshot.filter(b => b.seats.some(s => s.athleteId));
    return rBoats.length > 0 && rBoats.every(b => r.finishTimes[b.id]);
  });

  const finishedBoats = activeBoats
    .filter((b) => activeRun.finishTimes[b.id] && activeRun.boatStartTimes[b.id])
    .sort((a, b) => {
      const ea = activeRun.finishTimes[a.id] - activeRun.boatStartTimes[a.id] - (activeRun.pausedOffsets[a.id] || 0);
      const eb = activeRun.finishTimes[b.id] - activeRun.boatStartTimes[b.id] - (activeRun.pausedOffsets[b.id] || 0);
      return ea - eb;
    });

  const notStartedBoats = activeBoats.filter((b) => !activeRun.boatStartTimes[b.id]);
  const allBoatElapsed = {};
  activeBoats.forEach((b) => { allBoatElapsed[b.name] = liveElapsed[b.id] || 0; });

  return (
    <div className="px-4 sm:px-6 py-4 max-w-3xl mx-auto flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Header Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-none pb-2 shrink-0 border-b border-[#E5E7EB]">
        {runs.map(r => (
           <button
             key={r.id}
             onClick={() => setActiveRunId(r.id)}
             className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
               activeRunId === r.id 
                 ? 'bg-[#111827] text-white shadow-md' 
                 : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]'
             }`}
           >
             {r.title}
             {r.saved && <span className="ml-2 text-green-400">✓</span>}
             {Object.keys(r.boatStartTimes).length > 0 && Object.keys(r.finishTimes).length < activeBoats.length && !r.saved && (
                <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
             )}
           </button>
        ))}
        <button 
           onClick={() => setShowSwapModal(true)}
           className="px-3 py-2 rounded-xl bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] shrink-0 transition-colors"
           title="New Run with Lineup Tweaks"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      <div className="flex items-start justify-between mb-4 shrink-0">
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
          activeRun.saved ? 'bg-green-100 text-[#16A34A]'
          : !anyStarted ? 'bg-[#F3F4F6] text-[#6B7280]'
          : anyRunning ? 'bg-blue-50 text-[#2563EB]'
          : allFinished ? 'bg-green-50 text-[#16A34A]'
          : 'bg-amber-50 text-amber-700'
        }`}>
          {activeRun.saved ? '✓ Saved' : !anyStarted ? 'Ready' : anyRunning ? '● In Progress' : allFinished ? 'Completed' : 'Paused'}
        </div>
      </div>

      {/* Start all / End all */}
      {notStartedBoats.length > 1 && !activeRun.saved && (
        <div className="mb-4 shrink-0">
          <button onClick={startAll} className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-bold hover:bg-[#1d4ed8] transition-colors active:scale-95 shadow-sm">
            🚣 Start Race — All Boats
          </button>
        </div>
      )}
      {anyRunning && !activeRun.saved && (
        <div className="mb-4 shrink-0">
          <button onClick={handleEndAll} className="w-full py-2.5 rounded-xl border border-[#FCA5A5] bg-red-50 text-[#DC2626] font-semibold hover:bg-red-100 transition-colors text-sm">
            End All Boats
          </button>
        </div>
      )}

      {/* Stopwatch */}
      {activeBoats.length > 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden mb-4 shadow-sm flex-1 relative min-h-[300px]">
          {activeRun.saved && (
             <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-sm flex items-center justify-center">
               <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xl text-center max-w-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3 text-2xl font-bold">✓</div>
                  <h3 className="font-bold text-[#111827] text-lg">Run Saved</h3>
                  <p className="text-[#6B7280] text-sm mt-1 mb-4">The results of {activeRun.title} have been stored.</p>
               </div>
             </div>
          )}
          <Stopwatch
            boats={boats}
            athletes={athletes}
            boatStartTimes={activeRun.boatStartTimes}
            pausedOffsets={activeRun.pausedOffsets}
            pausedBoats={activeRun.pausedBoats}
            finishTimes={activeRun.finishTimes}
            allBoatElapsed={allBoatElapsed}
            onStart={startBoat}
            onPause={handlePause}
            onResume={handleResume}
            onFinish={handleFinish}
          />
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center mb-4 flex-1">
          <p className="text-[#9CA3AF] text-sm">No athletes assigned. Go to Lineup to set up boats.</p>
        </div>
      )}

      {/* Final results section */}
      {allFinished && (
        <div className="space-y-3 shrink-0 pb-6">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
            <h3 className="text-[#111827] font-bold mb-3 text-base">Final Results - {activeRun.title}</h3>
            <div className="space-y-2">
              {finishedBoats.map((boat, i) => {
                const elapsed = activeRun.finishTimes[boat.id] - activeRun.boatStartTimes[boat.id] - (activeRun.pausedOffsets[boat.id] || 0);
                const winnerElapsed = activeRun.finishTimes[finishedBoats[0].id] - activeRun.boatStartTimes[finishedBoats[0].id] - (activeRun.pausedOffsets[finishedBoats[0].id] || 0);
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
        </div>
      )}

      {/* Global Complete Session */}
      {allRunsFinished && (
        <div className="mt-auto shrink-0 pb-6 pt-4 border-t border-[#E5E7EB]">
          <button onClick={handleCompleteSession} className="w-full py-4 rounded-xl bg-[#16A34A] text-white font-bold text-lg hover:bg-green-700 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2">
             ✓ Complete & Save Entire Session ({runs.length} {runs.length === 1 ? 'Run' : 'Runs'})
          </button>
        </div>
      )}

      {showSwapModal && (
        <CreateRunSwapModal
          initialBoats={boats}
          athletes={athletes}
          onClose={() => setShowSwapModal(false)}
          onCreate={handleCreateRun}
        />
      )}
    </div>
  );
}
