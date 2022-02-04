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
	}

	async init() {
		await this._watcher.reloadList();
		this._watcher.startWatching();

	}

	// printMenu() {
	// 	console.log('Usage:-');
	// }

	printQ() {
		console.log('Queue:-');
		console.table(this._queue.map(q => {
			const { name, ext } = parse(q);
			return name + ext;
		}));
	}

	printF() {
		console.log('Files:-');
		console.table(this._watcher.getTracks().map(f => {
			const { name, ext } = parse(f);
			return name + ext;
		}));
	}

	readCommand(line) {

		if (line.trim() === 'x') {
			this._queue = [];
			this.printQ();
		}

		if (line.trim() === 'q') this.printQ();

		if (line.trim() === 'f') this.printF();

		if (!isNaN(Number(line.trim()))) {
			const track = this._watcher.getTracks()[Number(line.trim())];
			if (track) {
				this._queue.push(track);
				this.printQ();
				if (!this._curS) this.startPlaying();
			}
		}
	}

	async startPlaying() {
		if (!this._init) await this.init() || this._queue.push(...this._watcher.getTracks());
		if (this._queue.length === 0) this._curS = '';
		else {
			this._curS = this._queue.shift();
			this.streamTrack();
		}
		if (!this._init) {
			this._rl.on('line', line => this.readCommand(line));
			this._init = true;
		}

	}

	streamTrack() {
		// let totalBytes = 0;
		// const startTime = Date.now();
		console.log(Date(), 'play:', this._curS.substring(this._curS.lastIndexOf('/') + 1));
		const rs = createReadStream(this._curS, { highWaterMark: this._bps });
		const id = setInterval(() => rs.resume(), 1e3);
		rs.on('data', chunk => {
			rs.pause();
			// totalBytes += chunk.byteLength;
			// console.log(chunk.byteLength, totalBytes, Date.now() - startTime);
			this._clients.broadcastToEveryClient(chunk);
		});
		rs.once('end', () => {
			console.log(Date(), 'end-playing:', this._curS.substring(this._curS.lastIndexOf('/') + 1));
			clearInterval(id);
			this.startPlaying();
		});
	}

}
