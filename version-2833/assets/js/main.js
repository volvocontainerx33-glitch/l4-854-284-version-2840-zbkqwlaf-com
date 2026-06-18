(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var searchToggle = document.querySelector(".search-toggle");
        var searchPanel = document.querySelector(".search-panel");
        var searchInput = document.querySelector(".site-search-input");
        var menuToggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (searchToggle && searchPanel) {
            searchToggle.addEventListener("click", function () {
                searchPanel.classList.toggle("open");
                if (searchPanel.classList.contains("open") && searchInput) {
                    searchInput.focus();
                }
            });
        }

        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", function () {
                var value = searchInput.value.trim().toLowerCase();
                var cards = document.querySelectorAll("[data-search]");
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    if (!value || text.indexOf(value) !== -1) {
                        card.classList.remove("is-filtered-out");
                        if (card.parentElement && card.parentElement.classList.contains("rank-row")) {
                            card.parentElement.classList.remove("is-filtered-out");
                        }
                    } else {
                        card.classList.add("is-filtered-out");
                        if (card.parentElement && card.parentElement.classList.contains("rank-row")) {
                            card.parentElement.classList.add("is-filtered-out");
                        }
                    }
                });
            });
        }
    });
})();
