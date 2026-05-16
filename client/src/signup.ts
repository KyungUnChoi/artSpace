export {};
const API = '/api/auth';

if (localStorage.getItem('token')) {
  window.location.href = '/welcome.html';
}

const form = document.getElementById('signup-form') as HTMLFormElement;
const errorMsg = document.getElementById('error-msg') as HTMLParagraphElement;
const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;

function showError(msg: string) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.classList.add('hidden');

  const username = (document.getElementById('username') as HTMLInputElement).value.trim();
  const password = (document.getElementById('password') as HTMLInputElement).value;
  const confirm = (document.getElementById('confirm') as HTMLInputElement).value;

  if (password !== confirm) {
    showError('Passwords do not match');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account…';

  try {
    const res = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json() as { token?: string; user?: { id: string; username: string }; error?: string };

    if (!res.ok) {
      showError(data.error ?? 'Sign up failed');
      return;
    }

    localStorage.setItem('token', data.token!);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/welcome.html';
  } catch {
    showError('Network error. Is the server running?');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});
