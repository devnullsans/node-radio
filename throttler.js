import { createInterface } from "readline";
import { createReadStream } from "fs";
import { join, parse } from "path";
import Watcher from "./watcher.js";

export default class Throttler {
	constructor(clients, bps = 1024) {
		this._clients = clients;
		this._bps = bps;
		this._watcher = new Watcher(join(process.cwd(), 'tracks'));
		this._rl = createInterface({
			input: process.stdin,
			output: null
		});
		this._queue = [];
		this.curS = '';
		this._init = false;

	}

	async init() {
		await this._watcher.reloadList();
		this._queue.push(...this._watcher.getTracks());
		this._rl.on('line', line => this.readCommand(line));
		this._init = true;
	}

	async startPlaying() {
		if (!this._init) await this.init();
		if (this._queue.length === 0) {
			this._curS = '';
		} else {
			this._curS = this._queue.shift();
			this.streamTrack();
		}
	}

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
		switch (line.trim()) {
			case 'x':
				this._queue = [];
				this.printQ();
				break;
			case 'l':
				this._queue.push(...this._watcher.getTracks());
				this.printQ();
				if (!this._curS) this.startPlaying();
				break;
			case 'q':
				this.printQ();
				break;
			case 'f':
				this.printF();
				break;

			default:
				const ix = Number(line.trim());
				if (!isNaN(ix)) {
					const track = this._watcher.getTrack(ix);
					if (track) {
						this._queue.push(track);
						this.printQ();
						if (!this._curS) this.startPlaying();
					}
				}
				break;
		}
	}

	streamTrack() {
		// let totalBytes = 0;
		// const startTime = Date.now();
		console.log(Date(), 'play:', this._curS.substring(this._curS.lastIndexOf('/') + 1));
		const rs = createReadStream(this._curS, { highWaterMark: this._bps * 2 });
		const id = setInterval(() => rs.resume(), 2e3);
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
