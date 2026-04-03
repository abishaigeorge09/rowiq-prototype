// Demo seed data — loaded when a demo account signs in (team_id === 'demo-team-1')
// Provides a rich, realistic dataset to showcase all features.

export const DEMO_ATHLETES = [
  { id: 'da-01', name: 'Alex Johnson',   email: 'alex.j@crew.edu',    position: 'Stroke', initials: 'AJ', colorIndex: 0 },
  { id: 'da-02', name: 'Bella Martinez', email: 'bella.m@crew.edu',   position: 'Stroke', initials: 'BM', colorIndex: 1 },
  { id: 'da-03', name: 'Chris Park',     email: 'chris.p@crew.edu',   position: 'Mid',    initials: 'CP', colorIndex: 2 },
  { id: 'da-04', name: 'Dana Williams',  email: 'dana.w@crew.edu',    position: 'Mid',    initials: 'DW', colorIndex: 3 },
  { id: 'da-05', name: 'Eli Thompson',   email: 'eli.t@crew.edu',     position: 'Mid',    initials: 'ET', colorIndex: 4 },
  { id: 'da-06', name: 'Fiona Chen',     email: 'fiona.c@crew.edu',   position: 'Bow',    initials: 'FC', colorIndex: 5 },
  { id: 'da-07', name: 'Gabe Rivera',    email: 'gabe.r@crew.edu',    position: 'Stroke', initials: 'GR', colorIndex: 6 },
  { id: 'da-08', name: 'Hannah Lee',     email: 'hannah.l@crew.edu',  position: 'Bow',    initials: 'HL', colorIndex: 7 },
  { id: 'da-09', name: 'Ivan Cruz',      email: 'ivan.c@crew.edu',    position: 'Mid',    initials: 'IC', colorIndex: 8 },
  { id: 'da-10', name: 'Julia Santos',   email: 'julia.s@crew.edu',   position: 'Stroke', initials: 'JS', colorIndex: 9 },
  { id: 'da-11', name: 'Kevin Marsh',    email: 'kevin.m@crew.edu',   position: 'Mid',    initials: 'KM', colorIndex: 10 },
  { id: 'da-12', name: 'Laura Ngo',      email: 'laura.n@crew.edu',   position: 'Bow',    initials: 'LN', colorIndex: 11 },
  { id: 'da-13', name: 'Marcus Webb',    email: 'marcus.w@crew.edu',  position: 'Mid',    initials: 'MW', colorIndex: 12 },
  { id: 'da-14', name: 'Nina Torres',    email: 'nina.t@crew.edu',    position: 'Bow',    initials: 'NT', colorIndex: 13 },
  { id: 'da-15', name: 'Owen Blake',     email: 'owen.b@crew.edu',    position: 'Stroke', initials: 'OB', colorIndex: 14 },
  { id: 'da-16', name: 'Priya Shah',     email: 'priya.s@crew.edu',   position: 'Mid',    initials: 'PS', colorIndex: 15 },
];

function a(id) {
  return DEMO_ATHLETES.find((x) => x.id === id);
}

function crew(ids, startSeat = 1) {
  return ids.map((id, i) => ({ ...a(id), seatNum: startSeat + i }));
}

// Stable boat IDs
const B1 = 'demo-boat-shell1';
const B2 = 'demo-boat-shell2';
const B3 = 'demo-boat-shell3';

export const DEMO_PUBLISHED_LINEUPS = [
  // ── Session 1: Winter Opener — Jan 6, completed ──
  {
    id: 'demo-lineup-w1',
    title: 'Winter Opener',
    date: '2026-01-06',
    time: '07:00',
    note: 'First water session of the new year. Focus on blade work.',
    publishedAt: new Date('2026-01-06T06:45:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B3, name: 'Shell 3', size: 4, athletes: crew(['da-09','da-10','da-11','da-12']) },
    ],
    results: {
      completedAt: new Date('2026-01-06T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Shell 1', elapsed: 438000, placement: 1, finishTime: '7:18.0' },
        { boatId: B3, boatName: 'Shell 3', elapsed: 465200, placement: 1, finishTime: '7:45.2' },
      ],
    },
  },

  // ── Session 2: Endurance Block — Jan 13, completed ──
  {
    id: 'demo-lineup-w2',
    title: 'Endurance Block',
    date: '2026-01-13',
    time: '07:00',
    note: '6k piece. Steady state, no sprint finish.',
    publishedAt: new Date('2026-01-13T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-03','da-05','da-07','da-09','da-11','da-13','da-15']) },
      { id: B2, name: 'Shell 2', size: 8, athletes: crew(['da-02','da-04','da-06','da-08','da-10','da-12','da-14','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-01-13T08:45:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Shell 1', elapsed: 428500, placement: 1, finishTime: '7:08.5' },
        { boatId: B2, boatName: 'Shell 2', elapsed: 442800, placement: 2, finishTime: '7:22.8' },
      ],
    },
  },

  // ── Session 3: Seat Racing Day — Jan 27, completed ──
  {
    id: 'demo-lineup-w3',
    title: 'Seat Racing Day',
    date: '2026-01-27',
    time: '08:00',
    note: 'Seat racing to determine Shell 1 lineup for spring.',
    publishedAt: new Date('2026-01-27T07:50:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-02','da-07','da-15','da-03','da-09','da-05','da-13']) },
      { id: B2, name: 'Shell 2', size: 8, athletes: crew(['da-10','da-04','da-16','da-08','da-06','da-12','da-14','da-11']) },
    ],
    results: {
      completedAt: new Date('2026-01-27T09:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Shell 1', elapsed: 418200, placement: 1, finishTime: '6:58.2' },
        { boatId: B2, boatName: 'Shell 2', elapsed: 432400, placement: 2, finishTime: '7:12.4' },
      ],
    },
  },

  // ── Session 4: Fitness Test — Feb 3, completed ──
  {
    id: 'demo-lineup-w4',
    title: 'Fitness Test',
    date: '2026-02-03',
    time: '06:30',
    note: '2k test piece. All-out effort.',
    publishedAt: new Date('2026-02-03T06:20:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-13','da-14','da-07','da-08']) },
      { id: B3, name: 'Shell 3', size: 4, athletes: crew(['da-05','da-10','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-02-03T08:00:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Shell 1', elapsed: 412600, placement: 1, finishTime: '6:52.6' },
        { boatId: B3, boatName: 'Shell 3', elapsed: 428300, placement: 1, finishTime: '7:08.3' },
      ],
    },
  },

  // ── Session 5: Inter-Squad Race — Feb 17, completed ──
  {
    id: 'demo-lineup-w5',
    title: 'Inter-Squad Race',
    date: '2026-02-17',
    time: '07:30',
    note: 'A vs B crew. Racing intensity all the way.',
    publishedAt: new Date('2026-02-17T07:20:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'Shell 2', size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-02-17T09:00:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Shell 1', elapsed: 404100, placement: 1, finishTime: '6:44.1' },
        { boatId: B2, boatName: 'Shell 2', elapsed: 418800, placement: 2, finishTime: '6:58.8' },
      ],
    },
  },

  // ── Session 6: Pre-Season Qualifier — Feb 24, completed ──
  {
    id: 'demo-lineup-w6',
    title: 'Pre-Season Qualifier',
    date: '2026-02-24',
    time: '07:00',
    note: 'Final seat selection before spring racing begins.',
    publishedAt: new Date('2026-02-24T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-02','da-15','da-04','da-09','da-06','da-13','da-08']) },
      { id: B2, name: 'Shell 2', size: 8, athletes: crew(['da-03','da-10','da-05','da-12','da-07','da-14','da-11','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-02-24T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Shell 1', elapsed: 398800, placement: 1, finishTime: '6:38.8' },
        { boatId: B2, boatName: 'Shell 2', elapsed: 411200, placement: 2, finishTime: '6:51.2' },
      ],
    },
  },

  // ── Session 7: Spring Time Trial — Mar 10, completed ──
  {
    id: 'demo-lineup-1',
    title: 'Spring Time Trial',
    date: '2026-03-10',
    time: '07:00',
    note: 'First race of the season. Focus on clean catches.',
    publishedAt: new Date('2026-03-10T06:45:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B3, name: 'Shell 3', size: 4, athletes: crew(['da-09','da-10','da-11','da-12']) },
    ],
    results: {
      completedAt: new Date('2026-03-10T08:20:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Shell 1', elapsed: 362400, placement: 1, finishTime: '6:02.4' },
        { boatId: B3, boatName: 'Shell 3', elapsed: 384600, placement: 1, finishTime: '6:24.6' },
      ],
    },
  },

  // ── Session 8: Scrimmage vs. Pacific — Mar 17, completed ──
  {
    id: 'demo-lineup-2',
    title: 'Scrimmage vs. Pacific',
    date: '2026-03-17',
    time: '07:30',
    note: 'Mixed lineup to test new combinations.',
    publishedAt: new Date('2026-03-17T07:15:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-02','da-13','da-04','da-05','da-14','da-07','da-08']) },
      { id: B2, name: 'Shell 2', size: 8, athletes: crew(['da-03','da-10','da-11','da-06','da-09','da-12','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-03-17T09:00:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Shell 1', elapsed: 358200, placement: 1, finishTime: '5:58.2' },
        { boatId: B2, boatName: 'Shell 2', elapsed: 371400, placement: 2, finishTime: '6:11.4' },
      ],
    },
  },

  // ── Session 9: Practice Race — Mar 24, completed ──
  {
    id: 'demo-lineup-3',
    title: 'Practice Race',
    date: '2026-03-24',
    time: '07:00',
    note: 'Internal race. Top 8 vs development 4.',
    publishedAt: new Date('2026-03-24T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-13','da-08']) },
      { id: B3, name: 'Shell 3', size: 4, athletes: crew(['da-07','da-14','da-11','da-12']) },
    ],
    results: {
      completedAt: new Date('2026-03-24T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Shell 1', elapsed: 355800, placement: 1, finishTime: '5:55.8' },
        { boatId: B3, boatName: 'Shell 3', elapsed: 368400, placement: 1, finishTime: '6:08.4' },
      ],
    },
  },

  // ── Session 10: Morning Erg Test — Mar 28, completed ──
  {
    id: 'demo-lineup-4',
    title: 'Morning Erg Test',
    date: '2026-03-28',
    time: '06:00',
    note: '2k erg test. Results used for seat racing.',
    publishedAt: new Date('2026-03-28T05:50:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-13','da-03','da-04','da-15','da-06','da-07','da-16']) },
      { id: B2, name: 'Shell 2', size: 8, athletes: crew(['da-05','da-02','da-14','da-10','da-09','da-12','da-11','da-08']) },
    ],
    results: {
      completedAt: new Date('2026-03-28T07:15:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Shell 1', elapsed: 351000, placement: 1, finishTime: '5:51.0' },
        { boatId: B2, boatName: 'Shell 2', elapsed: 363600, placement: 2, finishTime: '6:03.6' },
      ],
    },
  },

  // ── Lineup 11: Championship Qualifier — upcoming, no results ──
  {
    id: 'demo-lineup-5',
    title: 'Championship Qualifier',
    date: '2026-04-05',
    time: '08:00',
    note: 'Selection race for regionals. Give it everything.',
    publishedAt: new Date('2026-03-31T09:00:00').getTime(),
    boats: [
      { id: B1, name: 'Shell 1', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-13','da-08']) },
      { id: B2, name: 'Shell 2', size: 8, athletes: crew(['da-07','da-14','da-11','da-12','da-09','da-10','da-15','da-16']) },
    ],
    results: null,
  },
];
