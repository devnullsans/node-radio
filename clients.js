import { randomUUID } from 'crypto';

const clientsMap = new Map();

export const addClient = res => {
	const id = randomUUID();
	clientsMap.set(id, res);
	return id;
};

export const deleteClient = id => clientsMap.delete(id);

export const broadcastToEveryClient = chunk => {
	for (const client of clientsMap.values()) client.write(chunk);
};