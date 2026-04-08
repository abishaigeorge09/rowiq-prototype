import { generateId } from './helpers';

// Ensure athlete ids match the app's sample roster (ath-1, ath-2, …) so avatars/colors line up.
const ATHLETES = [
  { id: 'ath-1', name: 'Alex Johnson', initials: 'AJ', colorIndex: 0 },
  { id: 'ath-2', name: 'Bella Martinez', initials: 'BM', colorIndex: 1 },
  { id: 'ath-3', name: 'Chris Park', initials: 'CP', colorIndex: 2 },
  { id: 'ath-4', name: 'Dana Williams', initials: 'DW', colorIndex: 3 },
  { id: 'ath-5', name: 'Eli Thompson', initials: 'ET', colorIndex: 4 },
  { id: 'ath-6', name: 'Fiona Chen', initials: 'FC', colorIndex: 5 },
  { id: 'ath-7', name: 'Gabe Rivera', initials: 'GR', colorIndex: 6 },
  { id: 'ath-8', name: 'Hana Patel', initials: 'HP', colorIndex: 7 },
];

function isoDateLocal(d) {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function timeForRun(runIdx) {
  // 06:00, 06:30, 07:00, 07:30
  const baseMin = 6 * 60 + runIdx * 30;
  const hh = String(Math.floor(baseMin / 60)).padStart(2, '0');
  const mm = String(baseMin % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function makeBoats({ boat1Id, boat2Id, swap }) {
  const men = [
    { ...ATHLETES[0], seatNum: 1 },
    { ...(swap ? ATHLETES[3] : ATHLETES[1]), seatNum: 2 }, // swap Bella <-> Dana
    { ...ATHLETES[2], seatNum: 3 },
    { ...ATHLETES[6], seatNum: 4 },
  ];

  const women = [
    { ...(swap ? ATHLETES[1] : ATHLETES[3]), seatNum: 1 },
    { ...ATHLETES[4], seatNum: 2 },
    { ...ATHLETES[5], seatNum: 3 },
    { ...ATHLETES[7], seatNum: 4 },
  ];

  return [
    { id: boat1Id, name: 'Varsity 8+', size: 8, athletes: men },
    { id: boat2Id, name: 'JV 8+', size: 8, athletes: women },
  ];
}

function makeResults({ boat1Id, boat2Id, runIdx, swap }) {
  // Base times with small variation; when swap=true, varsity is slightly faster, JV slightly slower
  const elapsed1 = 340000 + runIdx * 2500 + (swap ? -3500 : 0);
  const elapsed2 = 350000 + runIdx * 2800 + (swap ? +2000 : 0);

  const ordered = [
    { boatId: boat1Id, boatName: 'Varsity 8+', elapsed: elapsed1 },
    { boatId: boat2Id, boatName: 'JV 8+', elapsed: elapsed2 },
  ].sort((a, b) => a.elapsed - b.elapsed);

  return ordered.map((b, idx) => ({
    boatId: b.boatId,
    boatName: b.boatName,
    placement: idx + 1,
    elapsed: b.elapsed,
    finishTime: null,
  }));
}

function generateDummySessions({ days = 45, runsPerDay = 4 } = {}) {
  const out = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - dayOffset);
    const dateStr = isoDateLocal(dayDate);

    const workoutId = generateId();
    const boat1Id = generateId();
    const boat2Id = generateId();

    for (let runIdx = 0; runIdx < runsPerDay; runIdx++) {
      const swap = runIdx > 0 && runIdx % 2 === 1;
      const publishedAt = new Date(`${dateStr}T${timeForRun(runIdx)}:00`).getTime();

      out.push({
        id: generateId(),
        lineupId: generateId(),
        workoutId,
        title: `Practice Pieces · Run ${runIdx + 1}`,
        date: dateStr,
        time: timeForRun(runIdx),
        publishedAt,
        note: swap ? 'Seat swap test' : 'Baseline piece',
        boats: makeBoats({ boat1Id, boat2Id, swap }),
        results: {
          workoutId,
          completedAt: publishedAt + 12 * 60 * 1000,
          boats: makeResults({ boat1Id, boat2Id, runIdx, swap }),
        },
      });
    }
  }

  return out.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
}

export const DUMMY_SESSIONS = generateDummySessions({ days: 45, runsPerDay: 4 });
