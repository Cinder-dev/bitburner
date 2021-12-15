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

			let index = this.servers.findIndex(i => i.hostname == info.hostname);
			this.servers[index] = info;
		}

		let now = Date.now();

		this.ns.clearLog();

		if (this.servers.length > 0) {
			this.ns.print(table(
				["Hostname", "T", "Action", "Progress", "Bar", "Time Left", "Last Job Result"],
				this.servers.map(s => s.hostname),
				this.servers.map(s => `${s.threads}`),
				this.servers.map(s => s.action),
				this.servers.map(s => {
					let finishTime = s.startTime + s.runTime;
					let timeRemaining = finishTime - now;
					let percentage = (s.runTime - timeRemaining) / s.runTime;
					return (percentage * 100).toFixed(1) + "%";
				}),
				this.servers.map(s => {
					let finishTime = s.startTime + s.runTime;
					let timeRemaining = finishTime - now;
					let percentage = (s.runTime - timeRemaining) / s.runTime;
					let fill = Math.round(20 * percentage);
					let drain = Math.round(20 * (1 - percentage));
					if (isNaN(fill) || isNaN(drain) || !isFinite(fill) || !isFinite(drain) || fill < 0 || drain < 0) return "_".repeat(20);
					try {
						return ("=".repeat(fill) + "_".repeat(drain));
					} catch(err) {
						console.log(fill + " " + drain);
						return "_".repeat(20);
					}
				}),
				this.servers.map(s => {
					let finishTime = s.startTime + s.runTime;
					return this.ns.nFormat((finishTime - now) / 1000, '00:00:00');
				}),
				this.servers.map(s => s.lastMsg),
			));
		}
	}

	getUsefullServers() {
		let hostnames = getAllServers(this.ns);
		let servers = hostnames.map(hostname => this.ns.getServer(hostname))
			.filter(s => s.hasAdminRights)
			.filter(s => s.maxRam > 4);
		servers.forEach(s => {
			if (this.servers.filter(i => i.hostname == s.hostname).length == 0) {
				this.servers.push({
					threads: 0,
					runTime: 0,
					lastMsg: "",
					hostname: s.hostname,
					action: "Unknown",
					startTime: Date.now(),
				});
			}
		});
	}
}