(function () {
    function initMoviePlayer(source) {
        var video = document.getElementById("movie-video");
        var layer = document.getElementById("play-layer");
        var trigger = document.getElementById("play-trigger");
        var hlsInstance = null;
        var loaded = false;

        function hideLayer() {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        }

        function showLayer() {
            if (layer) {
                layer.classList.remove("is-hidden");
            }
        }

        function setMessage(text) {
            if (layer) {
                var strong = layer.querySelector("strong");
                if (strong) {
                    strong.textContent = text;
                }
            }
        }

        function tryPlay() {
            if (!video) {
                return;
            }
            hideLayer();
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {
                    showLayer();
                });
            }
        }

        function loadVideo() {
            if (!video || loaded) {
                return;
            }
            loaded = true;
            video.controls = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    tryPlay();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage("视频暂时无法播放，请稍后重试");
                        showLayer();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    tryPlay();
                }, { once: true });
                video.load();
            } else {
                setMessage("视频暂时无法播放，请稍后重试");
                showLayer();
            }
        }

        function start(event) {
            if (event) {
                event.preventDefault();
            }
            loadVideo();
            if (loaded && video && video.readyState > 0) {
                tryPlay();
            }
        }

        if (layer) {
            layer.addEventListener("click", start);
        }

        if (trigger) {
            trigger.addEventListener("click", start);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!loaded) {
                    loadVideo();
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
