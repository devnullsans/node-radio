import { createReadStream } from "fs";
import { join } from "path";
import Watcher from "./watcher.js";

const watcher = new Watcher(join(process.cwd(), 'tracks'));
const queue = [];

async function test(bps) {
	await watcher.reloadList();
	watcher.startWatching();
	startPlaying(bps);
}

function startPlaying(bps) {
	if (queue.length === 0) queue.push(...watcher.getTracks());
	Boolean(queue.length) && streamTrack(bps, queue.shift());
}

function streamTrack(bps, file) {
	let totalBytes = 0;
	const startTime = Date.now();
	const rs = createReadStream(file, { highWaterMark: bps });
	const id = setInterval(() => rs.resume(), 1e3);
	rs.on('data', chunk => {
		rs.pause();
		totalBytes += chunk.byteLength;
		console.log(chunk.byteLength, totalBytes, Date.now() - startTime);
	});
	rs.once('end', () => {
		clearInterval(id);
		startPlaying(bps);
	});
}

test(64 * 1024);