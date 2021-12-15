import { getAllServers } from '/util/lists.js';

let isRunning = false;

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	if (isRunning) {
		ns.tprint("Command Center already running.");
		return;
	}
	isRunning = true;
	const commandCenter = new CommandCenter(ns);
	// ns.tail("/cc/commandCenter.js", "home");
	ns.atExit(() => isRunning = false);

	await commandCenter.start();
}

export const Modules = [
	{ name: "Hacknet", script: "/cc/hacknet/hacknetModule.js", threads: 1, port: 3, pid: -1 },
	{ name: "Distribution", script: "/cc/distribution/distributionModule.js", threads: 1, port: 4, pid: -1 },
	{ name: "Status", script: "/cc/status/statusModule.js", threads: 1, port: 5, pid: -1 },
	{ name: "Servers", script: "/cc/servers/serversModule.js", threads: 1, port: 6, pid: -1 },
];

class CommandCenter {
	/** @param {NS} ns Scripting Runtime */
	constructor(ns) {
		this.ns = ns;
		this.modules = [...Modules];
		this.servers = [];
		this.target = "n00dles";
		this.stock = false;
		this.running = true;

		this.readState(ns);
	}

	readState() {
		let raw = this.ns.read("/cc/state.txt");
		if (raw == "") return;
		let state = JSON.parse(raw);
		this.target = state.target;
		this.servers = (state.servers === undefined ? [] : state.servers);
		this.stock = state.stock;
	}

	async writeState() {
		let state = JSON.stringify({
			target: this.target,
			stock: this.stock,
			servers: this.servers,
		});
		await this.ns.write("/cc/state.txt", state, "w");
	}

	async pullCommands() {
		let raw = "";
		do {
			raw = this.ns.readPort(2);
			if (raw == "NULL PORT DATA") continue;
			let {command, data} = JSON.parse(raw);

			this.ns.print(`[INPUT] ${command}`);

			switch(command) {
				case "target": {
					this.target = data.newTarget;
					this.stock = data.stock;
					break;
				}
				case "task": {
					const {server, action} = data;
					let index = this.servers.findIndex(s => s.hostname === server)
					this.servers[index].action = action;
					break;
				}
				default: {
					this.ns.toast("CC: Unknown Command Recieved", "warning")
				}
			}
		} while (raw !== "NULL PORT DATA");
	}	

	async postStatus() {
		this.ns.clearPort(1);
		let status = JSON.stringify({
			target: {
				hostname: this.target,
				server: this.ns.getServer(this.target),
				stock: this.stock,
			},
			servers: this.servers,
			modules: {
				running: this.modules.filter(module => module.pid !== -1).map(module => module.name),
			}
		});
		await this.ns.writePort(1, status);
	}

	async findServers() {
		getAllServers(this.ns)
			.map(h => this.ns.getServer(h))
			.filter(s => s.hasAdminRights && s.maxRam >= 4)
			.filter(s => this.servers.find(t => t.hostname === s.hostname) === undefined)
			.forEach(s => {
				this.servers.push({
					hostname: s.hostname,
					action: "Weaken"
				})
			});
	}

	async start() {
		for (const module of this.modules) {
			module.pid = this.ns.run(module.script, module.threads, module.port);
		}

		while(this.running) {
			await this.postStatus();
			await this.pullCommands();

			await this.findServers();

			await this.writeState()
			await this.ns.sleep(100);
		}
		
		for (const module of this.modules) {
			this.ns.kill(module.script, "home", module.port);
		}
	}

	shutdown() {
		this.running = false;
	}
}

/** @param {NS} ns Scripting Runtime */
export function isCommandCenterRunning(ns) {
	const processes = ns.ps("home");
	for(const p of processes) {
		if(p.filename === "/cc/commandCenter.js") return true;
	}
	return false;
}