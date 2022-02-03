const audio = document.getElementById('audio');
const sendBtn = document.getElementById('sendMessage');
const messages = document.getElementById('messages');
const messageBox = document.getElementById('messageBox');

let ws;

function showMessage(message) {
	messages.textContent += `\n\n${decodeURI(message)}`;
	messages.scrollTop = messages.scrollHeight;
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
	ws.onmessage = (event) => {
		console.log(event);
		showMessage(event.data);
	};
	ws.onclose = setTimeout(init, 1e3);

}

sendBtn.onclick = function() {
	if (!ws) return showMessage('No WebSocket connection!');
	if (messageBox.value.length === 0) return;
	const msg = encodeURI(messageBox.value.slice(0, 256).trim());
	console.log(msg);
	ws.send(msg);
	showMessage(msg);
}

init();