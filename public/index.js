const audio = document.getElementById('audio');
const sendBtn = document.getElementById('sendMessage');
const liveBtn = document.getElementById('liveButton');
const muteBtn = document.getElementById('muteButton');
const volumeRng = document.getElementById('volumeRange');
const iconImg = document.getElementById('iconImage');
const messages = document.getElementById('messages');
const messageBox = document.getElementById('messageBox');

// const playLogoB64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAABVUlEQVRoge3VOU4cQRiG4UcmMUgwRBYxxgdAOAU5B8Q5EBfAiMwaiVOwiWuwxMYWEcsF2JyxJLaAJugO0MBU1eAAIf2vVFHV9/ZXqu5qgiAIgiAIgiAIgiB4T3zBBs7xF8dYQn8Pjjns4bYZu5jtIT+AZZzgX9NlHWOlgm+4RvXC2EerwLHSJV+hXZAfxu8u+WtM5QQt/EmUqNQnlWIuk68wk3FsZfKXGEoJFgpK3OFTwrFX4NhJ5EdwX+CYfxr60CH5mtplQx/GE/MTBY7Uc8Y975V1dAaqAkEv616Tf1WHzo38KhDc4yAxX+JIrTnAw386tNQfUurdXM88YDaTrzCdcWxm8hcYzDhM4aqL4KfMbdHQTpT4UZBvqa/6l/JXmCxwgM9Yw5n6h3iIRXwsFaiv2B3cNGNb/iSe0o/vOGo6nGIVoz04giAIgiAIgiAIgiB4Yx4BEtOe1DmOOJ8AAAAASUVORK5CYII=";
// const loadLogoB64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAACmElEQVRoge3Z24tNYRjH8Y9zIlPjFEVJyqHIoRRuFHJIyoXkhkwuuZAbN5ScyoXGPyDlArkYDX8BkZi5cCHlkITJoQZzMZlhuFh7Z7f2Wnu/a8/aM5PWt57aa/dbv/d51uF53/1uCgoKajGuyf6tWF363I3eJo+XO1PQjgH8KcVPXMbkUcwrM7f9KyAet0Yxr0xsk15EObbkPej4vA2xJydNJiY2oN+LjaKL0I0b6K/QzArwmR07XoGjWIUhPMIVvMuYXxAL8Uz1Y/IWKyt0FxI08ThXoW/DYIKmD9vzLmJiShHleI+WknY5ftXQDmJZSbu+jrYPC/IsZF+NwcpxokJ/IkUzhOMVulrdrRyX8iykPWDAjtg5e/C4lPxQ6fPumOZDgO+DkARDX/YQXVxzpxSTSseDCedMCPAN0QS336cBmicp3w9KLoKo69WjK0ATzFRRd0q7/b2Y24BvvclzAEuHmXsVK0XdKamIzcPwPZXgWe5uB4fhW5MWUUfqQCdOa+xOxNmKe+gRXaybWJuD7//HTBzAMewSLc9Hghacx2tR6/6Ma1jciNlh0cxa+dy+wbo8Mq3BXLyQ/N58x6YsZrtEVyLJ7Cvm55V1AndTxi3HR0wPNeuqY5brsqGCJXXGLUdb/MSkCXEq1tQZMNPtzUBop6p6vNNm9j+N5zI6JBXSr/7S4X4TciF8OZK2HKpip/SX/QvmZUwwC50p45bjA6ZlMTyEHzGTV5o/487Bc8lFfMOGRkxbsV80Ie4wcntSM3BWdOF+4xOuYtEIjV9QMNYYhyOitvoMJ2XfcxsTtKnuUGdGNaMGeai6kJ4sBs3Y+22EpDwy/XczVgq5HvjdmGe8aC/gpWjj+qKR+zVaUFBQUFBQUNAs/gIKNRO5tdlFAAAAAABJRU5ErkJggg==";
let ws;//, id;

function showChat(data) {
	const p = document.createElement('p');
	p.textContent = decodeURI(data);
	messages.prepend(p);
}

function showAdd(data) {
	const div = document.createElement('div');
	div.innerHTML = data;
	messages.prepend(div);
}

function trimTen() {
	while (messages.childElementCount > 10)
		messages.removeChild(messages.firstElementChild);
}

function scrollToTop() {
	messages.scrollTop = 0;
}

function clearInput() {
	messageBox.value = '';
}

function init() {
	if (ws) ws.onerror = ws.onopen = ws.onclose = ws.close(); // as good as null
	ws = new WebSocket('ws://localhost:8080/chat');
	// ws.onopen = () => console.log('Connection opened!');
	ws.onclose = () => setTimeout(() => init(), 3e3);
	ws.onmessage = async (event) => {
		// trimTen();
		if (event.data instanceof Blob) showAdd(await event.data.text());
		else showChat(event.data);
		scrollToTop();
	};

}


sendBtn.onclick = function () {
	if (!ws) return showChat('No WebSocket connection!');
	if (messageBox.value.length === 0) return;
	const msg = encodeURI(messageBox.value.slice(0, 256).trim());
	ws.send(msg);
	// trimTen();
	showChat(msg);
	clearInput();
	scrollToTop();
}

liveBtn.onclick = function () {
	audio.load();
}

muteBtn.onclick = function () {
	if (audio.volume === 0) audio.volume = volumeRng.value;
	else audio.volume = 0;
}

volumeRng.onchange = function (event) {
	audio.volume = event.target.value;
}

// function audioLoaded() {
// 	console.log(audio.readyState);
// 	if (audio.readyState > 2) {
// 		clearInterval(id);
// 		audio.play();
// 		iconImg.src = playLogoB64;
// 	}
// }

// function audioInterrupted(event) {
// console.log(event.type);
// audio.pause();
// iconImg.src = loadLogoB64;
// id = setInterval(() => audioLoaded(), 2e3);
// }

// audio.addEventListener('loadstart', audioInterrupted);
// audio.addEventListener('waiting', audioInterrupted);

// function testListeners(event) {
// 	console.log(event.type);
// 	if (event.type === 'error') audio.load();
// 	if (event.type === 'waiting') audio.pause();
// 	if (event.type === 'canplaythrough') audio.play();
// }
// audio.addEventListener('abort', testListeners);
// audio.addEventListener('canplay', testListeners);
// audio.addEventListener('canplaythrough', testListeners);
// audio.addEventListener('durationchange', testListeners);
// audio.addEventListener('emptied', testListeners);
// audio.addEventListener('ended', testListeners);
// audio.addEventListener('error', testListeners);
// audio.addEventListener('loadeddata', testListeners);
// audio.addEventListener('loadedmetadata', testListeners);
// audio.addEventListener('loadstart', testListeners);
// audio.addEventListener('pause', testListeners);
// audio.addEventListener('play', testListeners);
// audio.addEventListener('playing', testListeners);
// audio.addEventListener('progress', testListeners);
// audio.addEventListener('ratechange', testListeners);
// audio.addEventListener('seeked', testListeners);
// audio.addEventListener('seeking', testListeners);
// audio.addEventListener('stalled', testListeners);
// audio.addEventListener('suspend', testListeners);
// audio.addEventListener('timeupdate', testListeners);
// audio.addEventListener('volumechange', testListeners);
// audio.addEventListener('waiting', testListeners);

init();
// audio.play();
