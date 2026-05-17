const API = '/api/auth';
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/';
}
const loading = document.getElementById('loading');
const content = document.getElementById('welcome-content');
const heading = document.getElementById('welcome-heading');
const accountId = document.getElementById('account-id');
const avatar = document.getElementById('avatar');
const logoutBtn = document.getElementById('logout-btn');
const t = (key) => window.t?.(key) ?? key;
let currentUsername = '';
function updateHeading() {
    if (!currentUsername)
        return;
    heading.textContent = t('welcome.greeting').replace('{name}', currentUsername);
}
async function loadUser() {
    try {
        const res = await fetch(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }
        const data = await res.json();
        const { id, username } = data.user;
        currentUsername = username;
        avatar.textContent = username[0].toUpperCase();
        updateHeading();
        accountId.textContent = id;
        loading.classList.add('hidden');
        content.classList.remove('hidden');
    }
    catch {
        loading.textContent = t('welcome.error');
    }
}
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});
document.addEventListener('langchange', updateHeading);
loadUser();
export {};
