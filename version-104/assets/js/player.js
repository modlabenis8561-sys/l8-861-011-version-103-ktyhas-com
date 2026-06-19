import { H as Hls } from "./hls-vendor-dru42stk.js";

var video = document.querySelector("[data-player-video]");
var overlay = document.querySelector("[data-player-overlay]");
var playButton = document.querySelector("[data-play-button]");

if (video) {
    var streamUrl = video.getAttribute("data-stream-url");
    var hlsInstance = null;
    var attached = false;

    function attachStream() {
        if (attached || !streamUrl) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playMovie() {
        attachStream();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var playback = video.play();
        if (playback && typeof playback.catch === "function") {
            playback.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", playMovie);
    }

    if (playButton) {
        playButton.addEventListener("click", playMovie);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playMovie();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
