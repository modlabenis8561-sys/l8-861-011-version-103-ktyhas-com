import { H as Hls } from "./hls.js";

const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

ready(() => {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
});

function setupMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener("click", () => {
        nav.classList.toggle("is-open");
    });
}

function setupHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(current + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            show(index);
            start();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            show(current - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            show(current + 1);
            start();
        });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
}

function setupLocalFilters() {
    const input = document.querySelector("[data-local-filter]");
    if (!input) {
        return;
    }
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const empty = document.querySelector("[data-empty-state]");
    const apply = () => {
        const query = input.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
            const text = (card.getAttribute("data-search") || "").toLowerCase();
            const match = !query || text.includes(query);
            card.hidden = !match;
            if (match) {
                visible += 1;
            }
        });
        if (empty) {
            empty.hidden = visible !== 0;
        }
    };
    input.addEventListener("input", apply);
    apply();
}

function setupSearchPage() {
    const results = document.querySelector("[data-search-results]");
    if (!results) {
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const input = document.querySelector("[data-search-page-input]");
    if (input) {
        input.value = query;
    }
    const cards = Array.from(results.querySelectorAll("[data-card]"));
    const empty = document.querySelector("[data-empty-state]");
    const apply = () => {
        const value = (input ? input.value : query).trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
            const text = (card.getAttribute("data-search") || "").toLowerCase();
            const match = !value || text.includes(value);
            card.hidden = !match;
            if (match) {
                visible += 1;
            }
        });
        if (empty) {
            empty.hidden = visible !== 0;
        }
    };
    if (input) {
        input.addEventListener("input", apply);
    }
    apply();
}

function setupPlayers() {
    const players = Array.from(document.querySelectorAll("[data-player]"));
    players.forEach((player) => {
        const video = player.querySelector("video");
        const trigger = player.querySelector("[data-play-trigger]");
        const url = player.getAttribute("data-video-url");
        let loaded = false;
        let hls = null;

        const attach = () => {
            if (loaded || !video || !url) {
                return;
            }
            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, (eventName, data) => {
                    if (data && data.fatal && hls) {
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            }
            loaded = true;
        };

        const play = () => {
            attach();
            player.classList.add("is-playing");
            video.play().catch(() => {
                player.classList.remove("is-playing");
            });
        };

        if (trigger) {
            trigger.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("play", () => player.classList.add("is-playing"));
            video.addEventListener("pause", () => {
                if (!video.ended) {
                    player.classList.remove("is-playing");
                }
            });
            video.addEventListener("click", () => {
                if (video.paused) {
                    play();
                }
            });
        }

        window.addEventListener("pagehide", () => {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
}
