import { createInterface } from "readline";
import { createReadStream } from "fs";
import { join, parse } from "path";
import Watcher from "./watcher.js";

export default class Throttler {
	constructor(clients, bps = 1024) {
		this._watcher = new Watcher(join(process.cwd(), 'tracks'));
		this._queue = [];
		this._clients = clients;
		this._bps = bps;
		this.curS = '';
		this._init = false;
		this._rl = createInterface({
			input: process.stdin,
			output: null
		});
		// this.init();
	}

	async init() {
		await this._watcher.reloadList();
		this._watcher.startWatching();

	}

	printMenu() {
		console.log('Queue:-');
		console.table(this._queue);
		console.log('Files:-');
		console.table(this._watcher.getTracks());
	}

	async startPlaying() {
		if (!this._init) await this.init() || this._queue.push(...this._watcher.getTracks());
		if (this._queue.length === 0) this._curS = '';
		else this.streamTrack(this._queue.shift());
		if (!this._init) {
			this._rl.on('line', line => this.readCommand(line));
			this.printMenu();
			this._init = true;
		}

	}

	streamTrack(file) {
		console.log('now-playing:', file);
		this._curS = file;
let totalBytes = 0;
const startTime = Date.now();
		const rs = createReadStream(file, { highWaterMark: this._bps });
		const id = setInterval(() => rs.resume(), 1e3);
		rs.on('data', chunk => {
			rs.pause();
totalBytes += chunk.byteLength;
console.log(chunk.byteLength, totalBytes, Date.now() - startTime);
			this._clients.broadcastToEveryClient(chunk);
		});
		rs.once('end', () => {
			clearInterval(id);
			this.startPlaying();
		});
	}

	readCommand(line) {

		if (line.trim() === 'x') this._queue = [];

		if (!isNaN(Number(line.trim()))) {
			const i = Number(line.trim());
			const track = this._watcher.getTracks()[Number(line.trim())];
			if (track) {
				this._queue.push(track);
				if (!this._curS) this.startPlaying();
			}
		}

		this.printMenu();

	}
}

// test();
