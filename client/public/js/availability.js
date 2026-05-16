import { isoDate, getWeekStart, isPast, renderCalendarGrid } from './calendar-grid.js';

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

let space = null;
let weekStart = getWeekStart(new Date());
let selDate = null;
let selStartHour = null;
let selEndHour = null;
let isDragging = false;
let dragDate = null;
let pendingLookup = {};

function getSelHours() {
  if (selDate === null || selStartHour === null || selEndHour === null) return [];
  const min = Math.min(selStartHour, selEndHour);
  const max = Math.max(selStartHour, selEndHour);
  return Array.from({ length: max - min + 1 }, (_, i) => i + min);
}

// ── Space header ──────────────────────────────────────────
function renderSpaceHeader() {
  const el = document.getElementById('spaceHeader');
  const tags = (space.types ?? []).map(t => `<span class="space-tag" style="font-size:0.72rem;">${t}</span>`).join('');
  const lang = localStorage.getItem('lang') || 'en';
  const loc = lang === 'ko' ? space.locationKo : space.locationEn;
  const rate = `₩${space.hourlyRate.toLocaleString()} / hr`;
  const contact = [
    space.contactEmail ? `<a href="mailto:${space.contactEmail}">${space.contactEmail}</a>` : '',
    space.contactPhone ? `<span>${space.contactPhone}</span>` : '',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');

  el.innerHTML = `
    <div class="space-thumb-lg" style="background:${space.thumbColor};">${space.emoji}</div>
    <div class="space-header-info">
      <h1>${space.name}</h1>
      <div class="space-header-meta">
        <span>${loc}</span>
        <span>Capacity: ${space.capacity}</span>
        <span style="color:var(--teal-dark);font-weight:600;">${rate}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.4rem;">${tags}</div>
      ${contact ? `<div class="contact-info">${contact}</div>` : ''}
    </div>
  `;
}

// ── Pending hours ─────────────────────────────────────────
async function loadPendingHours() {
  try {
    const res = await fetch(`/api/bookings/pending-hours?spaceId=${space._id}`);
    if (!res.ok) return;
    const data = await res.json();
    pendingLookup = {};
    for (const [date, hours] of Object.entries(data.pendingHours ?? {})) {
      pendingLookup[date] = new Set(hours);
    }
  } catch { /* non-critical — calendar still works without pending data */ }
}

// ── Calendar ──────────────────────────────────────────────
function renderCalendar() {
  renderCalendarGrid({
    gridEl: document.getElementById('calGrid'),
    labelEl: document.getElementById('weekLabel'),
    weekStart,
    space,
    pendingLookup,
  });
  updateCellSelection();
}

function updateCellSelection() {
  const selHours = new Set(getSelHours());
  document.querySelectorAll('.cal-cell').forEach(cell => {
    const isSelected = cell.dataset.date === selDate && selHours.has(Number(cell.dataset.hour));
    cell.classList.toggle('selected', isSelected);
  });
  if (selDate !== null && selHours.size > 0) {
    showBookingPanel();
  }
}

// ── Drag-to-select ────────────────────────────────────────
const calGrid = document.getElementById('calGrid');

calGrid.addEventListener('mousedown', e => {
  if (!isLoggedIn()) return;
  const cell = e.target.closest('.cal-cell');
  if (!cell || cell.classList.contains('blocked') || cell.classList.contains('past') || cell.classList.contains('pending')) return;
  e.preventDefault();
  isDragging = true;
  dragDate = cell.dataset.date;
  selDate = dragDate;
  selStartHour = Number(cell.dataset.hour);
  selEndHour = selStartHour;
  updateCellSelection();
});

calGrid.addEventListener('mouseover', e => {
  if (!isDragging) return;
  const cell = e.target.closest('.cal-cell');
  if (!cell || cell.dataset.date !== dragDate) return;
  if (cell.classList.contains('blocked') || cell.classList.contains('past') || cell.classList.contains('pending')) return;
  selEndHour = Number(cell.dataset.hour);
  updateCellSelection();
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    if (selDate && getSelHours().length > 0) showBookingPanel();
  }
});

calGrid.addEventListener('selectstart', e => { if (isDragging) e.preventDefault(); });

// ── Booking panel ─────────────────────────────────────────
function showBookingPanel() {
  const hours = getSelHours();
  if (hours.length === 0) return;
  const sorted = [...hours].sort((a, b) => a - b);
  const startStr = `${String(sorted[0]).padStart(2, '0')}:00`;
  const endStr = `${String(sorted[sorted.length - 1] + 1).padStart(2, '00')}:00`;
  const duration = `${hours.length}hr${hours.length > 1 ? 's' : ''}`;

  const summary = document.getElementById('bookingSummary');
  summary.innerHTML = `
    <div><div class="booking-summary-label">Date</div>${selDate}</div>
    <div><div class="booking-summary-label">Time</div>${startStr} – ${endStr}</div>
    <div><div class="booking-summary-label">Duration</div>${duration}</div>
    <div><div class="booking-summary-label">Est. Cost</div>₩${(space.hourlyRate * hours.length).toLocaleString()}</div>
  `;

  const panel = document.getElementById('bookingPanel');
  panel.classList.remove('hidden');
  if (!panel.querySelector('#bookingForm')) {
    panel.innerHTML = originalPanelContent;
    rewirePanel();
    prefillForm();
  }
}

function hideBookingPanel() {
  selDate = null; selStartHour = null; selEndHour = null;
  updateCellSelection();
  document.getElementById('bookingPanel').classList.add('hidden');
}

function prefillForm() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const nameEl  = document.getElementById('req-name');
    const emailEl = document.getElementById('req-email');
    if (nameEl  && !nameEl.value  && user.username) nameEl.value  = user.username;
    if (emailEl && !emailEl.value && user.email)    emailEl.value = user.email;
  } catch { /* ignore */ }
}

// ── Form submission ───────────────────────────────────────
let originalPanelContent = '';

function rewirePanel() {
  document.getElementById('clearSelBtn')?.addEventListener('click', hideBookingPanel);
  document.getElementById('bookingForm')?.addEventListener('submit', submitBooking);
}

async function submitBooking(e) {
  e.preventDefault();
  const errEl = document.getElementById('bookingError');
  errEl.classList.add('hidden');

  const name = document.getElementById('req-name').value.trim();
  const email = document.getElementById('req-email').value.trim();
  const message = document.getElementById('req-message').value.trim();

  if (!name) { showBookingError('Your name is required.'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showBookingError('Please enter a valid email address.'); return;
  }

  const hours = getSelHours();
  if (hours.length === 0) { showBookingError('Please select a time slot on the calendar.'); return; }

  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending…';

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spaceId: space._id, date: selDate, hours, requesterName: name, requesterEmail: email, message }),
    });

    if (!res.ok) {
      const d = await res.json();
      showBookingError(d.error ?? 'Failed to send request. Please try again.');
      return;
    }

    const panel = document.getElementById('bookingPanel');
    panel.innerHTML = `
      <div class="booking-success">
        ✓ &nbsp;Booking request sent!
        <p>Your request for <strong>${space.name}</strong> on <strong>${selDate}</strong> has been sent to the venue. They'll contact you at <strong>${email}</strong>.</p>
      </div>
    `;

    selDate = null; selStartHour = null; selEndHour = null;

    // Refresh pending hours so the newly requested slot turns yellow
    await loadPendingHours();
    renderCalendar();

  } catch {
    showBookingError('Failed to send request. Please try again.');
  } finally {
    const btn = document.getElementById('sendBtn');
    if (btn) { btn.disabled = false; btn.textContent = 'Send Booking Request'; }
  }
}

function showBookingError(msg) {
  const el = document.getElementById('bookingError');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ── Week navigation ───────────────────────────────────────
document.getElementById('prevWeek').addEventListener('click', () => {
  weekStart.setDate(weekStart.getDate() - 7);
  selDate = null; selStartHour = null; selEndHour = null;
  document.getElementById('bookingPanel').classList.add('hidden');
  renderCalendar();
});

document.getElementById('nextWeek').addEventListener('click', () => {
  weekStart.setDate(weekStart.getDate() + 7);
  selDate = null; selStartHour = null; selEndHour = null;
  document.getElementById('bookingPanel').classList.add('hidden');
  renderCalendar();
});

document.getElementById('todayBtn').addEventListener('click', () => {
  weekStart = getWeekStart(new Date());
  selDate = null; selStartHour = null; selEndHour = null;
  document.getElementById('bookingPanel').classList.add('hidden');
  renderCalendar();
});

// ── Init ──────────────────────────────────────────────────
async function init() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) {
    document.getElementById('spaceHeader').innerHTML = '<p style="color:var(--muted);">No space selected. <a href="/book-space.html">Browse spaces</a>.</p>';
    return;
  }

  try {
    const res = await fetch(`/api/spaces/${id}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    space = data.space;
  } catch {
    document.getElementById('spaceHeader').innerHTML = '<p style="color:#E53E3E;">Space not found. <a href="/book-space.html">Browse spaces</a>.</p>';
    return;
  }

  document.title = `ArtSpace — ${space.name}`;
  renderSpaceHeader();

  await loadPendingHours();
  renderCalendar();

  document.getElementById('loginNotice').style.display = isLoggedIn() ? 'none' : 'block';

  originalPanelContent = document.getElementById('bookingPanel').innerHTML;
  rewirePanel();
  prefillForm();
}

init();
