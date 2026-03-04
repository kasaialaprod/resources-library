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



// Base de l’API : local → http://localhost:3000, prod → https://slateblue-dog-126964.hostingersite.com
const API_BASE = window.location.origin;

async function register(event) {
  event.preventDefault();
  console.log('Register form submitted');

  const formData = {
    email: document.getElementById('register-email').value,
    username: document.getElementById('register-username').value,
    password: document.getElementById('register-password').value
  };

  console.log('Form Data:', formData);

  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur serveur:', response.status, errorText);
      alert(`Erreur ${response.status}: Échec de l'inscription`);
      return;
    }

    const data = await response.json();
    console.log('Succès:', data);

    localStorage.setItem('token', data.token);
    const loggedInUser = data.user ? data.user.username : formData.username;
    alert(`Welcome, ${loggedInUser}!`);

    window.location.href = '/dashboard/index.html'; // adapte au vrai chemin
  } catch (error) {
    if (error.name === 'SyntaxError') {
      console.error('Réponse non-JSON:', error);
    } else {
      console.error('Erreur réseau:', error);
      alert('Erreur de connexion au serveur');
    }
  }
}

document.getElementById('register-form').addEventListener('submit', register);
