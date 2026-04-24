// infinite loop labs — runtime
document.getElementById('year').textContent = new Date().getFullYear();
// 1. Theme: follow system preference; theme-toggle cycles light → dark → system.
// 2. Reveal: stanzas + footer fade in as they enter the viewport.

(() => {
  const html = document.documentElement;
  const STORAGE_KEY = 'ill-theme';

  const applyTheme = (pref) => {
    if (pref === 'light' || pref === 'dark') html.setAttribute('data-theme', pref);
    else html.removeAttribute('data-theme');
  };

  const stored = (() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  })();
  applyTheme(stored);

  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    });
  }

  const targets = document.querySelectorAll('.stanza, .footer');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.15 });
    targets.forEach((t, i) => {
      t.style.transitionDelay = `${Math.min(i, 8) * 30}ms`;
      io.observe(t);
    });
  } else {
    targets.forEach((t) => t.classList.add('is-in'));
  }
})();
