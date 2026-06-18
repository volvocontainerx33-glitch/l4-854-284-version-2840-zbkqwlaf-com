(function () {
  function startPlayback(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-mask');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-src');
    if (!url) {
      return;
    }
    if (!video.src) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        box.hlsInstance = hls;
      } else {
        video.src = url;
      }
    }
    if (button) {
      button.classList.add('is-hidden');
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  document.querySelectorAll('.player-card').forEach(function (box) {
    var button = box.querySelector('.play-mask');
    var video = box.querySelector('video');
    if (button) {
      button.addEventListener('click', function () {
        startPlayback(box);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback(box);
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
})();
