// ============================================================================
// Local-day boundaries for "today" / "this week" counters.
//
// activity_log.ts is stored in UTC (SQLite datetime('now')). If we compare it to
// date('now') — also UTC — the "day" rolls over at UTC midnight, not the family's
// local midnight. For a Pacific family that means today's question count silently
// drops to 0 every evening once it passes UTC midnight (5pm PDT / 4pm PST), even
// though it's still the same day where they live. That was the "Margaux did 90,
// now it says 0" bug.
//
// This module computes the family's local-day window as concrete UTC instants
// (DST-correct, because we use the zone's actual offset at "now" rather than a
// fixed offset) and formats them as 'YYYY-MM-DD HH:MM:SS' strings that compare
// directly against the stored UTC ts via plain string comparison.
// ============================================================================

// The business is based in Nevada (Pacific). Until a family's browser reports its
// real zone, default to Pacific so US families — and the founders — are correct.
const DEFAULT_TZ = process.env.APP_DEFAULT_TZ || 'America/Los_Angeles';

// Minutes east of UTC for `zone` at the instant `date`. Positive = ahead of UTC.
function zoneOffsetMinutes(zone, date) {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const p = dtf.formatToParts(date).reduce((a, x) => { a[x.type] = x.value; return a; }, {});
    let hour = parseInt(p.hour, 10); if (hour === 24) hour = 0; // some engines emit '24'
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, hour, +p.minute, +p.second);
    return Math.round((asUTC - date.getTime()) / 60000);
  } catch (e) { return 0; } // unknown zone → treat as UTC
}

function toSqlUTC(ms) {
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
}

// Validate an IANA zone name; fall back to the default if it's missing/bogus.
function normalizeZone(tz) {
  if (!tz || typeof tz !== 'string') return DEFAULT_TZ;
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return tz; }
  catch (e) { return DEFAULT_TZ; }
}

// Returns UTC boundary strings for the family's local day/week:
//   todayStart  — local midnight today (inclusive)
//   tomorrowStart — local midnight tomorrow (exclusive upper bound for "today")
//   weekStart   — local midnight 6 days before today (so the 7-day window includes today)
function dayWindow(tz) {
  const zone = normalizeZone(tz);
  const now = new Date();
  const off = zoneOffsetMinutes(zone, now);              // minutes east of UTC
  const localMs = now.getTime() + off * 60000;           // wall-clock ms in the family's zone
  const localMidnight = Math.floor(localMs / 86400000) * 86400000; // local midnight, in "local ms"
  const todayStartMs = localMidnight - off * 60000;       // back to a real UTC instant
  return {
    zone,
    todayStart: toSqlUTC(todayStartMs),
    tomorrowStart: toSqlUTC(todayStartMs + 86400000),
    weekStart: toSqlUTC(todayStartMs - 6 * 86400000)
  };
}

// The UTC instant of 23:59:59.999 *local* time on `dateStr` (YYYY-MM-DD) in zone `tz`.
// Used to turn a date-only trial expiry into "the end of that day where the family lives"
// rather than UTC midnight — so a Pacific parent told the trial ends today keeps access
// until 11:59 PM their time, not 5 PM (UTC end-of-day). DST-correct: we use the zone's
// actual offset around that evening. Returns NaN if dateStr isn't a bare date.
function endOfLocalDayMs(dateStr, tz) {
  const zone = normalizeZone(tz);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr || '').trim());
  if (!m) return NaN;
  const wallUTC = Date.UTC(+m[1], +m[2] - 1, +m[3], 23, 59, 59, 999); // wall-clock read as UTC
  const off = zoneOffsetMinutes(zone, new Date(wallUTC));             // minutes east of UTC that evening
  return wallUTC - off * 60000;                                       // → the real UTC instant
}

module.exports = { DEFAULT_TZ, dayWindow, normalizeZone, zoneOffsetMinutes, endOfLocalDayMs };
