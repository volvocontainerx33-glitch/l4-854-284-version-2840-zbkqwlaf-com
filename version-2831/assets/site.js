(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-Hans-CN");
    });
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) return;
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var slides = Array.from(hero.querySelectorAll(".hero-slide"));
    var dots = Array.from(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-control.prev");
    var next = hero.querySelector(".hero-control.next");
    if (!slides.length) return;
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 6500);
  }

  function setupFilters() {
    var panel = document.querySelector(".filter-panel");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) return;
    var cards = Array.from(grid.querySelectorAll(".movie-card-item"));
    var search = panel.querySelector(".filter-search");
    var year = panel.querySelector(".filter-year");
    var type = panel.querySelector(".filter-type");
    var sort = panel.querySelector(".sort-select");

    function fillSelect(select, values) {
      if (!select) return;
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(year, unique(cards.map(function (card) { return card.dataset.year; })));
    fillSelect(type, unique(cards.map(function (card) { return card.dataset.type; })));

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var y = year ? year.value : "all";
      var t = type ? type.value : "all";
      cards.forEach(function (card) {
        var matchText = !q || (card.dataset.text || "").toLowerCase().indexOf(q) !== -1 || (card.dataset.title || "").toLowerCase().indexOf(q) !== -1;
        var matchYear = y === "all" || card.dataset.year === y;
        var matchType = t === "all" || card.dataset.type === t;
        card.style.display = matchText && matchYear && matchType ? "" : "none";
      });
      var sorted = cards.slice();
      var mode = sort ? sort.value : "default";
      if (mode === "score") {
        sorted.sort(function (a, b) { return Number(b.dataset.score) - Number(a.dataset.score); });
      } else if (mode === "year") {
        sorted.sort(function (a, b) { return Number(b.dataset.year) - Number(a.dataset.year); });
      } else if (mode === "title") {
        sorted.sort(function (a, b) { return String(a.dataset.title).localeCompare(String(b.dataset.title), "zh-Hans-CN"); });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    [search, year, type, sort].forEach(function (control) {
      if (!control) return;
      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", apply);
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var grid = document.querySelector("#search-results");
    var title = document.querySelector("#search-title");
    if (!grid || !window.SEARCH_ITEMS) return;
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    if (title) {
      title.textContent = q ? "搜索结果：" + q : "搜索结果";
    }
    if (!q) {
      grid.innerHTML = '<div class="search-empty">请输入关键词后浏览相关内容。</div>';
      return;
    }
    var lower = q.toLowerCase();
    var matches = window.SEARCH_ITEMS.filter(function (item) {
      return String(item.text || "").toLowerCase().indexOf(lower) !== -1;
    });
    if (!matches.length) {
      grid.innerHTML = '<div class="search-empty">没有找到相关内容。</div>';
      return;
    }
    grid.innerHTML = matches.map(function (item) {
      return '<article class="movie-card-item movie-card">' +
        '<a class="movie-card-link" href="./' + escapeHtml(item.file) + '">' +
          '<div class="poster-wrap">' +
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="quality-badge">HD</span>' +
            '<span class="score-badge">' + escapeHtml(item.score) + '</span>' +
            '<div class="poster-mask"><span class="play-circle">▶</span></div>' +
          '</div>' +
          '<div class="movie-card-body">' +
            '<h3>' + escapeHtml(item.title) + '</h3>' +
            '<p>' + escapeHtml(item.desc) + '</p>' +
            '<div class="movie-meta-line"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '</div>' +
        '</a>' +
      '</article>';
    }).join("");
  }

  window.initMoviePlayer = function (streamUrl, videoId) {
    var video = document.getElementById(videoId);
    if (!video) return;
    var frame = video.closest(".video-frame");
    var overlay = frame ? frame.querySelector(".player-overlay") : null;
    var hasLoaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (hasLoaded) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      hasLoaded = true;
    }

    function start() {
      loadStream();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
