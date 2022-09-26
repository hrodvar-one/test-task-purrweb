

let videoPlayer = document.getElementById("msign-connected-token__video-player");

let actionButton = document.getElementById("msign-connected-token__union");

let groups20 = document.getElementById("msign-connected-token__group-20");

// Функция запуска/остановки видео

function startPauseVideo() {
	if(videoPlayer.paused) {
		videoPlayer.play();
		groups20.setAttribute('class','msign-connected-token__group-20_hidden');
	} else {
		videoPlayer.pause();
	}
}

//Запуск, пауза
actionButton.addEventListener('click',startPauseVideo);
videoPlayer.addEventListener('click',startPauseVideo);
