import { isCommandCenterRunning } from "/cc/commandCenter.js";

/** @param {NS} ns **/
export async function main(ns) {
	if (!isCommandCenterRunning(ns)) {
		// Do Nothing, Command Center is not running
		ns.tprint("Command Center is not running")
		return;
	}
	if (ns.args.length < 1) {
		// No arguments, show usage.
		ns.tprint("No arguments supplied, usage: target [target]");
		return;
	}

	let target = ns.args[0];
	if (ns.serverExists(target)) {
		await ns.writePort(2, JSON.stringify({
			command: "target",
			data: {
				newTarget: target
			}
		}));
	}
}