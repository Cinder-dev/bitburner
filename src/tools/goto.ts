import { scan } from 'tools/find.js';

export async function main(ns: NS) {
	let server = ns.args[0] as string;
	if (!ns.serverExists(server)) {
		ns.tprint("Server doesn't exist.");
		return;
	}
	ns.disableLog("ALL");

	let route: string[] = [];
	scan(ns, '', 'home', server, route);
	route.shift();
	for (let host of route) {
		ns.connect(host);
	}
}

export function autocomplete(data: Autocomplete, args: string[]) {
	return data.servers;
}