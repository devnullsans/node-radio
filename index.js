import { constants } from 'fs';
import { access, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { createServer } from 'http';
import { startWatching } from './watcher.js';
import mimes from './mimes.js';
// const Engine = require('./engine');

const server = createServer(async (req, res) => {
	// if (req.method === 'GET' && req.url === '/stream') {
	// 	const { id, responseSink } = Engine.queue.makeResponseSink();
	// 	req.once('close', () => Engine.queue.removeResponseSink(id));
	// 	res.writeHead(200, {'Content-Type': 'audio/mpeg'});
	// 	responseSink.pipe(res);
	// 	return;
	// }
	if (req.method === 'GET' && req.url !== '/stream') {
		const filePath = join(process.cwd(), 'public', req.url);
		console.log(filePath);
		try {
			await access(filePath, constants.R_OK);
			res.writeHead(200, ['Content-Type', mimes[extname(filePath)] ?? 'text/plain']);
			res.end(await readFile(filePath));
		} catch (err) {
			console.error(err);
			return res.writeHead(404).end();
		}
	}
})

server.listen(process.env.PORT ?? 8080, () => {
	// Engine.start();
	startWatching(join(process.cwd(), 'tracks'));
	console.log('server is up:', server.address());
});
