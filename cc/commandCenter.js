import { HacknetModule } from '/cc/hacknet/hacknetModule.js';

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
	ns.tail("/cc/commandCenter.js", "home");
	ns.atExit(() => isRunning = false);

	await commandCenter.start();
}

export const Modules = [
	{ name: "Hacknet", script: "/cc/hacknet/hacknetModule.js", threads: 1, port: 2, pid: -1 },
	{ name: "Distribution", script: "/cc/distribution/distributionModule.js", threads: 1, port: 3, pid: -1 },
];

class CommandCenter {
	/** @param {NS} ns Scripting Runtime */
	constructor(ns) {
		this.ns = ns;
		this.modules = [...Modules];
		this.running = true;
	}

	async postStatus() {
		// Purge old data
		let pull = ""
		do { pull = this.ns.readPort(1); } while (pull != "NULL PORT DATA");
		let status = JSON.stringify({
			modules: {
				running: this.modules.filter(module => module.pid !== -1).map(module => module.name),
			}
		});
		await this.ns.writePort(1, status);
	}

	async start() {
		for (const module of this.modules) {
			module.pid = this.ns.run(module.script, module.threads, module.port);
		}

		while(this.running) {
			await this.postStatus();
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