const API = '/api/auth';
if (localStorage.getItem('token')) {
    window.location.href = '/welcome.html';
}
const form = document.getElementById('signup-form');
const errorMsg = document.getElementById('error-msg');
const submitBtn = form.querySelector('button[type="submit"]');
function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
}
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm').value;
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
            body: JSON.stringify({ username, email, phone, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            showError(data.error ?? 'Sign up failed');
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
        submitBtn.textContent = 'Create Account';
    }
});
export {};
