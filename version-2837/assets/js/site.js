(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }

    callback();
  }

  function setupMobileNavigation() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      var isOpen = nav.classList.contains('is-open');
      button.setAttribute('aria-label', isOpen ? '关闭导航' : '打开导航');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prevButton = carousel.querySelector('[data-hero-prev]');
    var nextButton = carousel.querySelector('[data-hero-next]');
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(currentIndex - 1);
        startTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(currentIndex + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(nextIndex);
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function collectOptions(cards, attributeName) {
    var values = [];
    var seen = Object.create(null);

    cards.forEach(function (card) {
      var value = card.getAttribute(attributeName);

      if (value && !seen[value]) {
        seen[value] = true;
        values.push(value);
      }
    });

    values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });

    return values;
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var filterPanel = document.querySelector('.filter-panel');
    var list = document.querySelector('[data-filter-list]');

    if (!filterPanel || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var keywordInput = filterPanel.querySelector('[data-filter-input]');
    var yearSelect = filterPanel.querySelector('[data-year-filter]');
    var typeSelect = filterPanel.querySelector('[data-type-filter]');
    var categorySelect = filterPanel.querySelector('[data-category-filter]');
    var result = filterPanel.querySelector('[data-filter-result]');

    fillSelect(yearSelect, collectOptions(cards, 'data-year'));
    fillSelect(typeSelect, collectOptions(cards, 'data-type'));

    function applyFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchText = card.getAttribute('data-search') || '';
        var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var matchesCategory = !category || card.getAttribute('data-category') === category;
        var shouldShow = matchesKeyword && matchesYear && matchesType && matchesCategory;

        card.classList.toggle('is-hidden', !shouldShow);

        if (shouldShow) {
          visibleCount += 1;
        }
      });

      if (result) {
        result.textContent = '当前显示 ' + visibleCount + ' 部影片，共 ' + cards.length + ' 部';
      }
    }

    [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (!control) {
        return;
      }

      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });

    applyFilter();
  }


  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing-image');
      }, { once: true });
    });
  }

  function setupHlsPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video[data-src]');
      var playButton = player.querySelector('[data-play-button]');
      var status = player.querySelector('[data-player-status]');
      var hlsInstance = null;
      var isSourceAttached = false;

      if (!video) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        var source = video.getAttribute('data-src');

        if (!source || isSourceAttached) {
          return;
        }

        isSourceAttached = true;

        if (source.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('视频已就绪，可以播放。');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setStatus('视频加载失败，请稍后重试。');
            }
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('浏览器播放已就绪。');
          return;
        }

        video.src = source;
        setStatus('视频源已准备，浏览器将尝试播放。');
      }

      attachSource();

      if (playButton) {
        playButton.addEventListener('click', function () {
          attachSource();

          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              setStatus('浏览器阻止了自动播放，请使用播放器控件再次点击播放。');
            });
          }
        });
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        setStatus('正在播放。');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
        setStatus('播放结束。');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupFilters();
    setupImageFallbacks();
    setupHlsPlayers();
  });
})();
