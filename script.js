// Mobile nav toggle
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

// ─────────────────────────────────────────────
// Calibrated Signal:
//   Foreground = fixed teal pattern (the locked target shape)
//   Background = same pattern, scrolling in greyscale
//   Every 4 seconds they naturally align → both flash yellow
// ─────────────────────────────────────────────
(function calibSignal() {
  const container = document.getElementById('calibBars');
  if (!container) return;

  const N = parseInt(container.dataset.bars || '48', 10);

  // Fixed target pattern — bell curve (peaks at center, tapers to edges)
  // with asymmetric noise so left and right sides aren't a mirror.
  const pattern = [];
  const center = (N - 1) / 2;
  const sigma = N / 3.2;
  for (let i = 0; i < N; i++) {
    const x = (i - center) / sigma;
    const bell = 14 + 84 * Math.exp(-0.5 * x * x);   // taller peak, lower edges
    const noise = 8 * Math.sin(i * 0.71 + 0.4) + 4 * Math.sin(i * 1.37 + 1.1);
    pattern.push(Math.max(12, Math.min(98, Math.round(bell + noise))));
  }

  // Per-bar hue: rainbow gradient (yellow → red → magenta → purple → blue → cyan)
  function hueAt(i) {
    return ((60 - (i / (N - 1)) * 240) + 360) % 360;
  }

  // Build DOM — fg height is set once and never changes; only bg moves.
  container.innerHTML = '';
  const cols = [];
  for (let i = 0; i < N; i++) {
    const col = document.createElement('div');
    col.className = 'calib-col';
    col.style.setProperty('--hue', hueAt(i));
    col.innerHTML = `
      <div class="calib-bg" style="--h:${pattern[i]}%"></div>
      <div class="calib-fg" style="--h:${pattern[i]}%"></div>
    `;
    container.appendChild(col);
    cols.push(col);
  }

  // Animation timing: tune so bg completes one full cycle in ~4 seconds.
  const SCROLL_DURATION_MS = 4000;
  const TICK_MS = Math.round(SCROLL_DURATION_MS / N);  // ≈ 62ms at N=64
  const MATCH_HOLD_MS = 1000;  // freeze + yellow flash duration

  let scroll = 0;
  let frozenUntil = 0;

  function step() {
    const now = performance.now();

    // While frozen (matching), do nothing — pattern stays aligned, color stays yellow.
    if (now < frozenUntil) return;

    // Just unfroze: clear the matched state and resume scrolling
    if (frozenUntil > 0 && now >= frozenUntil) {
      cols.forEach(col => col.classList.remove('matched'));
      frozenUntil = 0;
    }

    scroll = (scroll + 1) % N;

    // Update only background heights (foreground stays fixed)
    cols.forEach((col, i) => {
      const bg = col.querySelector('.calib-bg');
      bg.style.setProperty('--h', pattern[(i + scroll) % N] + '%');
    });

    // When scroll wraps to 0, bg pattern aligns with fg → freeze + flash yellow
    if (scroll === 0) {
      cols.forEach(col => col.classList.add('matched'));
      frozenUntil = now + MATCH_HOLD_MS;
    }
  }

  // Reduced motion: just show the matched state
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    cols.forEach(col => col.classList.add('matched'));
    return;
  }

  // Start aligned: show one match flash, freeze for hold, then begin scrolling
  cols.forEach(col => col.classList.add('matched'));
  frozenUntil = performance.now() + MATCH_HOLD_MS;

  setInterval(step, TICK_MS);
})();
