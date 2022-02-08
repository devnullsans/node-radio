const audio = document.getElementById('audio');
const liveBtn = document.getElementById('liveButton');
const muteBtn = document.getElementById('muteButton');
const playBtn = document.getElementById('playButton');
const volumeRng = document.getElementById('volumeRange');
const sendBtn = document.getElementById('sendMessage');
const messages = document.getElementById('messages');
const messageBox = document.getElementById('messageBox');

let ws;

playBtn.addEventListener('click', () => {
	playBtn.disabled = true;
	audio.play();
}, { once: true, passive: true });

liveBtn.addEventListener('click', () => {
	audio.load();
	audio.play();
}, { passive: true });

muteBtn.addEventListener('click', () => {
	if (audio.volume === 0) audio.volume = 1;
	else audio.volume = 0;
}, { passive: true });

volumeRng.addEventListener('change', (event) => {
	audio.volume = event.target.value;
}, { passive: true });

sendBtn.addEventListener('click', () => {
	if (!ws) return showChat('No WebSocket connection!');
	if (messageBox.value.length === 0) return;
	const msg = encodeURI(messageBox.value.slice(0, 256).trim());
	ws.send(msg);
	messageBox.value = '';
	// trimTen();
	showChat(msg);
}, { passive: true });

function init() {
	if (ws) ws.onerror = ws.onopen = ws.onclose = ws.close(); // as good as null
	ws = new WebSocket(`ws://${location.host}/chat`);
	// ws.onopen = () => console.log('Connection opened!');
	ws.onclose = () => setTimeout(() => init(), 3e3);
	ws.onmessage = async (event) => {
		// trimTen();
		if (event.data instanceof Blob) showAdd(await event.data.text());
		else showChat(event.data);
	};

}

function showChat(data) {
	const p = document.createElement('p');
	p.textContent = decodeURI(data);
	messages.prepend(p);
	messages.scrollTop = 0;
}

function showAdd(data) {
	const div = document.createElement('div');
	div.innerHTML = data;
	messages.prepend(div);
	messages.scrollTop = 0;
}

// function trimTen() {
// 	while (messages.childElementCount > 10)
// 		messages.removeChild(messages.firstElementChild);
// }

init();