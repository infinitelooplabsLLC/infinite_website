// infinite loop labs — runtime
document.getElementById('year').textContent = new Date().getFullYear();

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

  // stanza fade-in
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

  // gold seam — draw on scroll
  const seamSvg = document.getElementById('seam-svg');
  const seamPath = document.getElementById('seam-path');
  const main = document.querySelector('.main');

  if (seamSvg && seamPath && main) {
    let pathLength = 0;

    function buildSeam() {
      const h = main.scrollHeight;
      seamSvg.setAttribute('height', h);

      // wavy path: S-curves down the left edge
      const cx = 12, amp = 6, period = 110;
      const count = Math.ceil(h / period);
      let d = `M ${cx} 0`;
      for (let i = 0; i < count; i++) {
        const y0 = i * period;
        const x1 = i % 2 === 0 ? cx - amp : cx + amp;
        const x2 = i % 2 === 0 ? cx + amp : cx - amp;
        d += ` C ${x1} ${y0 + period / 3} ${x2} ${y0 + (2 * period) / 3} ${cx} ${y0 + period}`;
      }

      seamPath.setAttribute('d', d);
      pathLength = seamPath.getTotalLength();
      seamPath.style.strokeDasharray = pathLength;
      seamPath.style.strokeDashoffset = pathLength;
    }

    function updateSeam() {
      if (!pathLength) return;
      const mainTop = main.getBoundingClientRect().top + window.scrollY;
      const scrolled = window.scrollY - mainTop + window.innerHeight * 0.65;
      const progress = Math.max(0, Math.min(1, scrolled / main.scrollHeight));
      seamPath.style.strokeDashoffset = pathLength * (1 - progress);
    }

    buildSeam();
    updateSeam();

    window.addEventListener('scroll', updateSeam, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { buildSeam(); updateSeam(); }, 150);
    });
  }
})();
