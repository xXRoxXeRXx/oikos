/**
 * Local-date helpers for YYYY-MM-DD values sent to the API.
 * These deliberately use local calendar fields instead of UTC ISO strings.
 */

export function toLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addLocalDays(dateKey, days) {
  const date = parseLocalDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

export function startOfLocalWeekKey(dateKey, weekStartsOn = 1) {
  const date = parseLocalDateKey(dateKey);
  const day = date.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  date.setDate(date.getDate() - diff);
  return toLocalDateKey(date);
}

/**
 * Verschiebt einen End-Datums-Key um dieselbe Tagesdifferenz, um die der Start
 * gewandert ist – so bleibt die Dauer eines Termins erhalten, wenn der Nutzer
 * das Startdatum ändert (analog zum Verhalten von Google Calendar).
 * @param {string} oldStartKey - vorheriges Startdatum (YYYY-MM-DD)
 * @param {string} newStartKey - neues Startdatum (YYYY-MM-DD)
 * @param {string} endKey      - aktuelles Enddatum (YYYY-MM-DD)
 * @returns {string} neues Enddatum (YYYY-MM-DD)
 */
export function shiftEndDateKey(oldStartKey, newStartKey, endKey) {
  const from = parseLocalDateKey(oldStartKey);
  const to = parseLocalDateKey(newStartKey);
  const deltaDays = Math.round((to.getTime() - from.getTime()) / 86400000);
  return addLocalDays(endKey, deltaDays);
}

/**
 * Prüft, ob ein Endzeitpunkt vor dem Startzeitpunkt liegt. Akzeptiert Werte im
 * Format "YYYY-MM-DD" oder "YYYY-MM-DDTHH:MM", wie sie der Termin-Dialog
 * erzeugt – auch gemischt (getimter Start, datumsreines Ende). Das Datum zählt
 * zuerst; die Uhrzeit nur bei gleichem Tag und nur, wenn beide eine Uhrzeit
 * tragen. Ein fehlendes Ende gilt nie als ungültig.
 * @param {string} startDatetime
 * @param {string|null|undefined} endDatetime
 * @returns {boolean}
 */
export function isEndBeforeStart(startDatetime, endDatetime) {
  if (!endDatetime) return false;
  const [startDay, startTime] = String(startDatetime).split('T');
  const [endDay, endTime] = String(endDatetime).split('T');
  if (endDay !== startDay) return endDay < startDay;
  if (startTime && endTime) return endTime < startTime;
  return false;
}
