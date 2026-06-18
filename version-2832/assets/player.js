(function () {
  var video = document.getElementById('moviePlayer');
  if (!video) {
    return;
  }

  var cover = document.querySelector('.player-cover');
  var source = video.getAttribute('data-src');
  var attached = false;
  var hls = null;

  function attachSource() {
    if (attached || !source) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function startPlay() {
    attachSource();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var action = video.play();
    if (action && action.catch) {
      action.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlay);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls && hls.destroy) {
      hls.destroy();
    }
  });
})();
