const audio = document.getElementById('audio');
const sendBtn = document.getElementById('sendMessage');
const messages = document.getElementById('messages');
const messageBox = document.getElementById('messageBox');

let ws;

function showChat(data) {
	const p = document.createElement('p');
	p.textContent = decodeURI(data);
	messages.append(p);
}

function showAdd(data) {
	const div = document.createElement('div');
	div.innerHTML = data;
	messages.append(div);
}

function trimTen() {
	while (messages.childElementCount > 10)
		messages.removeChild(messages.firstElementChild);
}

function scrollToTop() {
	messages.scrollTop = messages.scrollHeight + 20;
}

function clearInput() {
	messageBox.value = '';
}

function init() {
	if (ws) {
		ws.onerror = ws.onopen = ws.onclose = null;
		ws.close();
	}

	ws = new WebSocket('ws://localhost:8080/chat');
	ws.onopen = () => {
		console.log('Connection opened!');
	}
	ws.onmessage = async (event) => {
		// trimTen();
		if (event.data instanceof Blob) {
			const data = await event.data.text();
			showAdd(data);
		} else showChat(event.data);
		scrollToTop();
	};
	ws.onclose = () => setTimeout(() => init(), 3e3);

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

init();