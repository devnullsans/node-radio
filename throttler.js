import { createReadStream } from "fs";
import { join } from "path";
import Watcher from "./watcher.js";

export default class Throttler {
	constructor(clients, bps = 1024) {
		this._watcher = new Watcher(join(process.cwd(), 'tracks'));
		this._queue = [];
		this._clients = clients;
		this._bps = bps;
		this._init = false;
		// this.init();
	}

	async init() {
		await this._watcher.reloadList();
		this._watcher.startWatching();
	}

	async startPlaying() {
		if (!this._init) await this.init();
		if (this._queue.length === 0) this._queue.push(...this._watcher.getTracks());
		Boolean(this._queue.length) && this.streamTrack(this._queue.shift());
		console.table(this._queue);
	}

	streamTrack(file) {
		console.log('now-playing:', file);
		// let totalBytes = 0;
		// const startTime = Date.now();
		const rs = createReadStream(file, { highWaterMark: this._bps });
		const id = setInterval(() => rs.resume(), 1e3);
		rs.on('data', chunk => {
			rs.pause();
			// totalBytes += chunk.byteLength;
			// console.log(chunk.byteLength, totalBytes, Date.now() - startTime);
			this._clients.broadcastToEveryClient(chunk);
		});
		rs.once('end', () => {
			clearInterval(id);
			this.startPlaying();
		});
	}
}

// test();
