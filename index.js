import { constants } from 'fs';
import { access, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import Clients from "./clients.js";
import Throttler from "./throttler.js";
import mimes from './mimes.js';

const clients = new Clients();
const throttler = new Throttler(clients, 40 * 1024);

const server = createServer(async (req, res) => {
	if (req.method === 'GET') {
		switch (req.url) {
			case '/stream': {
				const cid = clients.addClient(res);
				req.once('close', () => clients.deleteClient(cid));
				res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
			} return;

			default: {
				const filePath = join(process.cwd(), 'public', req.url);
				try {
					await access(filePath, constants.R_OK);
					res.writeHead(200, ['Content-Type', mimes[extname(filePath)] ?? 'text/plain']);
					res.end(await readFile(filePath));
				} catch (err) {
					console.error(err);
					res.writeHead(404).end();
				}
			} return;
		}
	}
});

const wss = new WebSocketServer({ server, path: '/chat' });

wss.on('connection', ws => {
	ws.on('message', (data, isBinary) => {
		console.log('isBinary', isBinary);
		wss.clients.forEach(client => {
			if (client !== ws && client.readyState === WebSocket.OPEN) {
				client.send(data, { binary: isBinary });
			}
		});
	});
});

server.listen(process.env.PORT ?? 8080, () => {
	throttler.startPlaying();
	console.log('server is up:', server.address());
});
