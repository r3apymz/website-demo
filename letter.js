// 1) Reveal paragraphs gradually, as they reach the screen.
document.documentElement.classList.add('js-enabled');

const revealElements = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach(element => element.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Reveal only once; don't hide after scrolling past.
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });

  revealElements.forEach((element, index) => {
    if (element.closest('.hero')) {
      element.style.setProperty('--delay', `${Math.min(index, 4) * 160}ms`);
    }
    observer.observe(element);
  });
}

// 2) Update the small progress line at the very top as the letter is read.
const progress = document.getElementById('reading-progress');
let scrollScheduled = false;
function updateReadingProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 100;
  progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    window.requestAnimationFrame(updateReadingProgress);
  }
}, { passive: true });
window.addEventListener('resize', updateReadingProgress);
updateReadingProgress();

// 3) Play/pause YOUR OWN song. Put music.mp3 beside letter.html.
const music = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const musicLabel = document.getElementById('music-label');
const musicStatus = document.getElementById('music-status');
music.volume = 0.45; // Change to anywhere from 0 (silent) to 1 (full volume).

function updateMusicButton() {
  const playing = !music.paused;
  musicToggle.classList.toggle('is-playing', playing);
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
  musicLabel.textContent = playing ? 'Pause music' : 'Play music';
}

async function playMusic() {
  try {
    await music.play();
    musicStatus.textContent = 'Music is playing.';
  } catch (error) {
    // Browsers may block autoplay. A tap on the button will usually allow it.
    musicStatus.textContent = 'Music could not start. Make sure music.mp3 exists, then tap Play music.';
  }
  updateMusicButton();
}

musicToggle.addEventListener('click', () => {
  if (music.paused) playMusic();
  else { music.pause(); updateMusicButton(); musicStatus.textContent = 'Music paused.'; }
});
music.addEventListener('play', updateMusicButton);
music.addEventListener('pause', updateMusicButton);
music.addEventListener('error', () => {
  musicStatus.textContent = 'Could not load music.mp3. Check the file name and location.';
});

// Try automatic playback when the letter page opens. Browser restrictions may
// prevent sound from starting, even if Submit was clicked on the previous page.
playMusic();
