const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const HOUR_START = 9;
export const HOUR_END = 22;

export function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function getWeekStart(d) {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return date;
}

export function formatWeekLabel(start) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  if (start.getMonth() === end.getMonth())
    return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
  return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
}

export function isPast(day, hour) {
  const now = new Date();
  const today = new Date(); today.setHours(0,0,0,0);
  if (day < today) return true;
  if (isoDate(day) === isoDate(now) && hour <= now.getHours()) return true;
  return false;
}

/**
 * Renders the calendar grid into gridEl.
 * Selection state (the 'selected' CSS class) is NOT set here — the caller
 * manages it separately via updateCellSelection() for efficient drag updates.
 *
 * @param {object} opts
 * @param {HTMLElement} opts.gridEl         - The grid container element
 * @param {HTMLElement|null} opts.labelEl   - Week label element (textContent is updated)
 * @param {Date} opts.weekStart             - Monday that starts the displayed week
 * @param {object} opts.space               - Space data with .unavailable map
 * @param {Object.<string,Set<number>>} [opts.pendingLookup] - Pending booking hours by date
 */
export function renderCalendarGrid({ gridEl, labelEl, weekStart, space, pendingLookup = {} }) {
  gridEl.innerHTML = '';

  const today = new Date(); today.setHours(0,0,0,0);
  const todayStr = isoDate(today);
  const days = Array.from({length: 7}, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  if (labelEl) labelEl.textContent = formatWeekLabel(weekStart);

  const corner = document.createElement('div');
  corner.className = 'cal-corner';
  gridEl.appendChild(corner);

  days.forEach(day => {
    const el = document.createElement('div');
    el.className = 'cal-day-header' + (isoDate(day) === todayStr ? ' today' : '');
    el.textContent = `${DAY_NAMES[day.getDay()]} ${day.getDate()}`;
    gridEl.appendChild(el);
  });

  for (let h = HOUR_START; h <= HOUR_END; h++) {
    const isLastRow = h === HOUR_END;

    const timeEl = document.createElement('div');
    timeEl.className = 'cal-time-label' + (isLastRow ? ' cal-row-last' : '');
    timeEl.textContent = `${String(h).padStart(2,'0')}:00`;
    gridEl.appendChild(timeEl);

    days.forEach(day => {
      const dateStr = isoDate(day);
      const blocked = (space?.unavailable?.[dateStr] ?? []).includes(h);
      const pending = !blocked && (pendingLookup[dateStr]?.has(h) ?? false);
      const past    = !blocked && !pending && isPast(day, h);

      const cell = document.createElement('div');
      cell.className = 'cal-cell' + (isLastRow ? ' cal-row-last' : '');
      cell.dataset.date = dateStr;
      cell.dataset.hour = String(h);

      if (blocked)      cell.classList.add('blocked');
      else if (pending) cell.classList.add('pending');
      else if (past)    cell.classList.add('past');

      gridEl.appendChild(cell);
    });
  }
}
