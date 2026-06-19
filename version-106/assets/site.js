(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = mobile.hasAttribute("hidden");
      if (opened) {
        mobile.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "×";
      } else {
        mobile.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      }
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dotsWrap = document.querySelector("[data-hero-dots]");
    if (!slides.length || !dotsWrap) {
      return;
    }
    var index = 0;
    var timer = null;

    function setActive(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-pressed", dotIndex === index ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setActive(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    slides.forEach(function (_, slideIndex) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "切换推荐影片");
      dot.addEventListener("click", function () {
        setActive(slideIndex);
        start();
      });
      dotsWrap.appendChild(dot);
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    setActive(0);
    start();
  }

  function setupLocalFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var scope = document.querySelector(form.getAttribute("data-filter-form"));
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      function apply() {
        var keyword = (form.querySelector("[name='keyword']") || {}).value || "";
        var type = (form.querySelector("[name='type']") || {}).value || "";
        var year = (form.querySelector("[name='year']") || {}).value || "";
        keyword = keyword.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.type].join(" ").toLowerCase();
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedType = !type || card.dataset.type === type;
          var matchedYear = !year || card.dataset.year === year;
          card.hidden = !(matchedKeyword && matchedType && matchedYear);
        });
      }
      form.addEventListener("input", apply);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    });
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-page]");
    if (!root || !form || !window.MOVIES_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var qInput = form.querySelector("[name='q']");
    var typeInput = form.querySelector("[name='type']");
    var yearInput = form.querySelector("[name='year']");
    var note = document.querySelector("[data-search-note]");
    qInput.value = params.get("q") || "";

    function render() {
      var q = qInput.value.trim().toLowerCase();
      var type = typeInput.value;
      var year = yearInput.value;
      var list = window.MOVIES_INDEX.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(" ").toLowerCase();
        var matchedQ = !q || text.indexOf(q) !== -1;
        var matchedType = !type || movie.type === type;
        var matchedYear = !year || movie.year === year;
        return matchedQ && matchedType && matchedYear;
      }).slice(0, 120);
      root.innerHTML = list.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
          '    <img loading="lazy" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
          '    <span class="poster-play">▶</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <div class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
          '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '  </div>',
          '</article>'
        ].join("");
      }).join("");
      if (note) {
        note.textContent = list.length ? "已筛选出相关影片" : "没有找到匹配内容，请更换关键词或筛选条件";
      }
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>\"]/g, function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[character];
      });
    }

    form.addEventListener("input", render);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    render();
  }

  ready(function () {
    setupMenu();
    setupHeroSlider();
    setupLocalFilters();
    setupSearchPage();
  });
})();
