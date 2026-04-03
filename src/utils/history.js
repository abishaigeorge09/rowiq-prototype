/**
 * Scans all published lineups to find every entry where an athlete appeared.
 * Returns array sorted by publishedAt descending (most recent first).
 */
export function getAthleteHistory(athleteId, publishedLineups) {
  const history = [];

  for (const lineup of publishedLineups) {
    for (const boat of lineup.boats) {
      const seat = boat.athletes.find((a) => a.id === athleteId);
      if (seat) {
        // Find results for this boat if the session was completed
        let boatResult = null;
        if (lineup.results) {
          boatResult = lineup.results.boats.find((b) => b.boatId === boat.id) || null;
        }

        history.push({
          lineupId: lineup.id,
          title: lineup.title,
          date: lineup.date,
          time: lineup.time,
          note: lineup.note,
          publishedAt: lineup.publishedAt,
          boatId: boat.id,
          boatName: boat.name,
          seatNum: seat.seatNum,
          crew: boat.athletes,
          results: lineup.results
            ? {
                completedAt: lineup.results.completedAt,
                boatResult,
                allBoats: lineup.results.boats,
              }
            : null,
        });
      }
    }
  }

  // Sort most recent first
  return history.sort((a, b) => b.publishedAt - a.publishedAt);
}

/**
 * Counts how many published lineups had both athleteA and athleteB in the SAME boat.
 */
export function getCrewOverlap(athleteAId, athleteBId, publishedLineups) {
  let count = 0;

  for (const lineup of publishedLineups) {
    for (const boat of lineup.boats) {
      const ids = boat.athletes.map((a) => a.id);
      if (ids.includes(athleteAId) && ids.includes(athleteBId)) {
        count++;
        break; // Only count once per lineup even if somehow in multiple boats
      }
    }
  }

  return count;
}

/**
 * Returns the most recent published lineup (not yet completed) that includes this athlete.
 */
export function getUpcomingSession(athleteId, publishedLineups) {
  const upcoming = publishedLineups
    .filter((l) => !l.results) // not yet completed
    .sort((a, b) => b.publishedAt - a.publishedAt); // most recent first

  for (const lineup of upcoming) {
    for (const boat of lineup.boats) {
      const seat = boat.athletes.find((a) => a.id === athleteId);
      if (seat) {
        return { lineup, boat, seat };
      }
    }
  }

  return null;
}

/**
 * Computes quick stats for an athlete from publishedLineups + sessions.
 */
export function getAthleteStats(athleteId, publishedLineups) {
  const history = getAthleteHistory(athleteId, publishedLineups);
  const totalSessions = history.length;
  const boatNames = new Set(history.map((h) => h.boatName));
  const boatsRowed = boatNames.size;

  let bestFinish = null;
  for (const entry of history) {
    if (entry.results?.boatResult?.placement) {
      const p = entry.results.boatResult.placement;
      if (bestFinish === null || p < bestFinish) {
        bestFinish = p;
      }
    }
  }

  return { totalSessions, boatsRowed, bestFinish };
}

/**
 * Format a date string for display: "Mar 30, 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format placement as ordinal string: 1 → "1st", 2 → "2nd", etc.
 */
export function formatPlacement(p) {
  if (!p) return '—';
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = p % 100;
  return p + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}
