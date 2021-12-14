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

class CommandCenter {
	/** @param {NS} ns Scripting Runtime */
	constructor(ns) {
		this.ns = ns;
		this.modules = [
			new HacknetModule(ns),
		];
		this.running = true;
	}

	async postStatus() {
		// Purge old data
		let pull = ""
		do { pull = ns.readPort(1); } while (pull != "NULL PORT DATA");
		let status = JSON.stringify({
			modules: {
				running: this.modules.map(module => module.name),
			}
		});
		await this.ns.writePort(10, status);
	}

	async start() {
		while(this.running) {
			for (const module of this.modules) {
				await module.update();
			}
			await this.postStatus();
			await this.ns.sleep(100);
		}
		
		for (const module of this.modules) {
			await module.shutdown();
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