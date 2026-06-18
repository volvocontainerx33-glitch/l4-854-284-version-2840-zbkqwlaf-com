(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initHero() {
    var hero = document.querySelector('[data-hero-slider]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
        dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        play();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initSearchPage() {
    var resultBox = document.querySelector('[data-search-results]');
    if (!resultBox || !window.MOVIE_DATA) {
      return;
    }

    var keywordInput = document.querySelector('[data-search-keyword]');
    var regionSelect = document.querySelector('[data-search-region]');
    var typeSelect = document.querySelector('[data-search-type]');
    var yearSelect = document.querySelector('[data-search-year]');
    var genreSelect = document.querySelector('[data-search-genre]');
    var summary = document.querySelector('[data-search-summary]');
    var data = window.MOVIE_DATA;

    function fillSelect(select, key, label) {
      if (!select) {
        return;
      }
      var values = Array.from(new Set(data.map(function (item) {
        return item[key];
      }).filter(Boolean))).sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-Hans-CN');
      });
      select.innerHTML = '<option value="">' + label + '</option>' + values.map(function (value) {
        return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function getQueryParam(name) {
      var params = new URLSearchParams(window.location.search);
      return params.get(name) || '';
    }

    function cardTemplate(item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + escapeHtml(item.detailPath) + '">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + ' 海报" loading="lazy">',
        '    <span class="poster-gradient"></span>',
        '    <span class="card-badge">' + escapeHtml(item.type) + '</span>',
        '    <span class="play-hover"><span>▶</span></span>',
        '  </a>',
        '  <div class="movie-body">',
        '    <h2 class="movie-title"><a href="' + escapeHtml(item.detailPath) + '">' + escapeHtml(item.title) + '</a></h2>',
        '    <p class="movie-desc">' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="card-meta">',
        '      <span>★ ' + escapeHtml(item.rating) + '</span>',
        '      <span>' + escapeHtml(item.region) + '</span>',
        '      <span>' + escapeHtml(item.year) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function filter() {
      var keyword = normalizeText(keywordInput && keywordInput.value);
      var region = regionSelect && regionSelect.value;
      var type = typeSelect && typeSelect.value;
      var year = yearSelect && yearSelect.value;
      var genre = genreSelect && genreSelect.value;

      var results = data.filter(function (item) {
        var haystack = normalizeText([
          item.title,
          item.oneLine,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags
        ].join(' '));
        return (!keyword || haystack.indexOf(keyword) !== -1)
          && (!region || item.region === region)
          && (!type || item.type === type)
          && (!year || item.year === year)
          && (!genre || item.genre.indexOf(genre) !== -1 || item.tags.indexOf(genre) !== -1);
      });

      var limited = results.slice(0, 120);
      resultBox.innerHTML = limited.map(cardTemplate).join('');
      if (summary) {
        summary.textContent = '共匹配 ' + results.length + ' 部内容，当前显示前 ' + limited.length + ' 部。';
      }
    }

    fillSelect(regionSelect, 'region', '全部地区');
    fillSelect(typeSelect, 'type', '全部类型');
    fillSelect(yearSelect, 'year', '全部年份');

    if (genreSelect) {
      var genreValues = Array.from(new Set(data.flatMap(function (item) {
        return item.genreTokens || [];
      }))).sort(function (a, b) {
        return a.localeCompare(b, 'zh-Hans-CN');
      });
      genreSelect.innerHTML = '<option value="">全部题材</option>' + genreValues.map(function (value) {
        return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
      }).join('');
    }

    if (keywordInput) {
      keywordInput.value = getQueryParam('q');
    }

    [keywordInput, regionSelect, typeSelect, yearSelect, genreSelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', filter);
      control.addEventListener('change', filter);
    });

    filter();
  }

  function initBackTop() {
    var link = document.querySelector('[data-back-top]');
    if (!link) {
      return;
    }
    link.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ready(function () {
    initHero();
    initSearchPage();
    initBackTop();
  });
})();
