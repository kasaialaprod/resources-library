// Toggle thème clair/sombre
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

document.addEventListener('DOMContentLoaded', async () => {
  

  // Vérif token
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/signup-login/login.html';
    return;
  }

  // Affichage pseudo
  const username = localStorage.getItem('username');
  const usernameSpan = document.getElementById('username');
  if (username && usernameSpan) {
    usernameSpan.textContent = username;
  }

  const list = document.getElementById('resources-list');
  if (!list) {
    console.warn('#resources-list introuvable');
    return;
  }

  // Fonction utilitaire pour rendre une ressource en carte
  function renderResourceCard(r) {
    const card = document.createElement('article');
    card.classList.add('resource-card');

    card.innerHTML = `
      <h3>${r.title ?? ''}</h3>
      <!--<p class="resource-meta">
        <span >${r.created_at ?? ''}</span>
      </p>-->
      <p>${r.description ?? ''}</p>
      <a href="${r.url ?? '#'}" target="_blank" rel="noopener noreferrer"><button class="btn-small">Voir</button></a>
    `;

    return card;
  }

  // Charger les ressources perso
  async function loadResources() {
    try {
      const res = await fetch('http://localhost:3000/api/me/resources', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/signup-login/login.html';
          return;
        }
        throw new Error('Erreur serveur');
      }

      const resources = await res.json();
      list.innerHTML = '';

      resources.forEach(r => {
        const card = renderResourceCard(r);
        list.appendChild(card);
      });
    } catch (e) {
      console.error(e);
      alert('Impossible de charger vos ressources');
    }
  }

  await loadResources();

  // Bouton "Nouvelle ressource"
  const newResourceBtn = document.getElementById('btn-new-resource');
  if (newResourceBtn) {
    newResourceBtn.addEventListener('click', async () => {
      const title = prompt('Titre de la ressource ?');
      if (!title) return;

      const url = prompt('URL de la ressource ?');
      if (!url) return;

      const description = prompt('Description rapide ?') || '';

      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/signup-login/login.html';
        return;
      }

      const API_BASE = window.location.origin;

      const res = await fetch('${API_BASE}/api/me/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, url, description })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Erreur lors de la création');
        return;
      }

      const created = await res.json();
      // Ajoute la nouvelle ressource en haut
      const card = renderResourceCard(created);
      list.prepend(card);
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/signup-login/login.html';
    });
  }

  // Bouton "Actualiser"
  const refreshBtn = document.getElementById('btn-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadResources);
  }
});
