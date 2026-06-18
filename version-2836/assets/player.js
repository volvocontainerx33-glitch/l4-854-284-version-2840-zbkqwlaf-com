(function () {
  var configElement = document.getElementById('player-config');
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var playButton = document.querySelector('[data-play-button]');

  if (!configElement || !video || !overlay || !playButton) {
    return;
  }

  var config = JSON.parse(configElement.textContent || '{}');
  var hlsInstance = null;
  var initialized = false;

  function safePlay() {
    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  function attachSource() {
    if (!config.src) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.src;
      video.addEventListener('loadedmetadata', safePlay, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(config.src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, safePlay);
      return;
    }

    video.src = config.src;
    video.addEventListener('loadedmetadata', safePlay, { once: true });
    video.load();
  }

  function startPlayback() {
    overlay.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');

    if (!initialized) {
      initialized = true;
      attachSource();
      return;
    }

    safePlay();
  }

  playButton.addEventListener('click', startPlayback);
  overlay.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!initialized) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
