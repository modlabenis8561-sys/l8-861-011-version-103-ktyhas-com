(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-mobile-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
                document.body.classList.toggle("is-menu-open", mobileNav.classList.contains("is-open"));
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });

            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get("q") || "";
        var filterInput = document.querySelector("[data-filter-input]");
        var filterCategory = document.querySelector("[data-filter-category]");
        var filterYear = document.querySelector("[data-filter-year]");
        var filterRegion = document.querySelector("[data-filter-region]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        if (cards.length && (filterInput || filterCategory || filterYear || filterRegion)) {
            var years = [];
            var regions = [];

            cards.forEach(function (card) {
                var year = card.getAttribute("data-year") || "";
                var region = card.getAttribute("data-region") || "";

                if (year && years.indexOf(year) === -1) {
                    years.push(year);
                }

                if (region && regions.indexOf(region) === -1) {
                    regions.push(region);
                }
            });

            years.sort().reverse();
            regions.sort();

            if (filterYear) {
                years.forEach(function (year) {
                    var option = document.createElement("option");
                    option.value = year;
                    option.textContent = year;
                    filterYear.appendChild(option);
                });
            }

            if (filterRegion) {
                regions.forEach(function (region) {
                    var option = document.createElement("option");
                    option.value = region;
                    option.textContent = region;
                    filterRegion.appendChild(option);
                });
            }

            if (filterInput && queryFromUrl) {
                filterInput.value = queryFromUrl;
            }

            function applyFilters() {
                var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
                var category = filterCategory ? filterCategory.value : "";
                var year = filterYear ? filterYear.value : "";
                var region = filterRegion ? filterRegion.value : "";

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }

                    if (category && card.getAttribute("data-category") !== category) {
                        matched = false;
                    }

                    if (year && card.getAttribute("data-year") !== year) {
                        matched = false;
                    }

                    if (region && card.getAttribute("data-region") !== region) {
                        matched = false;
                    }

                    card.classList.toggle("is-hidden", !matched);
                });
            }

            [filterInput, filterCategory, filterYear, filterRegion].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        }
    });
})();
