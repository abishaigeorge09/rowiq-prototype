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

  if (nameIdx === -1) return [];

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    return {
      name: cols[nameIdx] || '',
      email: emailIdx >= 0 ? cols[emailIdx] || '' : '',
      ...(posIdx >= 0 && cols[posIdx] ? { position: cols[posIdx] } : {}),
      ...(seatIdx >= 0 && cols[seatIdx] ? { seat_preference: cols[seatIdx] } : {}),
      ...(classIdx >= 0 && cols[classIdx] ? { boat_class: cols[classIdx] } : {}),
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
