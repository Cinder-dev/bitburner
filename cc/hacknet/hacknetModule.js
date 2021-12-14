import { Module } from '/cc/module.js';

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
		ns.tprint("Hacknet Module is already running.");
		return;
	}
	isRunning = true;
	const hacknetModule = new HacknetModule(ns);
	ns.tail("/cc/hacknet/hacknetModule.js", "home", ...ns.args);
	ns.atExit(() => isRunning = false);

	await hacknetModule.start();
}

export class HacknetModule extends Module {
	/** 
	 * @param {NS} ns Scripting Runtime
	 * @param {number} port command port
	 */
	constructor(ns, port) {
		super(ns, "Hacknet", port);
	}

	async update(command) {
		this.ns.print(`Command: ${command}`);
	}
}