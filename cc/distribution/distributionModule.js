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
		ns.tprint("Distribution Module is already running.");
		return;
	}
	isRunning = true;
	const distributionModule = new DistributionModule(ns, ns.args[0]);
	ns.tail("/cc/distribution/distributionModule.js", "home", ...ns.args);
	ns.atExit(() => isRunning = false);

	await distributionModule.start();
}

export class DistributionModule extends Module {
	/** 
	 * @param {NS} ns Scripting Runtime
	 * @param {number} port command port
	 */
	constructor(ns, port) {
		super(ns, "Distribution", port, 100);
	}

	async update(command) {
		this.ns.clearLog();
		this.ns.print(`Command: ${command}`);
	}
}