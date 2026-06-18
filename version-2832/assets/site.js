(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobilePanel.classList.contains('open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function applyFilter(panel) {
    var scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var search = panel.querySelector('[data-filter-search]');
    var year = panel.querySelector('[data-filter-year]');
    var empty = document.querySelector('[data-empty-result]');
    var q = search ? search.value.trim().toLowerCase() : '';
    var y = year ? year.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matched = (!q || text.indexOf(q) > -1) && (!y || cardYear === y);
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  var panel = document.querySelector('[data-filter-panel]');
  if (panel) {
    var input = panel.querySelector('[data-filter-search]');
    var select = panel.querySelector('[data-filter-year]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (input && initial) {
      input.value = initial;
    }
    if (input) {
      input.addEventListener('input', function () {
        applyFilter(panel);
      });
    }
    if (select) {
      select.addEventListener('change', function () {
        applyFilter(panel);
      });
    }
    applyFilter(panel);
  }
})();
