import { Module } from '/cc/module.js';
import { getAllServers } from '/util/lists.js';
import { table } from '/util/table.js';

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
			const data = this.ns.readPort(this.updatePort);
			const info = JSON.parse(data);
			const { hostname, action, startTime } = info;

			this.servers.filter(i => i.hostname == hostname)[0].action = action;
			this.servers.filter(i => i.hostname == hostname)[0].startTime = startTime;
		}

		let now = Date.now();
		let growTime = this.ns.getGrowTime(status.target.hostname);
		let weakenTime = this.ns.getWeakenTime(status.target.hostname);
		let hackTime = this.ns.getHackTime(status.target.hostname);

		this.ns.clearLog();
		this.ns.print(table(
			["Hostname", "Action", "Progress"],
			this.servers.map(s => s.hostname),
			this.servers.map(s => s.action),
			this.servers.map(s => {
				switch(s.action) {
					case "Grow":
						let finishTime = s.startTime + growTime;
						return `${now / finishTime}`
					case "Weaken": 
						let finishTime = s.startTime + weakenTime;
						return `${now / finishTime}`
					case "Hack":
						let finishTime = s.startTime + hackTime;
						return `${now / finishTime}`
					default: return 'N/A';
				}
			}),
		));
	}

	getUsefullServers() {
		let hostnames = getAllServers(this.ns);
		let servers = hostnames.map(hostname => this.ns.getServer(hostname))
			.filter(s => s.hasAdminRights)
			.filter(s => s.maxRam > 4);
		servers.forEach(s => {
			if (this.servers.filter(i => i.hostname == s.hostname).length == 0) {
				this.servers.push({
					hostname: s.hostname,
					action: "Unknown",
					startTime: Date.now(),
				});
			}
		});
	}
}