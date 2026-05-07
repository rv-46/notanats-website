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
// Calibrated Signal: animated pattern matching
// ─────────────────────────────────────────────
(function calibSignal() {
  const container = document.getElementById('calibBars');
  if (!container) return;

  const targets = container.dataset.targets.split(',').map(Number);
  const N = targets.length;

  // Build DOM: each "bar" is a column with a background ghost (target shape)
  // and a foreground bar (animated). When fg height matches bg target, both flash.
  container.innerHTML = '';
  const bars = [];
  targets.forEach((t) => {
    const col = document.createElement('div');
    col.className = 'calib-col';
    col.innerHTML = `
      <div class="calib-bg" style="--h:${t}%"></div>
      <div class="calib-fg" style="--h:0%"></div>
    `;
    container.appendChild(col);
    bars.push(col);
  });

  let tick = 0;
  const TICK_MS = 1000;       // 1 second per cycle
  const MATCH_EVERY = 4;       // match once every 4 ticks (every 4 seconds)
  const MATCH_HOLD_MS = 700;   // how long the "matched" flash lasts

  function rand(min, max) { return Math.floor(min + Math.random() * (max - min)); }

  function animate() {
    tick++;
    const isMatch = tick % MATCH_EVERY === 0;

    bars.forEach((col, i) => {
      const fg = col.querySelector('.calib-fg');
      if (isMatch) {
        // Snap to target
        fg.style.setProperty('--h', targets[i] + '%');
        col.classList.add('matched');
      } else {
        // Random fluctuation, biased away from target
        let h;
        do {
          h = rand(15, 90);
        } while (Math.abs(h - targets[i]) < 12);
        fg.style.setProperty('--h', h + '%');
        col.classList.remove('matched');
      }
    });

    if (isMatch) {
      setTimeout(() => {
        bars.forEach(col => col.classList.remove('matched'));
      }, MATCH_HOLD_MS);
    }
  }

  // Initial random state
  bars.forEach((col, i) => {
    const fg = col.querySelector('.calib-fg');
    fg.style.setProperty('--h', rand(15, 70) + '%');
  });

  // Respect reduced motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    bars.forEach((col, i) => {
      const fg = col.querySelector('.calib-fg');
      fg.style.setProperty('--h', targets[i] + '%');
      col.classList.add('matched');
    });
    return;
  }

  setInterval(animate, TICK_MS);
})();
