// ═══════════════════════════════════════════════════
// PIXEL FOOTBALL — MP3 hudba
// ═══════════════════════════════════════════════════
(function () {
  let audio = null;
  let playing = false;

  function init() {
    if (audio) return;
    audio = new Audio('assets/music.mp3');
    audio.loop = true;
    audio.volume = 0.4;
  }

  function start() {
    init();
    audio.play().then(() => {
      playing = true;
      updateBtn(true);
      localStorage.setItem('pft_sound', '1');
    }).catch(e => {
      console.warn('Audio autoplay blocked:', e);
    });
  }

  function stop() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    playing = false;
    updateBtn(false);
    localStorage.setItem('pft_sound', '0');
  }

  function updateBtn(on) {
    const btn = document.getElementById('tb-sound');
    if (btn) btn.textContent = on ? '🔊' : '🔇';
  }

  window.toggleSound = function () {
    playing ? stop() : start();
  };

  window.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('tb-sound');
    if (btn) btn.addEventListener('click', window.toggleSound);
  });
})();
