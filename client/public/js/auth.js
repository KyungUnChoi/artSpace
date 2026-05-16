const loginBtn = document.getElementById('loginBtn');
const userMenu = document.getElementById('userMenu');
const userAvatarBtn = document.getElementById('userAvatarBtn');
const userDropdown = document.getElementById('userDropdown');
const dropdownAvatar = document.getElementById('dropdownAvatar');
const dropdownName = document.getElementById('dropdownName');
const dropdownId = document.getElementById('dropdownId');
const logoutBtn = document.getElementById('logoutBtn');

function applyAuthState() {
    const raw = localStorage.getItem('user');
    if (!raw || !localStorage.getItem('token')) return;
    try {
        const user = JSON.parse(raw);
        const initial = (user.username ?? user.name ?? '?')[0].toUpperCase();
        userAvatarBtn.textContent = initial;
        dropdownAvatar.textContent = initial;
        dropdownName.textContent = user.username ?? user.name ?? '';
        dropdownId.textContent = `ID: ${user.id ?? ''}`;
        loginBtn.classList.add('hidden');
        userMenu.classList.remove('hidden');
    } catch { /* malformed storage — stay logged out */ }
}

userAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !userDropdown.classList.contains('hidden');
    userDropdown.classList.toggle('hidden', open);
    userAvatarBtn.setAttribute('aria-expanded', String(!open));
});

document.addEventListener('click', () => {
    userDropdown.classList.add('hidden');
    userAvatarBtn.setAttribute('aria-expanded', 'false');
});

userDropdown.addEventListener('click', (e) => e.stopPropagation());

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    userMenu.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    userDropdown.classList.add('hidden');
});

applyAuthState();
