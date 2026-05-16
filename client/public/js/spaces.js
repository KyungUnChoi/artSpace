if (localStorage.getItem('token')) {
  const notice = document.querySelector('.login-notice');
  if (notice) notice.style.display = 'none';
}

const TYPE_LABELS = {
  en: {
    'Performance Hall': 'Performance Hall',
    'Gallery': 'Gallery',
    'Rehearsal': 'Rehearsal',
    'Studio': 'Studio',
    'Dance': 'Dance',
    'Workshop': 'Workshop',
  },
  ko: {
    'Performance Hall': '공연장',
    'Gallery': '갤러리',
    'Rehearsal': '연습실',
    'Studio': '스튜디오',
    'Dance': '댄스',
    'Workshop': '워크숍',
  },
};

function getLang() {
  return localStorage.getItem('lang') || 'en';
}

function formatMeta(space, lang) {
  const loc = lang === 'ko' ? space.locationKo : space.locationEn;
  const capLabel = lang === 'ko' ? '수용 인원' : 'Capacity';
  return `${capLabel}: ${space.capacity} · ${loc}`;
}

function formatRate(rate, lang) {
  const formatted = rate.toLocaleString('ko-KR');
  return lang === 'ko' ? `₩${formatted} / 시간` : `₩${formatted} / hr`;
}

function renderCards(spaces, lang) {
  const grid = document.getElementById('spaceGrid');
  if (!grid) return;

  const labels = TYPE_LABELS[lang] || TYPE_LABELS.en;
  const ctaText = lang === 'ko' ? '예약 가능 확인' : 'Check Availability';
  const emptyText = lang === 'ko' ? '해당 유형의 공간이 없습니다.' : 'No spaces found.';

  if (spaces.length === 0) {
    grid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;padding:2rem 0;">${emptyText}</p>`;
    return;
  }

  grid.innerHTML = spaces.map(space => `
    <div class="space-card">
      <div class="space-thumb" style="background:${space.thumbColor};">${space.emoji}</div>
      <div class="space-body">
        <div class="space-name">${space.name}</div>
        <div class="space-meta">${formatMeta(space, lang)}</div>
        <div class="space-rate" style="font-size:0.82rem;color:var(--teal-dark);font-weight:600;margin-bottom:0.75rem;">${formatRate(space.hourlyRate, lang)}</div>
        <div class="space-tags">${space.types.map(t => `<span class="space-tag">${labels[t] ?? t}</span>`).join('')}</div>
        <a href="/availability.html?id=${space._id}" class="space-btn">${ctaText}</a>
      </div>
    </div>
  `).join('');
}

let allSpaces = [];

async function loadSpaces(type = '') {
  const grid = document.getElementById('spaceGrid');
  if (grid) {
    const loadingText = getLang() === 'ko' ? '불러오는 중...' : 'Loading...';
    grid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;padding:2rem 0;">${loadingText}</p>`;
  }

  try {
    const url = type ? `/api/spaces?type=${encodeURIComponent(type)}` : '/api/spaces';
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    allSpaces = data.spaces ?? [];
    renderCards(allSpaces, getLang());
  } catch {
    if (grid) {
      const errText = getLang() === 'ko' ? '공간 목록을 불러오지 못했습니다.' : 'Failed to load spaces.';
      grid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;padding:2rem 0;">${errText}</p>`;
    }
  }
}

// Filter buttons use data-filter-type to avoid depending on display text
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadSpaces(btn.dataset.filterType ?? '');
  });
});

// Re-render in new language without re-fetching
document.addEventListener('langchange', e => {
  renderCards(allSpaces, e.detail);
});

loadSpaces();
