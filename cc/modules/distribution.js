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
	const distributionModule = new Distribution(ns, ns.args[0]);
	// ns.tail("/cc/distribution/distribution.js", "home", ...ns.args);
	ns.atExit(() => isRunning = false);

	await distributionModule.start();
}

export class Distribution extends Module {
	/** 
	 * @param {NS} ns Scripting Runtime
	 * @param {number} port command port
	 */
	constructor(ns, port) {
		super(ns, "Distribution", port, 100);
	}

	async update(command, status) {
	}
}