(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 22) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var search = scope.querySelector('[data-movie-search]');
    var region = scope.querySelector('[data-region-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var year = scope.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
    var empty = scope.querySelector('[data-empty]');

    function textOf(input) {
      return input ? input.value.trim().toLowerCase() : '';
    }

    function matchCard(card) {
      var keyword = textOf(search);
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (regionValue && (card.getAttribute('data-region') || '').indexOf(regionValue) === -1) {
        return false;
      }
      if (typeValue && (card.getAttribute('data-type') || '').indexOf(typeValue) === -1) {
        return false;
      }
      if (yearValue && card.getAttribute('data-year') !== yearValue) {
        return false;
      }
      return true;
    }

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var visible = matchCard(card);
        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && search) {
      search.value = q;
    }
    apply();
  });

  document.querySelectorAll('[data-player]').forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('[data-play]');
    if (!video || !button) {
      return;
    }
    var source = video.querySelector('source');
    var url = frame.getAttribute('data-url') || (source ? source.getAttribute('src') : '');
    var ready = false;
    var hls = null;

    function attach() {
      if (ready || !url) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = url;
      } else {
        video.src = url;
      }
      ready = true;
      frame.classList.add('is-ready');
    }

    function play() {
      attach();
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      frame.classList.add('is-ready');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
