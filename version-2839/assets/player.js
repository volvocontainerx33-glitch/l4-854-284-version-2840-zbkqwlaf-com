import { H as Hls } from './hls-local.js';

function setStatus(box, message) {
  if (box) {
    box.textContent = message;
  }
}

function createHlsPlayer(video, source, statusBox) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setStatus(statusBox, '已绑定原生 HLS 播放源');
    return null;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(statusBox, 'HLS 播放源加载完成');
    });
    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        setStatus(statusBox, '播放源加载异常，请稍后重试');
        hls.destroy();
      }
    });
    return hls;
  }

  setStatus(statusBox, '当前浏览器不支持 HLS 播放');
  return null;
}

function initPlayer(shell) {
  var video = shell.querySelector('video[data-hls]');
  var button = shell.querySelector('[data-play-button]');
  var statusBox = shell.querySelector('[data-player-status]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-hls');
  if (!source) {
    setStatus(statusBox, '未检测到播放源');
    return;
  }

  createHlsPlayer(video, source, statusBox);

  function playVideo() {
    shell.classList.add('is-playing');
    video.play().catch(function () {
      setStatus(statusBox, '浏览器阻止了自动播放，请再次点击播放按钮');
      shell.classList.remove('is-playing');
    });
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });
}

Array.prototype.slice.call(document.querySelectorAll('[data-video-shell]')).forEach(initPlayer);
