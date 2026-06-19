(function () {
    const header = document.querySelector('[data-header]');
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const navWrap = document.querySelector('[data-nav-wrap]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuToggle && navWrap) {
        menuToggle.addEventListener('click', function () {
            navWrap.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let active = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains('is-active');
        }));
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        startTimer();
    }

    const filterPanels = Array.from(document.querySelectorAll('[data-filter-panel]'));
    filterPanels.forEach(function (panel) {
        const scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
        const cards = Array.from(scope.querySelectorAll('.movie-card'));
        const keywordInput = panel.querySelector('[data-filter-keyword]');
        const regionSelect = panel.querySelector('[data-filter-region]');
        const yearSelect = panel.querySelector('[data-filter-year]');
        const noResults = document.querySelector('[data-no-results]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filterCards() {
            const keyword = normalize(keywordInput ? keywordInput.value : '');
            const region = normalize(regionSelect ? regionSelect.value : '');
            const year = normalize(yearSelect ? yearSelect.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                const regionOk = !region || normalize(card.dataset.region) === region;
                const yearOk = !year || normalize(card.dataset.year) === year;
                const keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
                const isVisible = regionOk && yearOk && keywordOk;
                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visible += 1;
                }
            });

            if (noResults) {
                noResults.classList.toggle('is-visible', visible === 0);
            }
        }

        [keywordInput, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query && keywordInput) {
            keywordInput.value = query;
        }
        filterCards();
    });

    const video = document.getElementById('movie-video');
    const playButton = document.getElementById('play-toggle');
    const configElement = document.getElementById('player-config');

    if (video && playButton && configElement) {
        let started = false;
        let hlsInstance = null;

        function readConfig() {
            try {
                return JSON.parse(configElement.textContent || '{}');
            } catch (error) {
                return {};
            }
        }

        function attachSource(source) {
            if (!source) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = source;
        }

        function startVideo(event) {
            if (event) {
                event.preventDefault();
            }
            const config = readConfig();
            if (!started) {
                attachSource(config.url);
                started = true;
            }
            playButton.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        playButton.addEventListener('click', startVideo);
        video.addEventListener('click', function () {
            if (!started) {
                startVideo();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
