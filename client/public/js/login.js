const API = '/api/auth';
if (localStorage.getItem('token')) {
    window.location.href = '/welcome.html';
}
const form = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');
const submitBtn = form.querySelector('button[type="submit"]');
function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
}
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            showError(data.error ?? 'Login failed');
            return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/welcome.html';
    }
    catch {
        showError('Network error. Is the server running?');
    }
    finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
});
export {};
