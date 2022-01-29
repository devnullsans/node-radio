import { randomUUID } from 'crypto';


export default class Clients {
	constructor() {
		this._clients = new Map();
	}

	addClient(res) {
		const id = randomUUID();
		this._clients.set(id, res);
		return id;
	}

	deleteClient(id) {
		return this._clients.delete(id);
	}

	broadcastToEveryClient(chunk) {
		for (const client of this._clients.values()) client.write(chunk);
	}
}
