import { isoDate, getWeekStart, renderCalendarGrid } from './calendar-grid.js';

const API = '/api/spaces';
const token = () => localStorage.getItem('token');

// ── DOM refs ─────────────────────────────────────────────
const authGate      = document.getElementById('authGate');
const adminContent  = document.getElementById('adminContent');
const tableBody     = document.getElementById('spaceTableBody');
const spaceCount    = document.getElementById('spaceCount');
const formPanel     = document.getElementById('formPanel');
const bookingsPanel = document.getElementById('bookingsPanel');
const formTitle     = document.getElementById('formTitle');
const spaceForm     = document.getElementById('spaceForm');
const formError     = document.getElementById('formError');
const saveBtn       = document.getElementById('saveBtn');
const fName         = document.getElementById('f-name');
const fDesc         = document.getElementById('f-desc');
const fCapacity     = document.getElementById('f-capacity');
const fRate         = document.getElementById('f-rate');
const fLocEn        = document.getElementById('f-loc-en');
const fLocKo        = document.getElementById('f-loc-ko');
const fContactEmail = document.getElementById('f-contact-email');
const fContactPhone = document.getElementById('f-contact-phone');
const fEmoji        = document.getElementById('f-emoji');
const fColor        = document.getElementById('f-color');

const descCount = document.getElementById('descCount');
fDesc.addEventListener('input', () => {
  const n = fDesc.value.length;
  descCount.textContent = `${n}/100`;
  descCount.style.color = n >= 90 ? '#E53E3E' : 'var(--muted)';
});

let editingId = null;
let unavailability = {};
let currentSpace = null;
let adminPendingBookings = [];
let adminCalWeekStart = getWeekStart(new Date());

// ── Block all day toggle ─────────────────────────────────
const hoursSelect = document.getElementById('hoursSelect');
const blockAllDay = document.getElementById('blockAllDay');
blockAllDay.addEventListener('change', () => {
  hoursSelect.disabled = blockAllDay.checked;
});

// ── Auth check ───────────────────────────────────────────
function checkAuth() {
  if (!token()) {
    authGate.classList.remove('hidden');
    adminContent.classList.add('hidden');
    return false;
  }
  authGate.classList.add('hidden');
  adminContent.classList.remove('hidden');
  return true;
}

// ── Space table ──────────────────────────────────────────
async function loadSpaces() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    const spaces = data.spaces ?? [];
    const lang = localStorage.getItem('lang') || 'en';
    const n = spaces.length;
    spaceCount.textContent = lang === 'ko' ? `공간 ${n}개` : `${n} space${n !== 1 ? 's' : ''}`;
    renderTable(spaces);
  } catch {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem;">${window.t('admin.err.load')}</td></tr>`;
  }
}

let cachedSpaces = [];

function renderTable(spaces) {
  cachedSpaces = spaces;
  if (spaces.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem;">${window.t('admin.err.empty')}</td></tr>`;
    return;
  }

  tableBody.innerHTML = spaces.map(s => `
    <tr>
      <td>
        <div class="cell-preview">
          <div class="thumb-mini" style="background:${s.thumbColor};">${s.emoji}</div>
          <button class="btn-space-name" data-id="${s._id}">${escHtml(s.name)}</button>
        </div>
      </td>
      <td><div class="tags-cell">${s.types.map(t => `<span class="tag-mini">${escHtml(t)}</span>`).join('')}</div></td>
      <td>${s.capacity}</td>
      <td>${escHtml(s.locationEn)}</td>
      <td class="cell-rate">₩${s.hourlyRate.toLocaleString()}</td>
      <td>
        <div class="cell-actions">
          <button class="btn-edit" data-id="${s._id}">${window.t('admin.btn.edit')}</button>
          <button class="btn-del" data-id="${s._id}">${window.t('admin.btn.del')}</button>
        </div>
      </td>
    </tr>
  `).join('');

  tableBody.querySelectorAll('.btn-space-name').forEach(btn => {
    btn.addEventListener('click', () => {
      const space = spaces.find(s => s._id === btn.dataset.id);
      if (space) openSpaceBookings(space);
    });
  });
  tableBody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const space = spaces.find(s => s._id === btn.dataset.id);
      if (space) openEditForm(space);
    });
  });
  tableBody.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', () => deleteSpace(btn.dataset.id));
  });
}

// ── Delete ───────────────────────────────────────────────
async function deleteSpace(id) {
  if (!confirm(window.t('admin.delete.confirm'))) return;
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? window.t('admin.err.delete'));
      return;
    }
    loadSpaces();
    if (editingId === id) closeForm();
    if (currentSpace?._id === id) closeBookingsPanel();
  } catch {
    alert(window.t('admin.err.delete'));
  }
}

// ── Bookings panel ───────────────────────────────────────
async function openSpaceBookings(space) {
  closeForm();
  currentSpace = space;
  unavailability = space.unavailable ? JSON.parse(JSON.stringify(space.unavailable)) : {};
  const lang = localStorage.getItem('lang') || 'en';
  document.getElementById('bookingsPanelTitle').textContent =
    lang === 'ko' ? `${space.name} — 예약 요청` : `${space.name} — Bookings`;
  bookingsPanel.classList.remove('hidden');
  bookingsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderUnavailList();
  await loadSpaceCalendar(space);
}

function closeBookingsPanel() {
  bookingsPanel.classList.add('hidden');
  currentSpace = null;
}

// ── Form ─────────────────────────────────────────────────
function openNewForm() {
  editingId = null;
  currentSpace = null;
  closeBookingsPanel();
  formTitle.textContent = window.t('admin.form.title.new');
  spaceForm.reset();
  clearTypeChecks();
  fEmoji.value = '🎭';
  setColor('#E6FAF9');
  descCount.textContent = '0/100';
  descCount.style.color = 'var(--muted)';
  clearError();
  formPanel.classList.remove('hidden');
  formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openEditForm(space) {
  editingId = space._id;
  currentSpace = space;
  closeBookingsPanel();
  const editPrefix = (localStorage.getItem('lang') || 'en') === 'ko' ? '수정' : 'Edit';
  formTitle.textContent = `${editPrefix} — ${space.name}`;
  fName.value = space.name;
  fDesc.value = space.description ?? '';
  descCount.textContent = `${fDesc.value.length}/100`;
  descCount.style.color = fDesc.value.length >= 90 ? '#E53E3E' : 'var(--muted)';
  fCapacity.value = space.capacity;
  fRate.value = space.hourlyRate;
  fLocEn.value = space.locationEn;
  fLocKo.value = space.locationKo;
  fContactEmail.value = space.contactEmail ?? '';
  fContactPhone.value = space.contactPhone ?? '';
  fEmoji.value = space.emoji;
  setColor(space.thumbColor);
  clearTypeChecks();
  space.types.forEach(t => {
    const lbl = document.querySelector(`.type-check[data-type="${t}"]`);
    if (lbl) {
      lbl.querySelector('input').checked = true;
      lbl.classList.add('checked');
    }
  });
  clearError();
  formPanel.classList.remove('hidden');
  formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeForm() {
  editingId = null;
  currentSpace = null;
  formPanel.classList.add('hidden');
  clearError();
}

function clearTypeChecks() {
  document.querySelectorAll('.type-check').forEach(lbl => {
    lbl.querySelector('input').checked = false;
    lbl.classList.remove('checked');
  });
}

function getSelectedTypes() {
  return [...document.querySelectorAll('.type-check input:checked')].map(cb => cb.value);
}

function setColor(hex) {
  fColor.value = hex;
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.classList.toggle('selected', sw.dataset.color === hex);
  });
}

// ── Admin calendar & booking requests ───────────────────
async function loadSpaceCalendar(space) {
  try {
    const res = await fetch(`/api/bookings?spaceId=${space._id}&status=pending`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    adminPendingBookings = (await res.json()).bookings ?? [];
  } catch { adminPendingBookings = []; }

  adminCalWeekStart = getWeekStart(new Date());
  renderAdminCalendar(space);
  renderPendingRequests(space);
}

function renderAdminCalendar(space) {
  const pendingLookup = {};
  adminPendingBookings.forEach(b => {
    if (!pendingLookup[b.date]) pendingLookup[b.date] = new Set();
    b.hours.forEach(h => pendingLookup[b.date].add(h));
  });

  renderCalendarGrid({
    gridEl: document.getElementById('adminCalGrid'),
    labelEl: document.getElementById('adminCalLabel'),
    weekStart: adminCalWeekStart,
    space,
    pendingLookup,
  });
}

function renderPendingRequests(space) {
  const list    = document.getElementById('pendingRequestsList');
  const countEl = document.getElementById('pendingCount');
  const pending = adminPendingBookings.filter(b => b.status === 'pending');

  const lang = localStorage.getItem('lang') || 'en';
  countEl.textContent = lang === 'ko' ? `${pending.length}건 대기 중` : `${pending.length} pending`;

  if (pending.length === 0) {
    list.innerHTML = `<div class="req-empty">${window.t('admin.req.empty')}</div>`;
    return;
  }

  list.innerHTML = pending.map(b => {
    const sorted   = [...b.hours].sort((a, z) => a - z);
    const startStr = `${String(sorted[0]).padStart(2, '0')}:00`;
    const endStr   = `${String(sorted[sorted.length - 1] + 1).padStart(2, '0')}:00`;
    const est      = (space.hourlyRate * b.hours.length).toLocaleString();
    const hrLabel  = b.hours.length > 1 ? window.t('avail.hrs') : window.t('avail.hr');
    return `<div class="req-card">
      <div class="req-card-dot"></div>
      <div class="req-card-body">
        <div class="req-card-name">${escHtml(b.requesterName)}</div>
        <div class="req-card-email">${escHtml(b.requesterEmail)}</div>
        <div class="req-card-time">${b.date} &nbsp;·&nbsp; ${startStr}–${endStr} (${b.hours.length}${hrLabel}) &nbsp;·&nbsp; ₩${est} est.</div>
        ${b.message ? `<div class="req-card-msg">"${escHtml(b.message)}"</div>` : ''}
      </div>
      <div class="req-card-actions">
        <button class="btn-confirm" data-id="${b._id}" data-action="confirm">${window.t('admin.btn.confirm')}</button>
        <button class="btn-decline" data-id="${b._id}" data-action="decline">${window.t('admin.btn.decline')}</button>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.btn-confirm, .btn-decline').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const res = await fetch(`/api/bookings/${btn.dataset.id}/${btn.dataset.action}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res.ok) { alert(window.t('admin.action.failed')); return; }
        await reloadCurrentSpace();
      } catch { alert(window.t('admin.action.failed')); }
      btn.disabled = false;
    });
  });
}

async function reloadCurrentSpace() {
  if (!currentSpace) return;
  try {
    const [spaceRes, bookRes] = await Promise.all([
      fetch(`/api/spaces/${currentSpace._id}`),
      fetch(`/api/bookings?spaceId=${currentSpace._id}&status=pending`, {
        headers: { Authorization: `Bearer ${token()}` },
      }),
    ]);
    currentSpace = (await spaceRes.json()).space;
    adminPendingBookings = (await bookRes.json()).bookings ?? [];
  } catch { return; }

  if (!bookingsPanel.classList.contains('hidden')) {
    unavailability = currentSpace.unavailable ? JSON.parse(JSON.stringify(currentSpace.unavailable)) : {};
    renderUnavailList();
    renderAdminCalendar(currentSpace);
    renderPendingRequests(currentSpace);
  }
  loadSpaces();
}

// ── Unavailability ───────────────────────────────────────
const unavailList = document.getElementById('unavailList');

async function saveUnavailability() {
  if (!currentSpace) return;
  const statusEl = document.getElementById('unavailSaveStatus');
  try {
    const res = await fetch(`${API}/${currentSpace._id}/unavailability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ unavailable: unavailability }),
    });
    if (!res.ok) throw new Error();
    currentSpace = { ...currentSpace, unavailable: JSON.parse(JSON.stringify(unavailability)) };
    renderAdminCalendar(currentSpace);
    if (statusEl) {
      statusEl.textContent = '✓ Saved';
      statusEl.style.color = '#16a34a';
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2000);
    }
  } catch {
    if (statusEl) {
      statusEl.textContent = 'Save failed';
      statusEl.style.color = '#E53E3E';
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
    }
  }
}

function renderUnavailList() {
  const dates = Object.keys(unavailability).sort();
  if (dates.length === 0) {
    unavailList.innerHTML = `<span class="unavail-empty">${window.t('admin.unavail.empty')}</span>`;
    return;
  }
  unavailList.innerHTML = dates.map(date => {
    const hours = [...unavailability[date]].sort((a, b) => a - b);
    const tags = hours.map(h => `<span class="unavail-hour-tag">${String(h).padStart(2, '0')}:00</span>`).join('');
    return `<div class="unavail-row">
      <span class="unavail-date-label">${date}</span>
      <div class="unavail-hours">${tags}</div>
      <button type="button" class="btn-remove-date" data-date="${date}">${window.t('admin.btn.remove')}</button>
    </div>`;
  }).join('');

  unavailList.querySelectorAll('.btn-remove-date').forEach(btn => {
    btn.addEventListener('click', () => {
      delete unavailability[btn.dataset.date];
      renderUnavailList();
      saveUnavailability();
    });
  });
}

function addUnavailBlock() {
  const dateInput = document.getElementById('unavailDate');
  const date = dateInput.value;
  if (!date) { alert(window.t('admin.err.unavail.date')); return; }

  let hours;
  if (blockAllDay.checked) {
    hours = Array.from({ length: 14 }, (_, i) => i + 9);
  } else {
    hours = [...hoursSelect.selectedOptions].map(o => Number(o.value));
    if (hours.length === 0) { alert(window.t('admin.err.unavail.hours')); return; }
  }

  const existing = unavailability[date] ?? [];
  unavailability[date] = [...new Set([...existing, ...hours])];
  renderUnavailList();
  saveUnavailability();

  dateInput.value = '';
  hoursSelect.selectedIndex = -1;
  blockAllDay.checked = false;
  hoursSelect.disabled = false;
}

function showError(msg) {
  formError.textContent = msg;
  formError.classList.remove('hidden');
}

function clearError() {
  formError.textContent = '';
  formError.classList.add('hidden');
}

// ── Form submit ──────────────────────────────────────────
spaceForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearError();

  const types = getSelectedTypes();
  if (!fName.value.trim()) { showError(window.t('admin.err.name')); fName.focus(); return; }
  if (types.length === 0) { showError(window.t('admin.err.types')); return; }
  if (!fCapacity.value || Number(fCapacity.value) < 1) { showError(window.t('admin.err.capacity')); fCapacity.focus(); return; }
  if (!fRate.value || Number(fRate.value) < 0) { showError(window.t('admin.err.rate')); fRate.focus(); return; }
  if (!fLocEn.value.trim()) { showError(window.t('admin.err.loc.en')); fLocEn.focus(); return; }
  if (!fLocKo.value.trim()) { showError(window.t('admin.err.loc.ko')); fLocKo.focus(); return; }

  const payload = {
    name: fName.value.trim(),
    description: fDesc.value.trim().slice(0, 100),
    types,
    capacity: Number(fCapacity.value),
    hourlyRate: Number(fRate.value),
    locationEn: fLocEn.value.trim(),
    locationKo: fLocKo.value.trim(),
    emoji: fEmoji.value,
    thumbColor: fColor.value,
    unavailable: unavailability,
    contactEmail: fContactEmail.value.trim(),
    contactPhone: fContactPhone.value.trim(),
  };

  saveBtn.disabled = true;
  saveBtn.textContent = window.t('admin.saving');

  try {
    const url = editingId ? `${API}/${editingId}` : API;
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const d = await res.json();
      showError(d.error ?? window.t('admin.err.save'));
      return;
    }

    closeForm();
    loadSpaces();
  } catch {
    showError(window.t('admin.err.save'));
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = window.t('admin.form.save');
  }
});

// ── Type checkbox toggle ─────────────────────────────────
document.querySelectorAll('.type-check').forEach(lbl => {
  lbl.addEventListener('click', () => {
    const cb = lbl.querySelector('input');
    cb.checked = !cb.checked;
    lbl.classList.toggle('checked', cb.checked);
  });
});

// ── Unavailability add button ────────────────────────────
document.getElementById('addUnavailBtn').addEventListener('click', addUnavailBlock);

// ── Color swatch clicks ──────────────────────────────────
document.querySelectorAll('.color-swatch').forEach(sw => {
  sw.addEventListener('click', () => setColor(sw.dataset.color));
});
fColor.addEventListener('input', () => {
  document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('selected'));
});

// ── Button wiring ────────────────────────────────────────
document.getElementById('newSpaceBtn').addEventListener('click', openNewForm);
document.getElementById('closeBookingsBtn').addEventListener('click', closeBookingsPanel);
document.getElementById('cancelBtn').addEventListener('click', closeForm);
document.getElementById('cancelBtn2').addEventListener('click', closeForm);

document.getElementById('adminCalPrev').addEventListener('click', () => {
  adminCalWeekStart.setDate(adminCalWeekStart.getDate() - 7);
  if (currentSpace) renderAdminCalendar(currentSpace);
});
document.getElementById('adminCalNext').addEventListener('click', () => {
  adminCalWeekStart.setDate(adminCalWeekStart.getDate() + 7);
  if (currentSpace) renderAdminCalendar(currentSpace);
});
document.getElementById('adminCalToday').addEventListener('click', () => {
  adminCalWeekStart = getWeekStart(new Date());
  if (currentSpace) renderAdminCalendar(currentSpace);
});

// ── XSS-safe text helper ─────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Lang change ──────────────────────────────────────────
document.addEventListener('langchange', () => {
  if (cachedSpaces.length > 0) renderTable(cachedSpaces);
  if (currentSpace) {
    if (!formPanel.classList.contains('hidden')) {
      const editPrefix = (localStorage.getItem('lang') || 'en') === 'ko' ? '수정' : 'Edit';
      formTitle.textContent = `${editPrefix} — ${currentSpace.name}`;
    }
    if (!bookingsPanel.classList.contains('hidden')) {
      renderUnavailList();
      const lang = localStorage.getItem('lang') || 'en';
      document.getElementById('bookingsPanelTitle').textContent =
        lang === 'ko' ? `${currentSpace.name} — 예약 요청` : `${currentSpace.name} — Bookings`;
      renderPendingRequests(currentSpace);
      renderAdminCalendar(currentSpace);
    }
  }
});

// ── Init ─────────────────────────────────────────────────
if (checkAuth()) {
  loadSpaces();
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  checkAuth();
  closeForm();
  closeBookingsPanel();
});
