// Demo seed data — loaded when a demo account signs in (team_id === 'demo-team-1')
// 30 sessions across Oct 2025 – Apr 2026, showing realistic season progression.

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

function a(id) { return DEMO_ATHLETES.find((x) => x.id === id); }
function crew(ids, startSeat = 1) { return ids.map((id, i) => ({ ...a(id), seatNum: startSeat + i })); }
function ms(seconds) { return seconds * 1000; }
function ft(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}.0`;
}

const B1 = 'demo-v8';   // Varsity 8+
const B2 = 'demo-jv8';  // JV 8+
const B3 = 'demo-v4';   // Varsity 4+

// Varsity 8+ core: da-01,02,03,04,05,06,07,08 (with occasional rotations)
// JV 8+ core:      da-09,10,11,12,13,14,15,16
// Varsity 4+:      rotating 4-person lineups

export const DEMO_PUBLISHED_LINEUPS = [

  // ═══════════════════════════════════════════════════
  // OCTOBER 2025 — Fall season begins, slower base times
  // ═══════════════════════════════════════════════════

  {
    id: 'dl-oct-1',
    title: 'Fall Time Trial 1',
    date: '2025-10-06',
    time: '07:00',
    note: 'First timed piece of fall season. Assess baseline fitness.',
    publishedAt: new Date('2025-10-06T06:45:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2025-10-06T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(392), placement: 1, finishTime: ft(392) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(408), placement: 2, finishTime: ft(408) },
      ],
    },
  },

  {
    id: 'dl-oct-2',
    title: 'Steady State Piece',
    date: '2025-10-10',
    time: '06:30',
    note: '4k at 18spm. Heart-rate capped at 160.',
    publishedAt: new Date('2025-10-10T06:20:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-13','da-08']) },
      { id: B3, name: 'Varsity 4+', size: 4, athletes: crew(['da-07','da-10','da-15','da-12']) },
    ],
    results: {
      completedAt: new Date('2025-10-10T08:00:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(388), placement: 1, finishTime: ft(388) },
        { boatId: B3, boatName: 'Varsity 4+', elapsed: ms(414), placement: 1, finishTime: ft(414) },
      ],
    },
  },

  {
    id: 'dl-oct-3',
    title: 'Ergometer Test — Oct',
    date: '2025-10-14',
    time: '06:00',
    note: '2k erg test. Full effort.',
    publishedAt: new Date('2025-10-14T05:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-16','da-11','da-12','da-13','da-14','da-15','da-10']) },
    ],
    results: {
      completedAt: new Date('2025-10-14T07:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(385), placement: 1, finishTime: ft(385) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(401), placement: 2, finishTime: ft(401) },
      ],
    },
  },

  {
    id: 'dl-oct-4',
    title: 'Seat Racing — Oct',
    date: '2025-10-20',
    time: '07:30',
    note: 'Swapping athletes between boats to evaluate placement.',
    publishedAt: new Date('2025-10-20T07:20:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-15','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-03','da-16']) },
    ],
    results: {
      completedAt: new Date('2025-10-20T09:00:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(381), placement: 1, finishTime: ft(381) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(398), placement: 2, finishTime: ft(398) },
      ],
    },
  },

  {
    id: 'dl-oct-5',
    title: 'Fall Scrimmage',
    date: '2025-10-27',
    time: '07:00',
    note: 'Three-boat scrimmage. Best effort from all crews.',
    publishedAt: new Date('2025-10-27T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
      { id: B3, name: 'Varsity 4+', size: 4, athletes: crew(['da-03','da-10','da-11','da-14']) },
    ],
    results: {
      completedAt: new Date('2025-10-27T08:45:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(383), placement: 1, finishTime: ft(383) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(399), placement: 2, finishTime: ft(399) },
        { boatId: B3, boatName: 'Varsity 4+', elapsed: ms(410), placement: 3, finishTime: ft(410) },
      ],
    },
  },

  // ═══════════════════════════════════════════════════
  // NOVEMBER 2025 — Building base, improving consistency
  // ═══════════════════════════════════════════════════

  {
    id: 'dl-nov-1',
    title: '6k Endurance Piece',
    date: '2025-11-03',
    time: '07:00',
    note: 'Long 6k at steady state. Focus on ratio and posture.',
    publishedAt: new Date('2025-11-03T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2025-11-03T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(376), placement: 1, finishTime: ft(376) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(393), placement: 2, finishTime: ft(393) },
      ],
    },
  },

  {
    id: 'dl-nov-2',
    title: 'November Time Trial',
    date: '2025-11-10',
    time: '07:30',
    note: 'Monthly benchmark piece. Comparing vs October.',
    publishedAt: new Date('2025-11-10T07:20:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-13','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-05','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2025-11-10T09:00:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(372), placement: 1, finishTime: ft(372) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(389), placement: 2, finishTime: ft(389) },
      ],
    },
  },

  {
    id: 'dl-nov-3',
    title: 'Mixed Lineup Practice',
    date: '2025-11-17',
    time: '07:00',
    note: 'Testing new combinations. Varsity 7 moved to JV stroke.',
    publishedAt: new Date('2025-11-17T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-14','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-10','da-16','da-11','da-12','da-13','da-06','da-15','da-09']) },
    ],
    results: {
      completedAt: new Date('2025-11-17T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(378), placement: 1, finishTime: ft(378) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(394), placement: 2, finishTime: ft(394) },
      ],
    },
  },

  {
    id: 'dl-nov-4',
    title: 'Pre-Winter Sprint Test',
    date: '2025-11-21',
    time: '06:30',
    note: '500m sprint pieces x4. Recovery between pieces.',
    publishedAt: new Date('2025-11-21T06:20:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B3, name: 'Varsity 4+', size: 4, athletes: crew(['da-09','da-12','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2025-11-21T07:45:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(370), placement: 1, finishTime: ft(370) },
        { boatId: B3, boatName: 'Varsity 4+', elapsed: ms(396), placement: 1, finishTime: ft(396) },
      ],
    },
  },

  {
    id: 'dl-nov-5',
    title: 'Closing Sprint — Nov',
    date: '2025-11-25',
    time: '07:00',
    note: 'Last session before Thanksgiving break.',
    publishedAt: new Date('2025-11-25T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-16']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-08']) },
    ],
    results: {
      completedAt: new Date('2025-11-25T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(373), placement: 1, finishTime: ft(373) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(388), placement: 2, finishTime: ft(388) },
      ],
    },
  },

  // ═══════════════════════════════════════════════════
  // DECEMBER 2025 — Winter training block
  // ═══════════════════════════════════════════════════

  {
    id: 'dl-dec-1',
    title: 'Winter Block 1',
    date: '2025-12-01',
    time: '07:00',
    note: 'Start of winter training. High volume, low rate.',
    publishedAt: new Date('2025-12-01T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2025-12-01T08:45:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(366), placement: 1, finishTime: ft(366) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(382), placement: 2, finishTime: ft(382) },
      ],
    },
  },

  {
    id: 'dl-dec-2',
    title: 'Winter Block 2',
    date: '2025-12-08',
    time: '07:00',
    note: 'Race-pace 3k piece. Rate cap 28.',
    publishedAt: new Date('2025-12-08T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-15','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-03','da-16']) },
    ],
    results: {
      completedAt: new Date('2025-12-08T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(368), placement: 1, finishTime: ft(368) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(384), placement: 2, finishTime: ft(384) },
      ],
    },
  },

  {
    id: 'dl-dec-3',
    title: 'Winter Championships Test',
    date: '2025-12-15',
    time: '06:00',
    note: 'End-of-semester benchmark. All-out 2k.',
    publishedAt: new Date('2025-12-15T05:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2025-12-15T07:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(363), placement: 1, finishTime: ft(363) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(380), placement: 2, finishTime: ft(380) },
      ],
    },
  },

  // ═══════════════════════════════════════════════════
  // JANUARY 2026 — New year, new intensity
  // ═══════════════════════════════════════════════════

  {
    id: 'dl-jan-1',
    title: 'Winter Opener',
    date: '2026-01-06',
    time: '07:00',
    note: 'First water session of the new year. Focus on blade work.',
    publishedAt: new Date('2026-01-06T06:45:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B3, name: 'Varsity 4+', size: 4, athletes: crew(['da-09','da-10','da-11','da-12']) },
    ],
    results: {
      completedAt: new Date('2026-01-06T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(360), placement: 1, finishTime: ft(360) },
        { boatId: B3, boatName: 'Varsity 4+', elapsed: ms(386), placement: 1, finishTime: ft(386) },
      ],
    },
  },

  {
    id: 'dl-jan-2',
    title: 'Endurance Block',
    date: '2026-01-13',
    time: '07:00',
    note: '6k piece. Steady state, no sprint finish.',
    publishedAt: new Date('2026-01-13T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-03','da-05','da-07','da-09','da-11','da-13','da-15']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-02','da-04','da-06','da-08','da-10','da-12','da-14','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-01-13T08:45:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(357), placement: 1, finishTime: ft(357) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(374), placement: 2, finishTime: ft(374) },
      ],
    },
  },

  {
    id: 'dl-jan-3',
    title: 'Mid-Winter Time Trial',
    date: '2026-01-20',
    time: '07:30',
    note: 'Checking fitness gains from winter block.',
    publishedAt: new Date('2026-01-20T07:20:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-01-20T09:00:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(361), placement: 1, finishTime: ft(361) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(377), placement: 2, finishTime: ft(377) },
      ],
    },
  },

  {
    id: 'dl-jan-4',
    title: 'Seat Racing Day',
    date: '2026-01-27',
    time: '08:00',
    note: 'Seat racing to determine Spring lineup.',
    publishedAt: new Date('2026-01-27T07:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-07','da-15','da-03','da-09','da-05','da-13']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-10','da-04','da-16','da-08','da-06','da-12','da-14','da-11']) },
    ],
    results: {
      completedAt: new Date('2026-01-27T09:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(354), placement: 1, finishTime: ft(354) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(371), placement: 2, finishTime: ft(371) },
      ],
    },
  },

  {
    id: 'dl-jan-5',
    title: 'Sprint Piece — Jan',
    date: '2026-01-31',
    time: '06:30',
    note: '1k sprint, best time counts for selection.',
    publishedAt: new Date('2026-01-31T06:20:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B3, name: 'Varsity 4+', size: 4, athletes: crew(['da-10','da-13','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-01-31T07:45:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(358), placement: 1, finishTime: ft(358) },
        { boatId: B3, boatName: 'Varsity 4+', elapsed: ms(381), placement: 1, finishTime: ft(381) },
      ],
    },
  },

  // ═══════════════════════════════════════════════════
  // FEBRUARY 2026 — Spring race prep begins
  // ═══════════════════════════════════════════════════

  {
    id: 'dl-feb-1',
    title: 'Fitness Test',
    date: '2026-02-03',
    time: '06:30',
    note: '2k test piece. All-out effort.',
    publishedAt: new Date('2026-02-03T06:20:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-13','da-14','da-07','da-08']) },
      { id: B3, name: 'Varsity 4+', size: 4, athletes: crew(['da-05','da-10','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-02-03T08:00:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(350), placement: 1, finishTime: ft(350) },
        { boatId: B3, boatName: 'Varsity 4+', elapsed: ms(376), placement: 1, finishTime: ft(376) },
      ],
    },
  },

  {
    id: 'dl-feb-2',
    title: 'Race Prep Piece',
    date: '2026-02-10',
    time: '07:00',
    note: 'Race simulation with standing start.',
    publishedAt: new Date('2026-02-10T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-02-10T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(352), placement: 1, finishTime: ft(352) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(369), placement: 2, finishTime: ft(369) },
      ],
    },
  },

  {
    id: 'dl-feb-3',
    title: 'Inter-Squad Race',
    date: '2026-02-17',
    time: '07:30',
    note: 'A vs B crew. Racing intensity all the way.',
    publishedAt: new Date('2026-02-17T07:20:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-02-17T09:00:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(348), placement: 1, finishTime: ft(348) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(365), placement: 2, finishTime: ft(365) },
      ],
    },
  },

  {
    id: 'dl-feb-4',
    title: 'Pre-Season Qualifier',
    date: '2026-02-24',
    time: '07:00',
    note: 'Final seat selection before spring racing begins.',
    publishedAt: new Date('2026-02-24T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-15','da-04','da-09','da-06','da-13','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-03','da-10','da-05','da-12','da-07','da-14','da-11','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-02-24T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(345), placement: 1, finishTime: ft(345) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(362), placement: 2, finishTime: ft(362) },
      ],
    },
  },

  // ═══════════════════════════════════════════════════
  // MARCH 2026 — Spring racing season
  // ═══════════════════════════════════════════════════

  {
    id: 'dl-mar-1',
    title: 'Spring Opener',
    date: '2026-03-03',
    time: '07:00',
    note: 'First race of spring season. Clean water conditions.',
    publishedAt: new Date('2026-03-03T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-03-03T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(343), placement: 1, finishTime: ft(343) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(360), placement: 2, finishTime: ft(360) },
      ],
    },
  },

  {
    id: 'dl-mar-2',
    title: 'Spring Time Trial',
    date: '2026-03-10',
    time: '07:00',
    note: 'Mid-month benchmark. Season best attempt.',
    publishedAt: new Date('2026-03-10T06:45:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B3, name: 'Varsity 4+', size: 4, athletes: crew(['da-09','da-10','da-11','da-12']) },
    ],
    results: {
      completedAt: new Date('2026-03-10T08:20:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(340), placement: 1, finishTime: ft(340) },
        { boatId: B3, boatName: 'Varsity 4+', elapsed: ms(365), placement: 1, finishTime: ft(365) },
      ],
    },
  },

  {
    id: 'dl-mar-3',
    title: 'Scrimmage vs. Pacific',
    date: '2026-03-17',
    time: '07:30',
    note: 'Mixed lineup to test new combinations.',
    publishedAt: new Date('2026-03-17T07:15:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-13','da-04','da-05','da-14','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-03','da-10','da-11','da-06','da-09','da-12','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-03-17T09:00:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(337), placement: 1, finishTime: ft(337) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(354), placement: 2, finishTime: ft(354) },
      ],
    },
  },

  {
    id: 'dl-mar-4',
    title: 'Practice Race',
    date: '2026-03-24',
    time: '07:00',
    note: 'Internal race. Top 8 vs development crew.',
    publishedAt: new Date('2026-03-24T06:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-13','da-08']) },
      { id: B3, name: 'Varsity 4+', size: 4, athletes: crew(['da-07','da-14','da-11','da-12']) },
    ],
    results: {
      completedAt: new Date('2026-03-24T08:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(339), placement: 1, finishTime: ft(339) },
        { boatId: B3, boatName: 'Varsity 4+', elapsed: ms(363), placement: 1, finishTime: ft(363) },
      ],
    },
  },

  {
    id: 'dl-mar-5',
    title: 'Morning Erg Test',
    date: '2026-03-28',
    time: '06:00',
    note: '2k erg test. Results used for seat racing.',
    publishedAt: new Date('2026-03-28T05:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-13','da-03','da-04','da-15','da-06','da-07','da-16']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-05','da-02','da-14','da-10','da-09','da-12','da-11','da-08']) },
    ],
    results: {
      completedAt: new Date('2026-03-28T07:15:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(334), placement: 1, finishTime: ft(334) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(351), placement: 2, finishTime: ft(351) },
      ],
    },
  },

  // ═══════════════════════════════════════════════════
  // APRIL 2026 — Championship season
  // ═══════════════════════════════════════════════════

  {
    id: 'dl-apr-1',
    title: 'Championship Qualifier',
    date: '2026-04-05',
    time: '08:00',
    note: 'Selection race for regionals. Everything on the line.',
    publishedAt: new Date('2026-04-05T07:50:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: {
      completedAt: new Date('2026-04-05T09:30:00').getTime(),
      boats: [
        { boatId: B1, boatName: 'Varsity 8+', elapsed: ms(331), placement: 1, finishTime: ft(331) },
        { boatId: B2, boatName: 'JV 8+',      elapsed: ms(348), placement: 2, finishTime: ft(348) },
      ],
    },
  },

  // ── Upcoming: Spring Regatta — no results yet ──
  {
    id: 'dl-apr-2',
    title: 'Spring Regatta',
    date: '2026-04-12',
    time: '08:00',
    note: 'Regional championship. All crews competing.',
    publishedAt: new Date('2026-04-08T10:00:00').getTime(),
    boats: [
      { id: B1, name: 'Varsity 8+', size: 8, athletes: crew(['da-01','da-02','da-03','da-04','da-05','da-06','da-07','da-08']) },
      { id: B2, name: 'JV 8+',      size: 8, athletes: crew(['da-09','da-10','da-11','da-12','da-13','da-14','da-15','da-16']) },
    ],
    results: null,
  },
];
