(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupHeader() {
        var searchButton = document.querySelector(".search-toggle");
        var searchPanel = document.querySelector(".header-search");
        var menuButton = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (searchButton && searchPanel) {
            searchButton.addEventListener("click", function () {
                var open = searchPanel.classList.toggle("is-open");
                searchPanel.setAttribute("aria-hidden", open ? "false" : "true");
                var input = searchPanel.querySelector("input");
                if (open && input) {
                    input.focus();
                }
            });
        }
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer;
        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(i);
                play();
            });
        });
        show(0);
        play();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var section = scope.closest(".section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var input = scope.querySelector(".filter-input");
            var region = scope.querySelector(".filter-region");
            var year = scope.querySelector(".filter-year");
            var empty = section.querySelector(".filter-empty");
            var params = new URLSearchParams(window.location.search);
            if (input && params.get("q")) {
                input.value = params.get("q");
            }
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var search = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
                    var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                    var matchKeyword = !keyword || search.indexOf(keyword) !== -1;
                    var matchRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
                    var matchYear = !yearValue || cardYear.indexOf(yearValue) !== -1;
                    var matched = matchKeyword && matchRegion && matchYear;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [input, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupAnchors() {
        Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (link) {
            link.addEventListener("click", function (event) {
                var target = document.querySelector(link.getAttribute("href"));
                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    }

    function initPlayer(source) {
        ready(function () {
            var player = document.querySelector(".watch-player");
            if (!player || !source) {
                return;
            }
            var video = player.querySelector("video");
            var overlay = player.querySelector(".play-overlay");
            var hls;
            function start() {
                if (!video) {
                    return;
                }
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.setAttribute("controls", "controls");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (video.getAttribute("src") !== source) {
                        video.setAttribute("src", source);
                    }
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    if (!hls) {
                        hls = new window.Hls({
                            maxBufferLength: 30,
                            enableWorker: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.play().catch(function () {});
                    }
                    return;
                }
                if (video.getAttribute("src") !== source) {
                    video.setAttribute("src", source);
                }
                video.play().catch(function () {});
            }
            if (overlay) {
                overlay.addEventListener("click", start);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        start();
                    }
                });
            }
        });
    }

    ready(function () {
        setupHeader();
        setupHero();
        setupFilters();
        setupAnchors();
    });

    window.VideoPlay = {
        init: initPlayer
    };
})();
