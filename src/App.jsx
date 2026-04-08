import { useReducer, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import Header from './components/Header';
import BoatSection from './components/BoatSection';
import RosterGrid from './components/RosterGrid';
import AddBoatModal from './components/AddBoatModal';
import PublishModal from './components/PublishModal';
import EmailPreview from './components/EmailPreview';
import LiveSession from './components/LiveSession';
import SessionsList from './components/SessionsList';
import Results from './components/Results';
import CoachRoster from './components/CoachRoster';
import AthleteView from './components/AthleteView';
import SignInModal from './components/SignInModal';
import PairsManager from './components/PairsManager';
import PerformanceDashboard from './components/PerformanceDashboard';
import { createAthlete, createBoat, SAMPLE_ATHLETES, getTotalAssigned, generateId, getInitials, getAvatarColor } from './utils/helpers';
import { useAuthStore } from './stores/authStore.js';
import { useRosterStore } from './stores/rosterStore.js';
import { supabase, IS_SUPABASE } from './lib/supabase.js';
import { DEMO_ATHLETES, DEMO_PUBLISHED_LINEUPS } from './lib/demoData.js';
import { DUMMY_SESSIONS } from './utils/dummyData.js';

// Initial boats
const INITIAL_BOATS = [
  createBoat('Shell 1', 8),
  createBoat('Shell 2', 8),
  createBoat('Shell 3', 4),
];

const initialState = {
  athletes: [],
  boats: INITIAL_BOATS,
  published: false,
  publishData: null,
  sessions: [...DUMMY_SESSIONS],
  publishedLineups: [...DUMMY_SESSIONS], // All published lineup snapshots — source of truth for history
  pairs: [],
};

function snapshotLineup({ boats, athletes, publishData, lineupId }) {
  return {
    id: lineupId,
    title: publishData.title,
    date: publishData.date,
    time: publishData.time,
    note: publishData.note || '',
    publishedAt: Date.now(),
    results: null,
    boats: boats
      .filter((b) => b.seats.some((s) => s.athleteId))
      .map((boat) => ({
        id: boat.id,
        name: boat.name,
        size: boat.size,
        athletes: boat.seats
          .filter((s) => s.athleteId)
          .map((s) => {
            const a = athletes.find((at) => at.id === s.athleteId);
            if (!a) return null;
            return { id: a.id, name: a.name, seatNum: s.seatNum, initials: a.initials, colorIndex: a.colorIndex, position: a.position, oarSide: a.oarSide ?? null };
          })
          .filter(Boolean),
      })),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'IMPORT_ATHLETES': {
      const athletes = action.payload.map((a, i) => {
        const base = createAthlete(a.name, a.email, i);
        return {
          ...base,
          ...(a.id ? { id: a.id } : {}),
          ...(a.position ? { position: a.position } : {}),
          ...(a.colorIndex !== undefined ? { colorIndex: a.colorIndex } : {}),
          ...(a.initials ? { initials: a.initials } : {}),
        };
      });
      return { ...state, athletes };
    }

    case 'ASSIGN_ATHLETE': {
      const { boatId, seatNum, athleteId } = action.payload;
      let boats = state.boats.map((boat) => ({
        ...boat,
        seats: boat.seats.map((seat) =>
          seat.athleteId === athleteId ? { ...seat, athleteId: null } : seat
        ),
      }));
      boats = boats.map((boat) => {
        if (boat.id !== boatId) return boat;
        return {
          ...boat,
          seats: boat.seats.map((seat) =>
            seat.seatNum === seatNum ? { ...seat, athleteId } : seat
          ),
        };
      });
      return { ...state, boats };
    }

    case 'REMOVE_ATHLETE': {
      const { boatId, seatNum } = action.payload;
      return {
        ...state,
        boats: state.boats.map((boat) => {
          if (boat.id !== boatId) return boat;
          return {
            ...boat,
            seats: boat.seats.map((seat) =>
              seat.seatNum === seatNum ? { ...seat, athleteId: null } : seat
            ),
          };
        }),
      };
    }

    case 'TOGGLE_BOAT_SIZE': {
      const { boatId, size } = action.payload;
      return {
        ...state,
        boats: state.boats.map((boat) => {
          if (boat.id !== boatId) return boat;
          const seats = [];
          for (let i = 1; i <= size; i++) {
            const existing = boat.seats.find((s) => s.seatNum === i);
            seats.push(existing || { seatNum: i, athleteId: null });
          }
          return { ...boat, size, seats };
        }),
      };
    }

    case 'ADD_BOAT': {
      const newBoat = createBoat(action.payload.name, action.payload.size);
      return { ...state, boats: [...state.boats, newBoat] };
    }

    case 'DELETE_BOAT': {
      return {
        ...state,
        boats: state.boats.filter((b) => b.id !== action.payload),
      };
    }

    case 'PUBLISH': {
      const { lineupId, ...formData } = action.payload;
      const snapshot = snapshotLineup({
        boats: state.boats,
        athletes: state.athletes,
        publishData: formData,
        lineupId,
      });
      return {
        ...state,
        published: true,
        publishData: { ...formData, lineupId },
        publishedLineups: [...state.publishedLineups, snapshot],
      };
    }

    case 'LOAD_LINEUP_STATE': {
      const { boats, published, publish_data } = action.payload;
      return {
        ...state,
        boats: boats && boats.length ? boats : state.boats,
        published: !!published,
        publishData: publish_data || null,
      };
    }

    case 'LOAD_PUBLISHED_LINEUPS': {
      return { ...state, publishedLineups: action.payload };
    }

    case 'UNLOCK': {
      return { ...state, published: false };
    }

    case 'SAVE_SESSION': {
      const session = action.payload;
      const lineupId = session.lineupId; // Passed explicitly now

      const resultsObj = {
        completedAt: Date.now(),
        workoutId: session.workoutId || lineupId,
        boats: session.results.map((r, i) => ({
          boatId: r.boatId,
          boatName: r.boatName,
          elapsed: r.elapsed,
          placement: i + 1,
          finishTime: r.finishTime,
        })),
      };

      const existingLineup = lineupId && state.publishedLineups.find(
        (l) => l.id === lineupId && !l.results
      );

      let updatedLineups;
      if (existingLineup) {
        updatedLineups = state.publishedLineups.map((lineup) =>
          lineup.id !== lineupId ? lineup : { ...lineup, results: resultsObj }
        );
      } else {
        const newLineup = {
          id: session.lineupId,
          title: session.title,
          date: session.date,
          time: session.time,
          note: session.note || '',
          publishedAt: Date.now(),
          results: resultsObj,
          boats: session.results.map((r) => ({
            id: r.boatId,
            name: r.boatName,
            size: session.boatsSnapshot?.find(b => b.id === r.boatId)?.size || r.crew?.length || 0,
            athletes: r.crew || [],
          })),
        };
        updatedLineups = [newLineup, ...state.publishedLineups];
      }

      return {
        ...state,
        sessions: [session, ...state.sessions],
        publishedLineups: updatedLineups,
      };
    }

    case 'FILL_BOAT_SEATS': {
      const { boatId, athleteIds } = action.payload;
      // First remove these athletes from any current seat assignments
      let updatedBoats = state.boats.map((boat) => ({
        ...boat,
        seats: boat.seats.map((seat) =>
          athleteIds.includes(seat.athleteId) ? { ...seat, athleteId: null } : seat
        ),
      }));
      // Then assign to the target boat's open seats in order
      updatedBoats = updatedBoats.map((boat) => {
        if (boat.id !== boatId) return boat;
        const openSeats = boat.seats.filter((s) => !s.athleteId).map((s) => s.seatNum);
        const assignments = {};
        athleteIds.forEach((aid, i) => {
          if (openSeats[i] !== undefined) assignments[openSeats[i]] = aid;
        });
        return {
          ...boat,
          seats: boat.seats.map((seat) =>
            assignments[seat.seatNum] !== undefined
              ? { ...seat, athleteId: assignments[seat.seatNum] }
              : seat
          ),
        };
      });
      return { ...state, boats: updatedBoats };
    }

    case 'UPDATE_ATHLETE': {
      const { id, name, email, position, oarSide } = action.payload;
      return {
        ...state,
        athletes: state.athletes.map((a) => {
          if (a.id !== id) return a;
          const updatedName = name !== undefined ? name : a.name;
          return {
            ...a,
            name: updatedName,
            email: email !== undefined ? email : a.email,
            position: position !== undefined ? position : a.position,
            oarSide: oarSide !== undefined ? oarSide : a.oarSide,
            initials: name !== undefined ? getInitials(updatedName) : a.initials,
          };
        }),
      };
    }

    case 'SWAP_ATHLETES': {
      // Exchange athleteIds between two seats (may be in different boats)
      const { a: seatA, b: seatB } = action.payload;
      return {
        ...state,
        boats: state.boats.map((boat) => {
          const inA = boat.id === seatA.boatId;
          const inB = boat.id === seatB.boatId;
          if (!inA && !inB) return boat;
          return {
            ...boat,
            seats: boat.seats.map((seat) => {
              if (inA && seat.seatNum === seatA.seatNum) return { ...seat, athleteId: seatB.athleteId };
              if (inB && seat.seatNum === seatB.seatNum) return { ...seat, athleteId: seatA.athleteId };
              return seat;
            }),
          };
        }),
      };
    }

    case 'ADD_PAIR': {
      return { ...state, pairs: [...state.pairs, action.payload] };
    }

    case 'REMOVE_PAIR': {
      return { ...state, pairs: state.pairs.filter((p) => p.id !== action.payload) };
    }

    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [screen, setScreen] = useState('lineup');
  const [activeSessionLineupId, setActiveSessionLineupId] = useState(null);
  const [showAddBoat, setShowAddBoat] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [publishFormData, setPublishFormData] = useState(null);
  const [mobilePickerTarget, setMobilePickerTarget] = useState(null);
  const [mobilePickerSearch, setMobilePickerSearch] = useState('');
  const [activeDragId, setActiveDragId] = useState(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const [swapSource, setSwapSource] = useState(null); // { boatId, seatNum, athleteId }
  const [showPairsManager, setShowPairsManager] = useState(false);

  const { user } = useAuthStore();
  const { athletes: rosterAthletes, batches: rosterBatches, addAthletes: rosterAddAthletes, setAthletes: rosterSetAthletes } = useRosterStore();
  const dbLoadedRef = useRef(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  // View mode: 'coach' | 'athlete'
  const [viewMode, setViewMode] = useState('coach');
  const [viewingAthleteId, setViewingAthleteId] = useState(null);

  const { athletes, boats, published, publishData, sessions, publishedLineups, pairs } = state;

  // ── Supabase: load team data on mount ──────────────────────
  useEffect(() => {
    if (!user?.team_id) return;

    // Demo account — load local seed data instantly
    if (user.team_id === 'demo-team-1') {
      dispatch({ type: 'IMPORT_ATHLETES', payload: DEMO_ATHLETES });
      dispatch({ type: 'LOAD_PUBLISHED_LINEUPS', payload: DEMO_PUBLISHED_LINEUPS });
      dbLoadedRef.current = true;
      return;
    }

    if (!IS_SUPABASE) return;
    async function load() {
      const teamId = user.team_id;

      const [{ data: rosterData }, { data: lineupData }, { data: pubData }] = await Promise.all([
        supabase.from('roster_athletes').select('*').eq('team_id', teamId).order('created_at'),
        supabase.from('lineup_state').select('*').eq('team_id', teamId).maybeSingle(),
        supabase.from('published_lineups').select('*').eq('team_id', teamId).order('published_at', { ascending: false }),
      ]);

      if (rosterData?.length) {
        dispatch({
          type: 'IMPORT_ATHLETES',
          payload: rosterData.map((a) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            position: a.position,
            initials: getInitials(a.name),
            colorIndex: a.color_index,
          })),
        });
      }
      if (lineupData) {
        dispatch({ type: 'LOAD_LINEUP_STATE', payload: lineupData });
      }
      if (pubData?.length) {
        dispatch({
          type: 'LOAD_PUBLISHED_LINEUPS',
          payload: pubData.map((l) => ({
            id: l.id,
            title: l.title,
            date: l.date,
            time: l.time,
            note: l.note || '',
            publishedAt: new Date(l.published_at).getTime(),
            results: l.results,
            boats: l.boats,
          })),
        });
      }
      dbLoadedRef.current = true;
    }
    load();
  }, [user?.team_id]);

  // ── Auto-route athlete logins to their own profile ──────────
  useEffect(() => {
    if (user?.role === 'athlete' && user?.athlete_id) {
      setViewMode('athlete');
      setViewingAthleteId(user.athlete_id);
    }
  }, [user?.role, user?.athlete_id]);

  // ── Seed athletes from rosterStore on mount (guest persistence) ─────────
  useEffect(() => {
    if (!user && rosterAthletes.length > 0 && athletes.length === 0) {
      dispatch({ type: 'IMPORT_ATHLETES', payload: rosterAthletes });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterAthletes.length]);

  // ── Supabase: sync lineup state after changes (debounced) ──
  useEffect(() => {
    if (!IS_SUPABASE || !user?.team_id || !dbLoadedRef.current) return;
    if (user.team_id === 'demo-team-1') return;
    const timer = setTimeout(async () => {
      await supabase.from('lineup_state').upsert(
        { team_id: user.team_id, boats, published, publish_data: publishData, updated_at: new Date().toISOString() },
        { onConflict: 'team_id' }
      );
    }, 600);
    return () => clearTimeout(timer);
  }, [boats, published, publishData, user?.team_id]);

  const assignedAthleteIds = new Set();
  boats.forEach((b) => b.seats.forEach((s) => { if (s.athleteId) assignedAthleteIds.add(s.athleteId); }));
  const isAssigned = useCallback((id) => assignedAthleteIds.has(id), [assignedAthleteIds]);

  const canPublish = boats.some((b) => b.seats.filter((s) => s.athleteId).length >= 2);

  async function handleImport(parsed, batchName) {
    // Build proper athlete objects first
    const athleteObjects = parsed.map((a, i) => {
      const base = createAthlete(a.name, a.email, i);
      return {
        ...base,
        ...(a.id ? { id: a.id } : {}),
        ...(a.position ? { position: a.position } : {}),
        ...(a.colorIndex !== undefined ? { colorIndex: a.colorIndex } : {}),
        ...(a.initials ? { initials: a.initials } : {}),
        ...(a.batchId ? { batchId: a.batchId } : {}),
      };
    });
    dispatch({ type: 'IMPORT_ATHLETES', payload: athleteObjects });
    // Persist to rosterStore for guest users (survives refresh)
    if (!user) {
      rosterAddAthletes(athleteObjects, batchName || 'Roster');
    }
    if (IS_SUPABASE && user?.team_id) {
      await supabase.from('roster_athletes').upsert(
        athleteObjects.map((a, i) => ({
          id: a.id,
          team_id: user.team_id,
          name: a.name,
          email: a.email || '',
          position: a.position || 'Mid',
          color_index: a.colorIndex ?? i,
        })),
        { onConflict: 'id' }
      );
    }
  }

  async function handleLoadSample() {
    dispatch({ type: 'IMPORT_ATHLETES', payload: SAMPLE_ATHLETES });
    if (IS_SUPABASE && user?.team_id) {
      await supabase.from('roster_athletes').upsert(
        SAMPLE_ATHLETES.map((a, i) => ({
          id: a.id,
          team_id: user.team_id,
          name: a.name,
          email: a.email || '',
          position: a.position || 'Mid',
          color_index: a.colorIndex ?? i,
        })),
        { onConflict: 'id' }
      );
    }
  }

  function handleAssign(boatId, seatNum, athleteId) {
    dispatch({ type: 'ASSIGN_ATHLETE', payload: { boatId, seatNum, athleteId } });
  }

  function handleRemove(boatId, seatNum) {
    dispatch({ type: 'REMOVE_ATHLETE', payload: { boatId, seatNum } });
  }

  function handleToggleSize(boatId, size) {
    dispatch({ type: 'TOGGLE_BOAT_SIZE', payload: { boatId, size } });
  }

  async function handlePublish(formData) {
    const lineupId = generateId();
    setPublishFormData(formData);
    setShowPublish(false);
    dispatch({ type: 'PUBLISH', payload: { ...formData, lineupId } });
    setShowEmail(true);

    if (IS_SUPABASE && user?.team_id) {
      const snapshot = snapshotLineup({ boats, athletes, publishData: formData, lineupId });
      await supabase.from('published_lineups').insert({
        id: lineupId,
        team_id: user.team_id,
        title: formData.title,
        date: formData.date || null,
        time: formData.time || null,
        note: formData.note || '',
        boats: snapshot.boats,
        results: null,
      });
    }
  }

  async function handleSaveSession(sessionData, isLastRun = true) {
    dispatch({ type: 'SAVE_SESSION', payload: sessionData });
    if (isLastRun) {
      setScreen('history');
    }

    if (IS_SUPABASE && user?.team_id && sessionData.lineupId) {
      const results = {
        completedAt: Date.now(),
        workoutId: sessionData.workoutId || sessionData.lineupId,
        boats: sessionData.results.map((r, i) => ({
          boatId: r.boatId,
          boatName: r.boatName,
          elapsed: r.elapsed,
          placement: i + 1,
          finishTime: r.finishTime,
        })),
      };

      // Check if we are updating the existing queued lineup, or inserting a parallel spawn
      const exists = publishedLineups.some(l => l.id === sessionData.lineupId);
      
      if (exists) {
        await supabase
          .from('published_lineups')
          .update({ results })
          .eq('id', sessionData.lineupId)
          .catch(() => {}); // Catch silent db network errors
      } else {
        await supabase.from('published_lineups').insert({
          id: sessionData.lineupId,
          team_id: user.team_id,
          title: sessionData.title,
          date: sessionData.date || null,
          time: sessionData.time || null,
          note: sessionData.note || '',
          boats: sessionData.results.map((r) => ({
            id: r.boatId,
            name: r.boatName,
            size: sessionData.boatsSnapshot?.find(b => b.id === r.boatId)?.size || r.crew?.length || 0,
            athletes: r.crew || [],
          })),
          results: results,
        });
      }
    }
  }

  function handleTapSelect(boatId, seatNum) {
    setMobilePickerTarget({ boatId, seatNum });
    setMobilePickerSearch('');
  }

  function handleMobilePick(athleteId) {
    if (mobilePickerTarget) {
      handleAssign(mobilePickerTarget.boatId, mobilePickerTarget.seatNum, athleteId);
      setMobilePickerTarget(null);
    }
  }

  function handleDragStart(event) {
    setActiveDragId(event.active.id);
  }

  function handleDragEnd(event) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || !active) return;
    const { boatId, seatNum, currentAthleteId } = over.data.current;
    if (currentAthleteId) {
      // Target seat is occupied — find source seat and swap
      let sourceBoatId = null;
      let sourceSeatNum = null;
      boats.forEach((boat) => {
        boat.seats.forEach((seat) => {
          if (seat.athleteId === active.id) {
            sourceBoatId = boat.id;
            sourceSeatNum = seat.seatNum;
          }
        });
      });
      if (sourceBoatId !== null) {
        dispatch({ type: 'SWAP_ATHLETES', payload: {
          a: { boatId: sourceBoatId, seatNum: sourceSeatNum, athleteId: active.id },
          b: { boatId, seatNum, athleteId: currentAthleteId },
        }});
      }
    } else {
      handleAssign(boatId, seatNum, active.id);
    }
  }

  function handleFillBoat(boatId, athleteIds) {
    dispatch({ type: 'FILL_BOAT_SEATS', payload: { boatId, athleteIds } });
  }

  function handleRearrange() {
    dispatch({ type: 'UNLOCK' });
    setSwapMode(true);
    setSwapSource(null);
  }

  function handleSwapSelect({ boatId, seatNum, athleteId }) {
    if (!swapSource) {
      setSwapSource({ boatId, seatNum, athleteId });
    } else {
      if (swapSource.boatId === boatId && swapSource.seatNum === seatNum) {
        // Tapped same seat — deselect
        setSwapSource(null);
        return;
      }
      dispatch({ type: 'SWAP_ATHLETES', payload: {
        a: { boatId: swapSource.boatId, seatNum: swapSource.seatNum, athleteId: swapSource.athleteId },
        b: { boatId, seatNum, athleteId },
      }});
      setSwapSource(null);
    }
  }

  function handleDoneSwapping() {
    setSwapMode(false);
    setSwapSource(null);
  }

  async function handleUpdateAthlete(payload) {
    dispatch({ type: 'UPDATE_ATHLETE', payload });

    if (IS_SUPABASE && user?.team_id) {
      const updates = {};
      if (payload.name !== undefined) updates.name = payload.name;
      if (payload.email !== undefined) updates.email = payload.email;
      if (payload.position !== undefined) updates.position = payload.position;
      if (Object.keys(updates).length) {
        await supabase.from('roster_athletes').update(updates).eq('id', payload.id);
      }
    }
  }

  function handleSwitchToAthlete(athleteId) {
    setViewingAthleteId(athleteId);
    setViewMode('athlete');
  }

  function handleSwitchToCoach() {
    setViewMode('coach');
    setViewingAthleteId(null);
  }

  const viewingAthlete = viewingAthleteId ? athletes.find((a) => a.id === viewingAthleteId) : null;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Header
        screen={screen}
        onScreenChange={setScreen}
        published={published}
        hasSession={sessions.length > 0}
        viewMode={viewMode}
        viewingAthlete={viewingAthlete}
        athletes={athletes}
        onSwitchToAthlete={handleSwitchToAthlete}
        onSwitchToCoach={handleSwitchToCoach}
      />

      {/* Athlete View — full replacement of content area */}
      {viewMode === 'athlete' && viewingAthlete && (
        <AthleteView
          athlete={viewingAthlete}
          athletes={athletes}
          publishedLineups={publishedLineups}
          onUpdateAthlete={handleUpdateAthlete}
        />
      )}

      {/* Coach View */}
      {viewMode === 'coach' && (
        <>
          {/* Lineup Screen */}
          {screen === 'lineup' && (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="px-6 py-6 max-w-7xl mx-auto">
                <BoatSection
                  boats={boats}
                  athletes={athletes}
                  onToggleSize={handleToggleSize}
                  onRemove={handleRemove}
                  published={published}
                  onAddBoat={() => setShowAddBoat(true)}
                  onTapSelect={!swapMode ? handleTapSelect : undefined}
                  onFillSeats={handleFillBoat}
                  pairs={pairs}
                  onShowPairs={() => setShowPairsManager(true)}
                  swapMode={swapMode}
                  swapSource={swapSource}
                  onSwapSelect={handleSwapSelect}
                  onRearrange={handleRearrange}
                />

                <RosterGrid
                  athletes={athletes}
                  boats={boats}
                  onImport={handleImport}
                  onLoadSample={handleLoadSample}
                  isAssigned={isAssigned}
                  published={published}
                  batches={user?.team_id === 'demo-team-1' ? [] : rosterBatches}
                />

                <div className="mt-6 space-y-3">
                  {!published && canPublish && (
                    <button
                      onClick={() => {
                        if (!user) {
                          setPendingPublish(true);
                          setShowSignInModal(true);
                        } else {
                          setShowPublish(true);
                        }
                      }}
                      className="w-full py-4 rounded-xl bg-[#2563EB] text-white font-bold text-lg hover:bg-[#1d4ed8] transition-colors"
                    >
                      PUBLISH LINEUP
                    </button>
                  )}

                  {published && !swapMode && (
                    <>
                      <button
                        onClick={() => {
                          if (publishData?.lineupId) setActiveSessionLineupId(publishData.lineupId);
                          setScreen('session');
                        }}
                        className="w-full py-4 rounded-xl bg-[#22C55E] text-white font-bold text-lg hover:bg-[#16a34a] transition-colors"
                      >
                        START SESSION
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'UNLOCK' })}
                        className="w-full py-3 rounded-xl bg-white border border-[#E5E7EB] text-[#6B7280] font-medium hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors"
                      >
                        Edit Lineup
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Drag overlay — floating card that follows the pointer/finger */}
              <DragOverlay dropAnimation={null}>
                {activeDragId ? (() => {
                  const a = athletes.find((at) => at.id === activeDragId);
                  if (!a) return null;
                  return (
                    <div className="flex items-center gap-3 bg-[#243049] border border-[#2563EB]/60 rounded-xl px-3 py-2.5 shadow-2xl shadow-black/60 cursor-grabbing">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: getAvatarColor(a.colorIndex) }}
                      >
                        {a.initials}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{a.name}</div>
                        <div className="text-[#64748B] text-xs">{a.position}</div>
                      </div>
                    </div>
                  );
                })() : null}
              </DragOverlay>
            </DndContext>
          )}

          {/* Roster Screen */}
          {screen === 'roster' && (
            <CoachRoster
              athletes={athletes}
              boats={boats}
              publishedLineups={publishedLineups}
              onUpdateAthlete={handleUpdateAthlete}
            />
          )}

          {/* Session Screen — Queued Sessions List or Live Timer */}
          {screen === 'session' && !activeSessionLineupId && (
            <SessionsList 
               publishedLineups={publishedLineups}
               athletes={athletes}
               onStartSession={(id) => setActiveSessionLineupId(id)}
            />
          )}

          {screen === 'session' && activeSessionLineupId && (() => {
             const lineup = publishedLineups.find(l => l.id === activeSessionLineupId);
             if (!lineup) {
               // Fallback if lineup got deleted or missing
               return (
                  <div className="p-8 text-center text-gray-500">
                    Lineup not found. <button onClick={() => setActiveSessionLineupId(null)} className="text-blue-500 underline">Go back</button>
                  </div>
               );
             }
             
             // Reconstruct initialBoats for LiveSession from the lineup snapshot
             const reconstructedBoats = lineup.boats.map(b => {
                const seats = [];
                for(let i=1; i<=b.size; i++) {
                   const ath = b.athletes.find(a => a.seatNum === i);
                   seats.push({ seatNum: i, athleteId: ath ? ath.id : null });
                }
                return { id: b.id, name: b.name, size: b.size, seats };
             });

             const runPublishData = {
                title: lineup.title,
                date: lineup.date,
                time: lineup.time,
                note: lineup.note,
                lineupId: lineup.id,
             };

             return (
               <LiveSession
                 initialBoats={reconstructedBoats}
                 athletes={athletes}
                 publishData={runPublishData}
                 onSaveSession={handleSaveSession}
                 onBack={() => setActiveSessionLineupId(null)} // Returns to list
                 onGoToHistory={() => { setActiveSessionLineupId(null); setScreen('history'); }} // Transitions seamlessly
               />
             );
          })()}

          {/* History / Performance Dashboard */}
          {screen === 'history' && (
            <PerformanceDashboard
              athletes={athletes}
              publishedLineups={publishedLineups}
            />
          )}

          {/* Results Screen (legacy, kept for saved sessions) */}
          {screen === 'results' && (
            <Results sessions={sessions} />
          )}
        </>
      )}

      {/* Swap mode floating bar */}
      {swapMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl px-5 py-3">
          <span className="text-sm text-[#6B7280]">
            {swapSource ? '✓ Tap another seat to swap' : 'Tap a seat to select'}
          </span>
          {swapSource && (
            <button
              onClick={() => setSwapSource(null)}
              className="text-xs text-[#9CA3AF] hover:text-[#111827] transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleDoneSwapping}
            className="px-4 py-1.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] transition-colors"
          >
            Done Rearranging
          </button>
        </div>
      )}

      {/* Pairs Manager */}
      {showPairsManager && (
        <PairsManager
          athletes={athletes}
          pairs={pairs}
          onAddPair={(pair) => dispatch({ type: 'ADD_PAIR', payload: pair })}
          onRemovePair={(id) => dispatch({ type: 'REMOVE_PAIR', payload: id })}
          onClose={() => setShowPairsManager(false)}
        />
      )}

      {/* Sign-in gate modal (shown when guest tries to publish) */}
      {showSignInModal && (
        <SignInModal
          title="Sign in to publish"
          onClose={() => { setShowSignInModal(false); setPendingPublish(false); }}
          onSuccess={() => {
            setShowSignInModal(false);
            if (pendingPublish) {
              setPendingPublish(false);
              setShowPublish(true);
            }
          }}
        />
      )}

      {/* Modals */}
      {showAddBoat && (
        <AddBoatModal
          boats={boats}
          onClose={() => setShowAddBoat(false)}
          onAdd={(name, size) => dispatch({ type: 'ADD_BOAT', payload: { name, size } })}
          onDelete={(id) => dispatch({ type: 'DELETE_BOAT', payload: id })}
        />
      )}

      {showPublish && (
        <PublishModal
          onClose={() => setShowPublish(false)}
          onPublish={handlePublish}
        />
      )}

      {showEmail && (
        <EmailPreview
          boats={boats}
          athletes={athletes}
          publishData={publishFormData}
          onDone={() => setShowEmail(false)}
        />
      )}

      {/* Mobile Athlete Picker */}
      {mobilePickerTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0"
            onClick={() => setMobilePickerTarget(null)}
          />
          <div className="relative bg-white rounded-t-2xl w-full max-h-[75dvh] flex flex-col shadow-xl">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6] shrink-0">
              <div>
                <h3 className="text-[#111827] font-bold text-base">Select Athlete</h3>
                <p className="text-[#9CA3AF] text-xs mt-0.5">
                  Seat {mobilePickerTarget.seatNum} · {boats.find(b => b.id === mobilePickerTarget.boatId)?.name}
                </p>
              </div>
              <button
                onClick={() => setMobilePickerTarget(null)}
                className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
              >
                ✕
              </button>
            </div>
            {/* Search */}
            <div className="px-5 pt-3 pb-2 shrink-0">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search athletes…"
                  value={mobilePickerSearch}
                  onChange={(e) => setMobilePickerSearch(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl h-10 pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB] transition-colors"
                  autoFocus
                />
              </div>
            </div>
            {/* Athlete list */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <div className="space-y-2">
                {athletes
                  .filter((a) => !isAssigned(a.id))
                  .filter((a) => !mobilePickerSearch || a.name.toLowerCase().includes(mobilePickerSearch.toLowerCase()))
                  .map((a) => (
                    <button
                      key={a.id}
                      onClick={() => handleMobilePick(a.id)}
                      className="w-full flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 hover:bg-[#F9FAFB] hover:border-[#D1D5DB] active:scale-[0.98] transition-all text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: getAvatarColor(a.colorIndex) }}
                      >
                        {a.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#111827] text-sm font-semibold truncate">{a.name}</div>
                        <div className="flex items-center gap-1 text-[#9CA3AF] text-xs">
                          <span>{a.position}</span>
                          {a.oarSide && (
                            <span className="flex gap-0.5 items-center ml-1">
                              {(a.oarSide === 'port' || a.oarSide === 'both') && <span className="w-2 h-2 rounded-full bg-[#16A34A] block" />}
                              {(a.oarSide === 'starboard' || a.oarSide === 'both') && <span className="w-2 h-2 rounded-full bg-[#DC2626] block" />}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[#9CA3AF] text-xs shrink-0">Assign →</span>
                    </button>
                  ))}
                {athletes.filter((a) => !isAssigned(a.id)).length === 0 && (
                  <p className="text-[#9CA3AF] text-sm text-center py-8">All athletes are already seated.</p>
                )}
                {athletes.filter((a) => !isAssigned(a.id)).length > 0 &&
                  athletes.filter((a) => !isAssigned(a.id)).filter((a) => !mobilePickerSearch || a.name.toLowerCase().includes(mobilePickerSearch.toLowerCase())).length === 0 && (
                  <p className="text-[#9CA3AF] text-sm text-center py-8">No athletes match "{mobilePickerSearch}"</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
