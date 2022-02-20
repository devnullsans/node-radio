const audio = document.getElementById('audio');
const liveBtn = document.getElementById('liveButton');
const muteBtn = document.getElementById('muteButton');
const playBtn = document.getElementById('playButton');
const volumeRng = document.getElementById('volumeRange');
const sendBtn = document.getElementById('sendMessage');
const messages = document.getElementById('messages');
const messageBox = document.getElementById('messageBox');
const muteIcon = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zM6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96V5.04zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/></svg>`
const unmuteIcon = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/><path d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8zM7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12V4zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11z"/></svg>`


let ws;

playBtn.addEventListener('click', () => {
	playBtn.style.display = 'none';
	liveBtn.style.display = 'inline-block'
	audio.play();
}, { once: true, passive: true });

liveBtn.addEventListener('click', () => {
	audio.load();
	audio.play();
}, { passive: true });

muteBtn.addEventListener('click', () => {
	if (audio.volume === 0) {
		audio.volume = 1;
		muteBtn.innerHTML = unmuteIcon;
	}
	else {
		audio.volume = 0;
		muteBtn.innerHTML = muteIcon;
	}
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

function init() { return;
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

setInterval(() => {
	showChat(Date.now().toString(16))
}, 3e3);

setInterval(() => {
	showAdd(`<h4>
		${Date.now().toString(36)}
	</h4>`)
}, 3e3);

