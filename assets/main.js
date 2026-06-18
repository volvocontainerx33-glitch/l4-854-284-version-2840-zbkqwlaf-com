(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  var navToggle = qs('.nav-toggle');
  var mobileNav = qs('.mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var carousel = qs('[data-hero-carousel]');
  if (carousel) {
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    startTimer();
  }

  qsa('[data-page-filter], [data-page-year]').forEach(function (control) {
    control.addEventListener('input', filterCards);
    control.addEventListener('change', filterCards);
  });

  function filterCards() {
    var input = qs('[data-page-filter]');
    var yearSelect = qs('[data-page-year]');
    var query = normalize(input && input.value);
    var year = normalize(yearSelect && yearSelect.value);
    qsa('[data-card]').forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' '));
      var yearText = normalize(card.getAttribute('data-year'));
      var matchedText = !query || text.indexOf(query) !== -1;
      var matchedYear = !year || yearText === year;
      card.classList.toggle('is-hidden-card', !(matchedText && matchedYear));
    });
  }

  qsa('[data-site-search]').forEach(function (input) {
    var resultId = input.getAttribute('data-results');
    var resultBox = resultId ? document.getElementById(resultId) : null;
    input.addEventListener('input', function () {
      renderSearch(input, resultBox);
    });
  });

  qsa('[data-clear-search]').forEach(function (button) {
    button.addEventListener('click', function () {
      var wrap = button.closest('.site-search');
      var input = wrap && qs('[data-site-search]', wrap);
      var results = wrap && qs('.search-results', wrap);
      if (input) {
        input.value = '';
        input.focus();
      }
      if (results) {
        results.innerHTML = '';
      }
    });
  });

  function renderSearch(input, resultBox) {
    if (!resultBox || !Array.isArray(window.movieSearchItems)) {
      return;
    }
    var query = normalize(input.value);
    if (!query) {
      resultBox.innerHTML = '';
      return;
    }
    var items = window.movieSearchItems.filter(function (item) {
      return normalize(item.title + ' ' + item.genre + ' ' + item.region + ' ' + item.type + ' ' + item.tags).indexOf(query) !== -1;
    }).slice(0, 12);
    resultBox.innerHTML = items.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.genre) + ' · ' + escapeHtml(item.year) + '</small></span>' +
        '<em>' + escapeHtml(item.category) + '</em>' +
        '</a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }
})();
