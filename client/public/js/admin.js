import { isoDate, getWeekStart, renderCalendarGrid } from './calendar-grid.js';

const API = '/api/spaces';
const token = () => localStorage.getItem('token');

// ── DOM refs ─────────────────────────────────────────────
const authGate    = document.getElementById('authGate');
const adminContent = document.getElementById('adminContent');
const tableBody   = document.getElementById('spaceTableBody');
const spaceCount  = document.getElementById('spaceCount');
const formPanel   = document.getElementById('formPanel');
const formTitle   = document.getElementById('formTitle');
const spaceForm   = document.getElementById('spaceForm');
const formError   = document.getElementById('formError');
const saveBtn     = document.getElementById('saveBtn');
const fName       = document.getElementById('f-name');
const fCapacity   = document.getElementById('f-capacity');
const fRate       = document.getElementById('f-rate');
const fLocEn      = document.getElementById('f-loc-en');
const fLocKo         = document.getElementById('f-loc-ko');
const fContactEmail  = document.getElementById('f-contact-email');
const fContactPhone  = document.getElementById('f-contact-phone');
const fEmoji         = document.getElementById('f-emoji');
const fColor         = document.getElementById('f-color');

let editingId = null;
let unavailability = {};
let currentSpace = null;
let adminPendingBookings = [];
let adminCalWeekStart = getWeekStart(new Date());

// ── Block all day toggle ─────────────────────────────────
const hoursSelect  = document.getElementById('hoursSelect');
const blockAllDay  = document.getElementById('blockAllDay');
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
    spaceCount.textContent = `${spaces.length} space${spaces.length !== 1 ? 's' : ''}`;
    renderTable(spaces);
  } catch {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem;">Failed to load spaces.</td></tr>';
  }
}

function renderTable(spaces) {
  if (spaces.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem;">No spaces yet. Click "+ New Space" to add one.</td></tr>';
    return;
  }

  tableBody.innerHTML = spaces.map(s => `
    <tr>
      <td>
        <div class="cell-preview">
          <div class="thumb-mini" style="background:${s.thumbColor};">${s.emoji}</div>
          <span class="cell-name">${escHtml(s.name)}</span>
        </div>
      </td>
      <td><div class="tags-cell">${s.types.map(t => `<span class="tag-mini">${escHtml(t)}</span>`).join('')}</div></td>
      <td>${s.capacity}</td>
      <td>${escHtml(s.locationEn)}</td>
      <td class="cell-rate">₩${s.hourlyRate.toLocaleString()}</td>
      <td>
        <div class="cell-actions">
          <button class="btn-edit" data-id="${s._id}">Edit</button>
          <button class="btn-del" data-id="${s._id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Attach row button listeners after render
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
  if (!confirm('Delete this space? This cannot be undone.')) return;
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? 'Delete failed');
      return;
    }
    loadSpaces();
    if (editingId === id) closeForm();
  } catch {
    alert('Delete failed. Please try again.');
  }
}

// ── Form ─────────────────────────────────────────────────
function openNewForm() {
  editingId = null;
  currentSpace = null;
  document.getElementById('adminCalSection').classList.add('hidden');
  formTitle.textContent = 'New Space';
  spaceForm.reset();
  clearTypeChecks();
  fEmoji.value = '🎭';
  setColor('#E6FAF9');
  unavailability = {};
  renderUnavailList();
  clearError();
  formPanel.classList.remove('hidden');
  formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openEditForm(space) {
  editingId = space._id;
  currentSpace = space;
  formTitle.textContent = `Edit — ${space.name}`;
  fName.value = space.name;
  fCapacity.value = space.capacity;
  fRate.value = space.hourlyRate;
  fLocEn.value = space.locationEn;
  fLocKo.value = space.locationKo;
  fContactEmail.value = space.contactEmail ?? '';
  fContactPhone.value = space.contactPhone ?? '';
  fEmoji.value = space.emoji;
  setColor(space.thumbColor);
  unavailability = space.unavailable ? JSON.parse(JSON.stringify(space.unavailable)) : {};
  renderUnavailList();
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
  loadSpaceCalendar(space);
}

function closeForm() {
  editingId = null;
  currentSpace = null;
  formPanel.classList.add('hidden');
  document.getElementById('adminCalSection').classList.add('hidden');
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
  document.getElementById('adminCalSection').classList.remove('hidden');
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
  const list     = document.getElementById('pendingRequestsList');
  const countEl  = document.getElementById('pendingCount');
  const pending  = adminPendingBookings.filter(b => b.status === 'pending');

  countEl.textContent = `${pending.length} pending`;

  if (pending.length === 0) {
    list.innerHTML = '<div class="req-empty">No pending requests.</div>';
    return;
  }

  list.innerHTML = pending.map(b => {
    const sorted   = [...b.hours].sort((a,z) => a-z);
    const startStr = `${String(sorted[0]).padStart(2,'0')}:00`;
    const endStr   = `${String(sorted[sorted.length-1]+1).padStart(2,'00')}:00`;
    const est      = (space.hourlyRate * b.hours.length).toLocaleString();
    return `<div class="req-card">
      <div class="req-card-dot"></div>
      <div class="req-card-body">
        <div class="req-card-name">${escHtml(b.requesterName)}</div>
        <div class="req-card-email">${escHtml(b.requesterEmail)}</div>
        <div class="req-card-time">${b.date} &nbsp;·&nbsp; ${startStr}–${endStr} (${b.hours.length}hr${b.hours.length>1?'s':''}) &nbsp;·&nbsp; ₩${est} est.</div>
        ${b.message ? `<div class="req-card-msg">"${escHtml(b.message)}"</div>` : ''}
      </div>
      <div class="req-card-actions">
        <button class="btn-confirm" data-id="${b._id}" data-action="confirm">✓ Confirm</button>
        <button class="btn-decline" data-id="${b._id}" data-action="decline">✕ Decline</button>
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
        if (!res.ok) { alert('Action failed'); return; }
        await reloadCurrentSpace();
      } catch { alert('Action failed'); }
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

  unavailability = currentSpace.unavailable
    ? JSON.parse(JSON.stringify(currentSpace.unavailable)) : {};
  renderUnavailList();
  renderAdminCalendar(currentSpace);
  renderPendingRequests(currentSpace);
  loadSpaces();
}

// ── Unavailability ───────────────────────────────────────
const unavailList = document.getElementById('unavailList');

function renderUnavailList() {
  const dates = Object.keys(unavailability).sort();
  if (dates.length === 0) {
    unavailList.innerHTML = '<span class="unavail-empty">No blocked times yet.</span>';
    return;
  }
  unavailList.innerHTML = dates.map(date => {
    const hours = [...unavailability[date]].sort((a, b) => a - b);
    const tags = hours.map(h => `<span class="unavail-hour-tag">${String(h).padStart(2, '0')}:00</span>`).join('');
    return `<div class="unavail-row">
      <span class="unavail-date-label">${date}</span>
      <div class="unavail-hours">${tags}</div>
      <button type="button" class="btn-remove-date" data-date="${date}">Remove</button>
    </div>`;
  }).join('');

  unavailList.querySelectorAll('.btn-remove-date').forEach(btn => {
    btn.addEventListener('click', () => {
      delete unavailability[btn.dataset.date];
      renderUnavailList();
    });
  });
}

function addUnavailBlock() {
  const dateInput = document.getElementById('unavailDate');
  const date = dateInput.value;
  if (!date) { alert('Please select a date.'); return; }

  let hours;
  if (blockAllDay.checked) {
    hours = Array.from({ length: 14 }, (_, i) => i + 9); // 09–22
  } else {
    hours = [...hoursSelect.selectedOptions].map(o => Number(o.value));
    if (hours.length === 0) { alert('Please select at least one hour to block.'); return; }
  }

  const existing = unavailability[date] ?? [];
  unavailability[date] = [...new Set([...existing, ...hours])];
  renderUnavailList();

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
  if (!fName.value.trim()) { showError('Name is required.'); fName.focus(); return; }
  if (types.length === 0) { showError('Select at least one type.'); return; }
  if (!fCapacity.value || Number(fCapacity.value) < 1) { showError('Capacity must be at least 1.'); fCapacity.focus(); return; }
  if (!fRate.value || Number(fRate.value) < 0) { showError('Hourly rate must be 0 or more.'); fRate.focus(); return; }
  if (!fLocEn.value.trim()) { showError('English location is required.'); fLocEn.focus(); return; }
  if (!fLocKo.value.trim()) { showError('Korean location is required.'); fLocKo.focus(); return; }

  const payload = {
    name: fName.value.trim(),
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
  saveBtn.textContent = 'Saving…';

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
      showError(d.error ?? 'Save failed');
      return;
    }

    closeForm();
    loadSpaces();
  } catch {
    showError('Save failed. Please try again.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Space';
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
document.getElementById('cancelBtn').addEventListener('click', closeForm);
document.getElementById('cancelBtn2').addEventListener('click', closeForm);

// ── XSS-safe text helper ─────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Init ─────────────────────────────────────────────────
if (checkAuth()) {
  loadSpaces();
}

// Re-check auth if user logs out on this page
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  checkAuth();
  closeForm();
});
