(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.theme-toggle');
  const syncTheme = () => {
    const light = root.dataset.theme === 'light';
    toggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    toggle.setAttribute('aria-pressed', String(light));
    document.querySelector('meta[name="theme-color"]').content = light ? '#f9f9f6' : '#101112';
  };
  syncTheme();
  const changeTheme = () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('abhishek-theme', root.dataset.theme); } catch (_) { /* The toggle works without storage. */ }
    syncTheme();
  };
  let themeTransition;
  toggle.addEventListener('click', () => {
    if (themeTransition) themeTransition.skipTransition();
    if (document.startViewTransition && !reducedMotion.matches) {
      themeTransition = document.startViewTransition(changeTheme);
    } else changeTheme();
  });
  const clock = document.querySelector('#local-time');
  const formatter = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false});
  const updateTime = () => {
    const now = new Date();
    clock.textContent = formatter.format(now);
    clock.dateTime = now.toISOString();
  };
  updateTime();
  window.setInterval(updateTime, 60000);
  document.querySelector('#year').textContent = String(new Date().getFullYear());
  const openLinkedProject = () => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target && target.matches('details')) target.open = true;
  };
  window.addEventListener('hashchange', openLinkedProject);
  openLinkedProject();
  const art = document.querySelector('#hero-art');
  art.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    const rect = art.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    art.style.setProperty('--art-x', `${x * 10}px`);
    art.style.setProperty('--art-y', `${y * 7}px`);
    art.style.setProperty('--art-r', `${x * 1.2}deg`);
  });
  art.addEventListener('pointerleave', () => {
    art.style.setProperty('--art-x', '0px');
    art.style.setProperty('--art-y', '0px');
    art.style.setProperty('--art-r', '0deg');
  });

  const poster = document.querySelector('.video-poster');
  poster.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/_KaFS4Dxs5k?autoplay=1&rel=0';
    frame.title = 'Abhishek Chakravarty on Starter Story';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    document.querySelector('#interview-player').replaceChildren(frame);
    poster.remove();
    frame.focus();
  });

  const piano = document.querySelector('.piano');
  const pianoKeys = [...piano.querySelectorAll('.piano-key')];
  let audio;
  let master;
  const releaseTimers = new WeakMap();
  const playKey = async (key) => {
    window.clearTimeout(releaseTimers.get(key));
    key.classList.add('is-playing');
    releaseTimers.set(key, window.setTimeout(() => key.classList.remove('is-playing'), 240));
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) {
      document.querySelector('#piano-caption').textContent = 'Audio is unavailable in this browser.';
      return;
    }
    try {
      // iOS treats Web Audio as ambient sound by default, so silent mode mutes it.
      // Select media playback during the user's key action, when supported.
      try {
        if (navigator.audioSession) navigator.audioSession.type = 'playback';
      } catch (_) { /* Older browsers can still play with silent mode off. */ }
      if (!audio || audio.state === 'closed') {
        audio = new AudioEngine();
        master = audio.createGain();
        master.gain.value = 0.22;
        master.connect(audio.destination);
      }
      if (audio.state !== 'running') await audio.resume();
      document.querySelector('#piano-caption').textContent = 'Click or tap a key to play.';
      const frequency = 440 * Math.pow(2, (Number(key.dataset.note) - 69) / 12);
      const start = audio.currentTime;
      for (const [multiple, volume] of [[1, 0.52], [2, 0.16], [3, 0.06]]) {
        const oscillator = audio.createOscillator();
        const envelope = audio.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency * multiple;
        envelope.gain.setValueAtTime(0.0001, start);
        envelope.gain.exponentialRampToValueAtTime(volume, start + 0.008);
        envelope.gain.exponentialRampToValueAtTime(0.0001, start + 1.45 / Math.sqrt(multiple));
        oscillator.connect(envelope);
        envelope.connect(master);
        oscillator.start(start);
        oscillator.stop(start + 1.5);
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
      }
    } catch (_) {
      document.querySelector('#piano-caption').textContent = 'Sound could not start. Try another key.';
    }
  };
  pianoKeys.forEach((key) => key.addEventListener('click', () => playKey(key)));
  piano.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    const key = pianoKeys.find((item) => item.dataset.shortcut === event.key.toLowerCase());
    if (!key) return;
    event.preventDefault();
    playKey(key);
  });
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('nav a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach((link) => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    }, {rootMargin:'-10% 0px -60% 0px',threshold:0});
    sections.forEach((section) => observer.observe(section));
  }
})();
