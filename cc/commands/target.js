import { isCommandCenterRunning } from "/cc/commandCenter.js";

/** @param {NS} ns **/
export async function main(ns) {
	if (!isCommandCenterRunning(ns)) {
		// Do Nothing, Command Center is not running
		ns.tprint("Command Center is not running")
		return;
	}

	let {_, stock } = ns.flags([
		["stock", false],
	]);

	if (ns.serverExists(_[0])) {
		await ns.writePort(2, JSON.stringify({
			command: "target",
			data: {
				newTarget: _[0],
				stock: stock,
			}
		}));
	}
}