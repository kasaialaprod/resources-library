"use strict";

(function () {
const stored = localStorage.getItem('theme');
if (stored) {
    document.documentElement.setAttribute('data-theme', stored);
}
})();

const toggle = document.getElementById('theme-toggle');

toggle.addEventListener('click', () => {
const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
const next = current === 'dark' ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', next);
localStorage.setItem('theme', next);
toggle.textContent = next === 'dark' ? '☀️' : '🌙';
});


// Base de l’API : en prod = https://slateblue-dog-126964.hostingersite.com
const API_BASE = window.location.origin;

async function login(event) {
  event.preventDefault();

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      alert(err.error || 'Erreur login');
      return;
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.user.username);

    // redirection vers dashboard
    window.location.href = '/dashboard/index.html'; // adapte si besoin
  } catch (e) {
    console.error(e);
    alert('Erreur de connexion au serveur');
  }
}

document.getElementById('login-form').addEventListener('submit', login);
