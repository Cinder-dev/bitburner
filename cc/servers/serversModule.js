import { Module } from '/cc/module.js';
import { getAllServers } from '/util/lists.js';
import { scan } from '/tools/find.js';

let isRunning = false;

/** @param {NS} ns Scripting Runtime */
export async function main(ns) {
	ns.disableLog("ALL");
	// Check for command port
	if (ns.args.length === 0) { 
		ns.print("Module Port required");
		return;
	}
	if (isRunning) {
		ns.tprint("Servers Module is already running.");
		return;
	}
	isRunning = true;
	const serversModule = new ServersModule(ns, ns.args[0]);
	ns.tail("/cc/servers/serversModule.js", "home", ...ns.args);
	ns.atExit(() => isRunning = false);

	await serversModule.start();
}

export class ServersModule extends Module {
	/** 
	 * @param {NS} ns Scripting Runtime
	 * @param {number} port command port
	 */
	constructor(ns, port) {
		super(ns, "Servers", port, 100);
		this.servers = [];
	}

	async update(command, status) {
		let hostnames = getAllServers(this.ns);
		let servers = hostnames.map(hostname => this.ns.getServer(hostname)).filter(s => s.hasAdminRights);

		this.ns.clearLog();
		this.ns.print(servers.map(s => s.hostname).join("\n"));
	}
}