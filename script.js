/* ==========================================================================
   Romantic Love Letter & Memories Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientParticles();
  initAudioPlayer();
  initVideoPlayerControls();
});

/* --------------------------------------------------------------------------
   1. Ambient Dreamy Particles (Soft Petals / Stardust)
   -------------------------------------------------------------------------- */
function initAmbientParticles() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = window.innerWidth < 640 ? 18 : 32;
  const particles = [];

  const colors = [
    'rgba(244, 194, 194, 0.45)', // blush pink
    'rgba(235, 186, 179, 0.35)', // dusty rose
    'rgba(255, 238, 230, 0.55)', // soft ivory
    'rgba(215, 138, 134, 0.25)'  // deep rose hint
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3.5 + 1.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.4,
      vy: Math.random() * 0.5 + 0.2, // gently drifting downwards
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.015,
      scaleX: Math.random() * 0.6 + 0.6
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.x += p.vx + Math.sin(p.angle) * 0.3;
      p.y += p.vy;
      p.angle += p.angularSpeed;

      // Wrap around edges
      if (p.y > height + 10) {
        p.y = -10;
        p.x = Math.random() * width;
      }
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(p.scaleX, 1);

      ctx.beginPath();
      // Draw soft organic petal/oval shape
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  render();
}

/* --------------------------------------------------------------------------
   2. Audio Controller (Smooth Fade & Video Sync)
   -------------------------------------------------------------------------- */
let audioCtx = null;
let bgMusic = null;
let isMusicPlaying = false;
let musicWasPlayingBeforeVideo = false;

function initAudioPlayer() {
  bgMusic = document.getElementById('bgMusic');
  const toggleBtn = document.getElementById('musicToggleBtn');
  if (!bgMusic || !toggleBtn) return;

  bgMusic.volume = 0.55;

  function startMusic() {
    bgMusic.play().then(() => {
      isMusicPlaying = true;
      toggleBtn.classList.add('playing');
    }).catch(err => {
      console.log('Audio autoplay prevented:', err);
    });
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (bgMusic.paused) {
      startMusic();
    } else {
      bgMusic.pause();
      isMusicPlaying = false;
      toggleBtn.classList.remove('playing');
    }
  });

  // Try gentle start on first user tap/click on page
  const handleFirstInteraction = () => {
    if (bgMusic.paused && !isMusicPlaying) {
      startMusic();
    }
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
  };

  window.addEventListener('click', handleFirstInteraction, { once: true });
  window.addEventListener('touchstart', handleFirstInteraction, { once: true });
}

/* --------------------------------------------------------------------------
   3. Video Controller & Smart Interaction
   -------------------------------------------------------------------------- */
window.playVideo = function(videoId, overlayId) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);
  if (!video) return;

  if (overlay) {
    overlay.classList.add('hidden');
  }

  // Pause the other video if running
  const otherVideoId = videoId === 'video1' ? 'video2' : 'video1';
  const otherOverlayId = videoId === 'video1' ? 'overlay2' : 'overlay1';
  const otherVideo = document.getElementById(otherVideoId);
  const otherOverlay = document.getElementById(otherOverlayId);

  if (otherVideo && !otherVideo.paused) {
    otherVideo.pause();
  }

  // Handle background music ducking so video audio is clear
  if (bgMusic && !bgMusic.paused) {
    musicWasPlayingBeforeVideo = true;
    fadeMusic(bgMusic, 0, 400, () => bgMusic.pause());
  }

  video.play().catch(err => console.log('Video play error:', err));
};

function initVideoPlayerControls() {
  const videos = [document.getElementById('video1'), document.getElementById('video2')];

  videos.forEach((video, index) => {
    if (!video) return;
    const overlay = document.getElementById(`overlay${index + 1}`);

    // If video pauses or ends, show overlay back if at beginning
    video.addEventListener('pause', () => {
      // If user paused and both videos are paused, resume background music if it was playing
      checkAndResumeBgm();
    });

    video.addEventListener('ended', () => {
      if (overlay) overlay.classList.remove('hidden');
      checkAndResumeBgm();
    });

    video.addEventListener('play', () => {
      if (overlay) overlay.classList.add('hidden');
      
      // Pause other video
      const otherIdx = index === 0 ? 1 : 0;
      if (videos[otherIdx] && !videos[otherIdx].paused) {
        videos[otherIdx].pause();
      }

      // Duck background music
      if (bgMusic && !bgMusic.paused) {
        musicWasPlayingBeforeVideo = true;
        fadeMusic(bgMusic, 0, 400, () => bgMusic.pause());
      }
    });
  });
}

function checkAndResumeBgm() {
  const v1 = document.getElementById('video1');
  const v2 = document.getElementById('video2');
  const isV1Playing = v1 && !v1.paused;
  const isV2Playing = v2 && !v2.paused;

  if (!isV1Playing && !isV2Playing && musicWasPlayingBeforeVideo && bgMusic) {
    bgMusic.play().then(() => {
      fadeMusic(bgMusic, 0.45, 600);
      musicWasPlayingBeforeVideo = false;
      const toggleBtn = document.getElementById('musicToggleBtn');
      if (toggleBtn) toggleBtn.classList.add('playing');
    }).catch(err => console.log(err));
  }
}

function fadeMusic(audioEl, targetVol, durationMs, onComplete) {
  const startVol = audioEl.volume;
  const startTime = performance.now();

  function step(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    audioEl.volume = startVol + (targetVol - startVol) * progress;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      audioEl.volume = targetVol;
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(step);
}
