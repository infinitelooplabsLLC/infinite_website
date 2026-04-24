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

  const seamSvg = document.getElementById('seam-svg');
  const seamPath = document.getElementById('seam-path');
  const main = document.querySelector('.main');

  if (seamSvg && seamPath && main) {
    let pathLength = 0;

    function buildSeam() {
      const first = document.querySelector('.stanza');
      const last = document.querySelector('.line.is-final');

      const mainRect = main.getBoundingClientRect();
      const firstRect = first.getBoundingClientRect();
      const lastRect = last.getBoundingClientRect();

      const topOffset = firstRect.top - mainRect.top;
      const h = lastRect.bottom - firstRect.top;

      seamSvg.style.top = topOffset + 'px';
      seamSvg.setAttribute('height', h);

      const cx = 12, amp = 10, period = 72;
      const count = Math.ceil(h / period);
      let d = `M ${cx} 0`;
      for (let i = 0; i < count; i++) {
        const y0 = i * period;
        const y3 = Math.min((i + 1) * period, h);
        const span = y3 - y0;
        const x1 = i % 2 === 0 ? cx - amp : cx + amp;
        const x2 = i % 2 === 0 ? cx + amp : cx - amp;
        d += ` C ${x1} ${y0 + span / 3} ${x2} ${y0 + 2 * span / 3} ${cx} ${y3}`;
      }

      seamPath.setAttribute('d', d);
      pathLength = seamPath.getTotalLength();
      seamPath.style.strokeDasharray = pathLength;
      seamPath.style.strokeDashoffset = pathLength;
    }

    function updateSeam() {
      if (!pathLength) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      seamPath.style.strokeDashoffset = pathLength * (1 - progress);
    }

    buildSeam();
    // updateSeam intentionally not called on load — seam is hidden until the user scrolls

    window.addEventListener('scroll', updateSeam, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { buildSeam(); updateSeam(); }, 150);
    });
  }
})();
