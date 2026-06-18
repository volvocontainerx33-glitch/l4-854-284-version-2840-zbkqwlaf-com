(function () {
    var ready = function (callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
        applyQuerySearch();
    });

    function initNavigation() {
        var menuButton = document.querySelector(".js-menu-toggle");
        var mobileNav = document.querySelector(".js-mobile-nav");
        var searchButton = document.querySelector(".js-search-toggle");
        var topSearch = document.querySelector(".js-top-search");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        if (searchButton && topSearch) {
            searchButton.addEventListener("click", function () {
                topSearch.classList.toggle("is-open");
                var input = topSearch.querySelector("input");
                if (input && topSearch.classList.contains("is-open")) {
                    input.focus();
                }
            });
        }
    }

    function initHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-search-input"));
        var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));

        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                filterCards();
            });
        });

        bars.forEach(function (bar) {
            bar.addEventListener("click", function (event) {
                var button = event.target.closest("[data-filter]");
                if (!button) {
                    return;
                }
                bar.querySelectorAll("[data-filter]").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                filterCards();
            });
        });
    }

    function currentQuery() {
        var values = Array.prototype.slice.call(document.querySelectorAll(".js-search-input"))
            .map(function (input) {
                return input.value.trim().toLowerCase();
            })
            .filter(Boolean);
        return values[0] || "";
    }

    function currentFilter() {
        var active = document.querySelector("[data-filter].is-active");
        return active ? active.getAttribute("data-filter") : "*";
    }

    function filterCards() {
        var query = currentQuery();
        var filter = currentFilter();
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = (card.getAttribute("data-search") || "").toLowerCase();
            var type = card.getAttribute("data-type") || "";
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchFilter = filter === "*" || type === filter || haystack.indexOf(filter.toLowerCase()) !== -1;
            var shouldShow = matchQuery && matchFilter;
            card.hidden = !shouldShow;
            if (shouldShow) {
                visible += 1;
            }
        });

        Array.prototype.slice.call(document.querySelectorAll("[data-empty-state]")).forEach(function (state) {
            state.classList.toggle("is-visible", visible === 0 && cards.length > 0);
        });
    }

    function applyQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (!q) {
            return;
        }
        var input = document.querySelector(".js-search-input");
        var topSearch = document.querySelector(".js-top-search");
        if (input) {
            input.value = q;
            if (topSearch) {
                topSearch.classList.add("is-open");
            }
            filterCards();
        }
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video[data-stream]");
            var button = player.querySelector(".js-play");
            if (!video) {
                return;
            }

            attachStream(video);

            var start = function () {
                attachStream(video);
                player.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            };

            if (button) {
                button.addEventListener("click", start);
            }

            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove("is-playing");
                }
            });
        });
    }

    function attachStream(video) {
        if (video.dataset.ready === "1") {
            return;
        }
        var stream = video.getAttribute("data-stream");
        if (!stream) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.dataset.ready = "1";
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hls = hls;
            video.dataset.ready = "1";
            return;
        }

        video.src = stream;
        video.dataset.ready = "1";
    }
})();
