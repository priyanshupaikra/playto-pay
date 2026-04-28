/**
 * Convert paise integer to formatted rupee string.
 * formatPaise(432000) → "₹4,320.00"
 */
export function formatPaise(paise) {
  const rupees = Math.abs(paise) / 100;
  const formatted = rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${paise < 0 ? '-' : ''}₹${formatted}`;
}

/**
 * Format ISO date string to short display.
 * formatDate("2026-04-24T14:32:01Z") → "Apr 24, 14:32"
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month} ${day}, ${hours}:${mins}`;
}

/**
 * Format ISO date string to full display.
 * formatDateFull("2026-04-24T14:32:01Z") → "APR 24, 2026 - 14:32:01 UTC"
 */
export function formatDateFull(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const month = months[d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const mins = String(d.getUTCMinutes()).padStart(2, '0');
  const secs = String(d.getUTCSeconds()).padStart(2, '0');
  return `${month} ${day}, ${year} - ${hours}:${mins}:${secs} UTC`;
}

/**
 * Generate a new UUID v4 idempotency key.
 */
export function generateIdempotencyKey() {
  return crypto.randomUUID();
}

/**
 * Truncate a UUID for display: "550e8400...4001"
 */
export function truncateId(id) {
  if (!id) return '—';
  const s = String(id);
  if (s.length <= 12) return s;
  return `${s.slice(0, 8)}...${s.slice(-4)}`;
}
