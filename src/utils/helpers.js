export const ROSTER_TEMPLATE_CSV = `name,email,position,oar_side
Alex Johnson,alex@team.edu,Stroke,starboard
Bella Martinez,bella@team.edu,Mid,port
Chris Park,chris@team.edu,Bow,port
Dana White,dana@team.edu,Mid,starboard
Eli Thomas,eli@team.edu,Mid,both
Fiona Chen,fiona@team.edu,Bow,port
Gabe Rivera,gabe@team.edu,Stroke,starboard
Hannah Lee,hannah@team.edu,Bow,port
Ivan Cruz,ivan@team.edu,Mid,port
Julia Santos,julia@team.edu,Stroke,starboard
Kevin Moore,kevin@team.edu,Mid,port
Laura Kim,laura@team.edu,Mid,both
Marcus Brown,marcus@team.edu,Stroke,port
Nina Patel,nina@team.edu,Bow,starboard
Owen Davis,owen@team.edu,Mid,starboard
Priya Nguyen,priya@team.edu,Bow,port
`;

export const SESSIONS_TEMPLATE_CSV = `date,session_title,note,boat_name,placement,finish_time,seat_1,seat_2,seat_3,seat_4,seat_5,seat_6,seat_7,seat_8
2025-10-06,Oct Time Trial 1,Good conditions,Varsity 8+,1,6:10.0,Alex Johnson,Bella Martinez,Chris Park,Dana White,Eli Thomas,Fiona Chen,Gabe Rivera,Hannah Lee
2025-10-06,Oct Time Trial 1,,JV 8+,2,6:28.0,Ivan Cruz,Julia Santos,Kevin Moore,Laura Kim,Marcus Brown,Nina Patel,Owen Davis,Priya Nguyen
2025-10-20,Oct Time Trial 2,,Varsity 8+,1,6:05.5,Alex Johnson,Bella Martinez,Chris Park,Dana White,Eli Thomas,Fiona Chen,Gabe Rivera,Hannah Lee
2025-10-20,Oct Time Trial 2,,JV 8+,2,6:22.0,Ivan Cruz,Julia Santos,Kevin Moore,Laura Kim,Marcus Brown,Nina Patel,Owen Davis,Priya Nguyen
2025-11-03,Seat Race Day,Big improvements,Varsity 4+,1,7:10.0,Alex Johnson,Bella Martinez,Chris Park,Dana White,,,,
2025-11-03,Seat Race Day,,JV 4+,2,7:28.0,Ivan Cruz,Julia Santos,Kevin Moore,Laura Kim,,,,
`;

export const AVATAR_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F97316',
  '#22C55E', '#EF4444', '#06B6D4',
];

export const POSITIONS = ['Stroke', 'Bow', 'Mid', 'Mid', 'Mid', 'Mid', 'Stroke', 'Bow'];

export const SAMPLE_ATHLETES = [
  { name: 'Alex Johnson', email: 'alex.j@crew.edu' },
  { name: 'Bella Martinez', email: 'bella.m@crew.edu' },
  { name: 'Chris Park', email: 'chris.p@crew.edu' },
  { name: 'Dana Williams', email: 'dana.w@crew.edu' },
  { name: 'Eli Thompson', email: 'eli.t@crew.edu' },
  { name: 'Fiona Chen', email: 'fiona.c@crew.edu' },
  { name: 'Gabe Rivera', email: 'gabe.r@crew.edu' },
  { name: 'Hannah Lee', email: 'hannah.l@crew.edu' },
  { name: 'Ian Foster', email: 'ian.f@crew.edu' },
  { name: 'Julia Kim', email: 'julia.k@crew.edu' },
  { name: 'Kyle Davis', email: 'kyle.d@crew.edu' },
  { name: 'Lena Okafor', email: 'lena.o@crew.edu' },
  { name: 'Marco Rossi', email: 'marco.r@crew.edu' },
  { name: 'Nina Patel', email: 'nina.p@crew.edu' },
  { name: 'Oscar Grant', email: 'oscar.g@crew.edu' },
  { name: 'Priya Singh', email: 'priya.s@crew.edu' },
];

let idCounter = 0;
export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${++idCounter}`;
}

export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function formatTimer(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${hh}:${mm}:${ss}.${tenths}`;
}

export function formatTimerShort(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}.${tenths}`;
}

export function formatTimerMs(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

export function parseCSV(text) {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
  const nameIdx = header.findIndex((h) => h.includes('name'));
  const emailIdx = header.findIndex((h) => h.includes('email') || h.includes('mail'));
  const posIdx = header.findIndex((h) => h === 'position' || h === 'pos');
  const seatIdx = header.findIndex((h) => h === 'seat_preference' || h === 'seat');
  const classIdx = header.findIndex((h) => h === 'boat_class' || h === 'class');
  const oarSideIdx = header.findIndex((h) => h === 'oar_side' || h === 'oar side' || h === 'side');

  if (nameIdx === -1) return [];

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const oarRaw = oarSideIdx >= 0 ? cols[oarSideIdx]?.toLowerCase() : '';
    const validOarSides = ['port', 'starboard', 'both'];
    return {
      name: cols[nameIdx] || '',
      email: emailIdx >= 0 ? cols[emailIdx] || '' : '',
      ...(posIdx >= 0 && cols[posIdx] ? { position: cols[posIdx] } : {}),
      ...(seatIdx >= 0 && cols[seatIdx] ? { seat_preference: cols[seatIdx] } : {}),
      ...(classIdx >= 0 && cols[classIdx] ? { boat_class: cols[classIdx] } : {}),
      ...(oarRaw && validOarSides.includes(oarRaw) ? { oarSide: oarRaw } : {}),
    };
  }).filter((a) => a.name);
}

export function createAthlete(name, email, index) {
  return {
    id: generateId(),
    name,
    email,
    position: POSITIONS[index % POSITIONS.length],
    initials: getInitials(name),
    colorIndex: index,
    oarSide: null,
  };
}

export function createBoat(name, size) {
  const seats = [];
  for (let i = 1; i <= size; i++) {
    seats.push({ seatNum: i, athleteId: null });
  }
  return {
    id: generateId(),
    name,
    size,
    seats,
  };
}

export function getAssignedCount(boat) {
  return boat.seats.filter((s) => s.athleteId !== null).length;
}

export function getTotalAssigned(boats) {
  return boats.reduce((sum, b) => sum + getAssignedCount(b), 0);
}

export function finishTimeToMs(timeStr) {
  if (!timeStr) return 0;
  // Handles "6:02.0", "6:02", "6:02.5" → milliseconds
  const [minSecPart, tenthsPart = '0'] = timeStr.split('.');
  const [min, sec] = minSecPart.split(':').map(Number);
  return ((min || 0) * 60 + (sec || 0)) * 1000 + (parseInt(tenthsPart) || 0) * 100;
}

// Parse a sessions CSV (one row per boat per session) into publishedLineup-like objects
export function parseSessionsCSV(text) {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
  const dateIdx = header.findIndex((h) => h === 'date');
  const titleIdx = header.findIndex((h) => h === 'session_title' || h === 'title' || h === 'session');
  const noteIdx = header.findIndex((h) => h === 'note');
  const boatIdx = header.findIndex((h) => h === 'boat_name' || h === 'boat');
  const placementIdx = header.findIndex((h) => h === 'placement');
  const finishIdx = header.findIndex((h) => h === 'finish_time' || h === 'time' || h === 'finish');

  if (dateIdx === -1 || titleIdx === -1) return [];

  // All seat_N columns in order
  const seatCols = header.reduce((acc, h, i) => {
    if (/^seat_\d+$/.test(h)) acc.push(i);
    return acc;
  }, []);

  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    return {
      date: cols[dateIdx] || '',
      title: cols[titleIdx] || '',
      note: noteIdx >= 0 ? (cols[noteIdx] || '') : '',
      boatName: boatIdx >= 0 ? (cols[boatIdx] || 'Boat') : 'Boat',
      placement: placementIdx >= 0 ? (parseInt(cols[placementIdx]) || 1) : 1,
      finishTime: finishIdx >= 0 ? (cols[finishIdx] || '') : '',
      athletes: seatCols.map((i) => cols[i] || '').filter(Boolean),
    };
  }).filter((r) => r.date && r.title);

  // Group by (date + title) → form one lineup per unique session
  const sessionMap = {};
  rows.forEach((row) => {
    const key = `${row.date}__${row.title}`;
    if (!sessionMap[key]) {
      sessionMap[key] = {
        id: generateId(),
        title: row.title,
        date: row.date,
        note: row.note,
        publishedAt: (new Date(row.date).getTime()) || Date.now(),
        boats: [],
        results: { completedAt: Date.now(), boats: [] },
      };
    }
    const boatId = generateId();
    const boatAthletes = row.athletes.map((name, idx) => ({
      id: generateId(),
      name,
      seatNum: idx + 1,
      initials: getInitials(name),
      colorIndex: idx % AVATAR_COLORS.length,
    }));
    sessionMap[key].boats.push({
      id: boatId,
      name: row.boatName,
      size: boatAthletes.length || 8,
      athletes: boatAthletes,
    });
    if (row.finishTime || row.placement) {
      sessionMap[key].results.boats.push({
        boatId,
        boatName: row.boatName,
        elapsed: finishTimeToMs(row.finishTime),
        placement: row.placement,
        finishTime: row.finishTime,
      });
    }
  });

  return Object.values(sessionMap).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function exportCSV(rows, filename) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
