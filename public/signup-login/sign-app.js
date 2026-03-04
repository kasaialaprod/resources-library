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



const API_URL = 'http://localhost:3000/api/ressources';

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
    const response = await fetch('http://localhost:3000/api/auth/register', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    
    if (!response.ok) {
      const errorText = await response.text(); 
      console.error('Erreur serveur:', response.status, errorText);
      alert(`Erreur ${response.status}: Echec de l'inscription`);
      return;
    }

    const data = await response.json(); 
    console.log('Succès:', data);
    localStorage.setItem('token', data.token);
    alert('Registration successful');
    const loggedInUser = data.user ? data.user.username : formData.username;
    alert(`Welcome, ${loggedInUser}!`);
    window.location.href = '/dashboard';
  } catch (error) {
    if (error.name === 'SyntaxError') {
      console.error('Réponse non-JSON:', error);
    } else {
      console.error('Erreur réseau:', error);
    }
  }
}


document.getElementById('register-form').addEventListener('submit', register);