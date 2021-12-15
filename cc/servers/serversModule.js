import { Module } from '/cc/module.js';
import { getAllServers } from '/util/lists.js';

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
		/** @type {NS} ns */
		this.ns;
		this.servers = [];
		this.updatePort = 18;
	}

	async update(command, status) {
		this.getUsefullServers();
		
		let handle = this.ns.getPortHandle(this.updatePort);
		while(!handle.empty()) {
			let data = this.ns.readPort(this.updatePort);
			let info = JSON.parse(data);

			this.servers[info.hostname].action = info.action;
		}

		this.ns.clearLog();
		this.ns.print(this.servers.map(s => `${s.hostname}: ${s.action}`).join("\n"));
	}

	getUsefullServers() {
		let hostnames = getAllServers(this.ns);
		let servers = hostnames.map(hostname => this.ns.getServer(hostname))
			.filter(s => s.hasAdminRights)
			.filter(s => s.maxRam != 0);
		servers.forEach(s => {
			if (this.servers[s.hostname] == null) {
				this.servers[s.hostname] = {
					hostname: s.hostname,
					action: "Unknown",
				}
			}
		});
	}
}