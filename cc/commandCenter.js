import { HacknetModule } from '/cc/hacknet/hacknetModule.js';

/** @param {NS} ns **/
export async function main(ns) {
	const commandCenter = new CommandCenter(ns);
	ns.tail("/cc/commandCenter.ns", "home");

	await commandCenter.start();
}

class CommandCenter {
	/** @param {NS} ns Scripting Runtime */
	constructor(ns) {
		this.ns = ns;
		this.modules = [
			new HacknetModule(ns),
			new HacknetModule(ns),
			new HacknetModule(ns),
		];
		this.running = true;
	}

	async start() {
		while(this.running) {
			for (const module of this.modules) {
				await module.update();
			}
			await this.ns.sleep(1000);
		}
		
		for (const module of this.modules) {
			await module.shutdown();
		}
	}

	shutdown() {
		this.running = false;
	}
}