(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupHeader() {
    var header = qs("[data-header]");
    var toggle = qs("[data-menu-toggle]");
    var menu = qs("[data-mobile-menu]");

    function syncHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 18) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (toggle && menu && header) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("is-open");
        header.classList.toggle("is-open", open);
      });
    }
  }

  function setupHero() {
    var slider = qs("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = qsa(".hero-slide", slider);
    var dots = qsa("[data-hero-dot]", slider);
    var prev = qs("[data-hero-prev]", slider);
    var next = qs("[data-hero-next]", slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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
        show(Number(dot.getAttribute("data-hero-dot") || 0));
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

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupPosterFallback() {
    document.addEventListener(
      "error",
      function (event) {
        var target = event.target;
        if (!target || target.tagName !== "IMG") {
          return;
        }
        var shell = target.closest(".poster-shell");
        if (shell) {
          shell.classList.add("poster-missing");
          target.remove();
        }
      },
      true
    );
  }

  function setupFilters() {
    var bar = qs("[data-filter-bar]");
    var grid = qs("[data-filter-grid]");
    if (!bar || !grid) {
      return;
    }
    var cards = qsa(".movie-card", grid);
    qsa(".filter-chip", bar).forEach(function (button) {
      button.addEventListener("click", function () {
        qsa(".filter-chip", bar).forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        var kind = button.getAttribute("data-filter-kind");
        var value = button.getAttribute("data-filter-value");
        cards.forEach(function (card) {
          var show = kind === "all" || value === "all" || card.getAttribute("data-" + kind) === value;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\">" +
        "<a class=\"poster-shell\" href=\"" + escapeHtml(item.url) + "\" data-title=\"" + escapeHtml(item.title) + "\">" +
          "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + " 海报\" loading=\"lazy\">" +
          "<span class=\"poster-badge\">" + escapeHtml(item.year) + "</span>" +
          "<span class=\"poster-type\">" + escapeHtml(item.type) + "</span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
          "<div class=\"movie-meta-line\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.category) + "</span></div>" +
          "<h2><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h2>" +
          "<p>" + escapeHtml(item.oneLine) + "</p>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
      "</article>";
  }

  function setupSearch() {
    var results = qs("[data-search-results]");
    if (!results || typeof SITE_SEARCH_ITEMS === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var title = qs("[data-search-title]");
    var tip = qs("[data-search-tip]");
    var input = qs("[data-page-search] input[name='q']");
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = SITE_SEARCH_ITEMS.filter(function (item) {
      var haystack = [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(" "), item.oneLine].join(" ").toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 80);
    if (title) {
      title.textContent = "搜索结果";
    }
    if (tip) {
      tip.textContent = "关键词：“" + query + "”";
    }
    if (!matched.length) {
      results.innerHTML = "<div class=\"search-empty\">没有找到匹配影片，可以尝试更换片名、地区、类型或年份。</div>";
      return;
    }
    results.innerHTML = matched.map(movieCard).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupHeader();
    setupHero();
    setupPosterFallback();
    setupFilters();
    setupSearch();
  });
})();
