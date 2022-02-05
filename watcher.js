import { extname, join } from 'path';
import { readdir, watch } from 'fs/promises';

export default class Watcher {
	constructor(dir) {
		this._dir = dir;
		this._mp3 = [];
		this._tid = 0;
		this.startWatching();
	}

	async reloadList() {
		try {
			this._mp3 = (await readdir(this._dir, { withFileTypes: true }))
				.filter(track => track.isFile() && extname(track.name) === '.mp3')
				.map(track => join(this._dir, track.name));
		} catch (err) {
			throw err;
		}
	}

	async startWatching() {
		try {
			const watcher = await watch(this._dir);
			for await (const { eventType } of watcher) {
				if (eventType === 'rename') {
					clearTimeout(this._tid);
					this._tid = setTimeout(() => this.reloadList(), 3e3);
				}
			}
		} catch (err) {
			throw err;
		}
	}

	getTracks() {
		return this._mp3;
	}

	getTrack(index) {
		return this._mp3[(this._mp3.length > index ?  index : index % this._mp3.length)];
	}
};
