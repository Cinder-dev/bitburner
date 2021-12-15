import { scan } from '/tools/find.js';

/** @param {NS} ns Scripting Runtime */
export async function main(ns) {
	let server = ns.args[0];
	if (!ns.serverExists(server)) {
		ns.tprint("Server doesn't exist.");
		return;
	}
	ns.disableLog("ALL");

	let route = [];
	scan(ns, '', 'home', server, route);
	route.shift();
	for (let host of route) {
		ns.connect(host);
	}
}

export function autocomplete(data, args) {
	return data.servers;
}