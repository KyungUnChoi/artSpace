export {};

interface Partner {
  id: string;
  name: string;
  initials: string;
  color: string;
  image?: string;
}

interface MonthStat { label: string; count: number; }

interface StatsResponse {
  totalSpaces: number;
  bookingsRequested: number;
  bookingsConfirmed: number;
  totalCities: number;
  monthly: MonthStat[];
}

interface RecentBooking {
  spaceName: string;
  spaceTypes: string[];
  city: string;
}

// ── Carousel ─────────────────────────────────────────────────────────────────
const VISIBLE = 4;
const CARD_WIDTH = 160;
const GAP = 20;
const STEP = CARD_WIDTH + GAP;

let currentPartners: Partner[] = [];
let currentIndex = 0;

const track = document.getElementById('carouselTrack') as HTMLDivElement;
const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;

function getMaxIndex() {
  return Math.max(0, currentPartners.length - VISIBLE);
}

function buildCards() {
  track.innerHTML = '';
  currentPartners.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'partner-card';
    card.style.cursor = 'pointer';
    card.title = p.name;

    if (p.image) {
      const img = document.createElement('img');
      img.className = 'partner-img';
      img.src = p.image;
      img.alt = p.name;
      card.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'partner-placeholder';
      placeholder.style.background = p.color;
      placeholder.textContent = p.initials;
      card.appendChild(placeholder);
    }

    const label = document.createElement('span');
    label.className = 'partner-name';
    label.textContent = p.name;
    card.appendChild(label);

    card.addEventListener('click', () => {
      window.location.href = `/book-space.html?open=${encodeURIComponent(p.id)}`;
    });

    track.appendChild(card);
  });
}

function updateCarousel() {
  const maxIndex = getMaxIndex();
  track.style.transform = `translateX(-${currentIndex * STEP}px)`;
  prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
  nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';
}

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) { currentIndex--; updateCarousel(); }
});

nextBtn.addEventListener('click', () => {
  if (currentIndex < getMaxIndex()) { currentIndex++; updateCarousel(); }
});

buildCards();
updateCarousel();

// ── Dashboard card helpers ────────────────────────────────────────────────────
function typeToBadge(types: string[]): { abbr: string; cls: string } {
  const t = types[0] ?? '';
  if (t === 'Performance Hall') return { abbr: 'HALL', cls: 'badge-teal' };
  if (t === 'Gallery')          return { abbr: 'GALL', cls: 'badge-purple' };
  if (t === 'Studio')           return { abbr: 'STUD', cls: 'badge-orange' };
  if (t === 'Dance')            return { abbr: 'DANC', cls: 'badge-pink' };
  if (t === 'Rehearsal')        return { abbr: 'REHS', cls: 'badge-teal' };
  if (t === 'Workshop')         return { abbr: 'WORK', cls: 'badge-green' };
  return { abbr: t.substring(0, 4).toUpperCase() || '—', cls: 'badge-teal' };
}

function renderRecentBookings(bookings: RecentBooking[]) {
  const el = document.getElementById('dbRecentList');
  if (!el) return;
  if (bookings.length === 0) {
    el.innerHTML = '<div class="db-item" style="color:var(--muted);font-size:0.8rem;">No bookings yet.</div>';
    return;
  }
  el.innerHTML = bookings.map(b => {
    const { abbr, cls } = typeToBadge(b.spaceTypes);
    const city = b.city || '—';
    return `<div class="db-item">
      <span class="db-badge ${cls}">${abbr}</span>
      <span class="db-name">${b.spaceName}</span>
      <span class="db-city">${city}</span>
    </div>`;
  }).join('');
}

function renderChart(monthly: MonthStat[]) {
  const el = document.getElementById('dbChart');
  if (!el) return;
  const max = Math.max(...monthly.map(m => m.count), 1);
  // Available bar height: chart is 110px, bottom padding 16px, label ~12px, gap ~5px → ~77px
  const BAR_MAX_H = 77;
  el.innerHTML = monthly.map((m, i) => {
    const h = Math.max(4, Math.round((m.count / max) * BAR_MAX_H));
    const isCurrent = i === monthly.length - 1;
    return `<div class="db-bar-wrap">
      <div class="db-bar${isCurrent ? ' highlight' : ''}" style="height:${h}px"></div>
      <span>${m.label}</span>
    </div>`;
  }).join('');
}

// ── Fetch live data from API ──────────────────────────────────────────────────
async function loadData() {
  try {
    const [spacesRes, statsRes, recentRes] = await Promise.all([
      fetch('/api/spaces'),
      fetch('/api/stats'),
      fetch('/api/bookings/recent-public'),
    ]);

    if (spacesRes.ok) {
      const data = await spacesRes.json() as { spaces: { _id: string; name: string; emoji?: string; thumbColor?: string }[] };
      if (data.spaces?.length) {
        currentPartners = data.spaces.map((s) => ({
          id: s._id,
          name: s.name,
          initials: s.emoji || s.name.substring(0, 3).toUpperCase(),
          color: s.thumbColor || '#0CBFBF',
        }));
        currentIndex = 0;
        buildCards();
        updateCarousel();

        const statSpacesEl = document.getElementById('statSpaces');
        if (statSpacesEl) statSpacesEl.textContent = data.spaces.length.toLocaleString();
      }
    }

    if (statsRes.ok) {
      const stats = await statsRes.json() as StatsResponse;

      // Bottom stats bar
      const statBookingsEl = document.getElementById('statBookings');
      if (statBookingsEl && stats.bookingsRequested != null)
        statBookingsEl.textContent = stats.bookingsRequested.toLocaleString();

      const statVenuesEl = document.getElementById('statVenues');
      if (statVenuesEl && stats.bookingsConfirmed != null)
        statVenuesEl.textContent = stats.bookingsConfirmed.toLocaleString();

      // Hero dashboard card
      const dbSpaces = document.getElementById('dbStatSpaces');
      if (dbSpaces) dbSpaces.textContent = (stats.totalSpaces ?? 0).toLocaleString();

      const dbConfirmed = document.getElementById('dbStatConfirmed');
      if (dbConfirmed) dbConfirmed.textContent = (stats.bookingsConfirmed ?? 0).toLocaleString();

      const dbRequested = document.getElementById('dbStatRequested');
      if (dbRequested) dbRequested.textContent = (stats.bookingsRequested ?? 0).toLocaleString();

      const dbCities = document.getElementById('dbStatCities');
      if (dbCities) dbCities.textContent = (stats.totalCities ?? 0).toLocaleString();

      if (stats.monthly?.length) renderChart(stats.monthly);
    }

    if (recentRes.ok) {
      const data = await recentRes.json() as { bookings: RecentBooking[] };
      renderRecentBookings(data.bookings ?? []);
    }
  } catch (err) {
    console.warn('ArtSpace: could not load data from API.', err);
  }
}

loadData();
