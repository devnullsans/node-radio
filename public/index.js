const audio = document.getElementById('audio');
const sendBtn = document.getElementById('sendMessage');
const liveBtn = document.getElementById('liveButton');
const muteBtn = document.getElementById('muteButton');
const volumeRng = document.getElementById('volumeRange');
const iconImg = document.getElementById('iconImage');
const messages = document.getElementById('messages');
const messageBox = document.getElementById('messageBox');

let ws;

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
	audio.play();
}

muteBtn.onclick = function () {
	if (audio.volume === 0) audio.volume = volumeRng.value;
	else audio.volume = 0;
}

volumeRng.onchange = function (event) {
	audio.volume = event.target.value;
}

function testListeners(event) {
	console.log(event.type);
	if (event.type === 'error') {
		audio.load();
		audio.play();
	}
	if (event.type === 'stalled') audio.volume = 0;
	if (event.type === 'progress') setTimeout(() => audio.volume = volumeRng.value, 1e3);
}
audio.addEventListener('error', testListeners);
audio.addEventListener('progress', testListeners);
audio.addEventListener('stalled', testListeners);

init();
audio.play();
