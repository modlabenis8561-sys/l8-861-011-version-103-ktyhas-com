(function () {
  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video[data-stream]");
      var start = shell.querySelector(".js-play");
      if (!video || !start) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var loaded = false;
      var hlsInstance = null;

      function loadStream() {
        if (loaded) {
          return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
          });
        }
        video.src = stream;
        return Promise.resolve();
      }

      function play() {
        shell.classList.add("is-loading");
        loadStream().then(function () {
          return video.play();
        }).then(function () {
          shell.classList.remove("is-loading");
          shell.classList.add("is-playing");
        }).catch(function () {
          shell.classList.remove("is-loading");
          shell.classList.remove("is-playing");
        });
      }

      start.addEventListener("click", play);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", setupPlayers);
})();
