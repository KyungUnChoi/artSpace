export {};
const API = '/api/auth';

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/';
}

const loading = document.getElementById('loading') as HTMLParagraphElement;
const content = document.getElementById('welcome-content') as HTMLDivElement;
const heading = document.getElementById('welcome-heading') as HTMLHeadingElement;
const accountId = document.getElementById('account-id') as HTMLElement;
const avatar = document.getElementById('avatar') as HTMLDivElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

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

    const data = await res.json() as { user: { id: string; username: string } };
    const { id, username } = data.user;

    avatar.textContent = username[0].toUpperCase();
    heading.textContent = `Welcome, ${username}!`;
    accountId.textContent = id;

    loading.classList.add('hidden');
    content.classList.remove('hidden');
  } catch {
    loading.textContent = 'Failed to load user data.';
  }
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
});

loadUser();
