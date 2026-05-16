// ── Partner data ─────────────────────────────────────────────────────────────
// Replace `image` with a real URL (e.g. "/img/partners/sac.png") to show logos.
const partners = [
    { name: 'Seoul Arts Center', initials: 'SAC', color: '#0CBFBF' },
    { name: 'National Theatre of Korea', initials: 'NT', color: '#7C5CBF' },
    { name: 'LG Arts Center', initials: 'LG', color: '#C47D11' },
    { name: 'Sejong Center', initials: 'SC', color: '#2E86AB' },
    { name: 'ARKO', initials: 'ARKO', color: '#C7456A' },
    { name: 'Gyeonggi Arts Center', initials: 'GAC', color: '#3A7D44' },
    { name: 'Busan Cultural Center', initials: 'BCC', color: '#E05C1A' },
    { name: 'Korea National Arts', initials: 'KNA', color: '#6A3F9E' },
    { name: 'Incheon Art Platform', initials: 'IAP', color: '#1A7A6E' },
];
// ── Carousel ─────────────────────────────────────────────────────────────────
const VISIBLE = 4;
const CARD_WIDTH = 160;
const GAP = 20;
const STEP = CARD_WIDTH + GAP;
let currentIndex = 0;
const maxIndex = partners.length - VISIBLE;
const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
function buildCards() {
    track.innerHTML = '';
    partners.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'partner-card';
        if (p.image) {
            const img = document.createElement('img');
            img.className = 'partner-img';
            img.src = p.image;
            img.alt = p.name;
            card.appendChild(img);
        }
        else {
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
        track.appendChild(card);
    });
}
function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * STEP}px)`;
    prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
    nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';
}
prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
});
nextBtn.addEventListener('click', () => {
    if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
    }
});
buildCards();
updateCarousel();
export {};
