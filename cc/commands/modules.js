import { isCommandCenterRunning } from "/cc/commandCenter.js";

/** @param {NS} ns **/
export async function main(ns) {
	if (!isCommandCenterRunning(ns)) {
		// Do Nothing, Command Center is not running
		ns.tprint("Command Center is not running")
	}
	if (ns.args.lenght < 1) {
		// No arguments, show usage.
		ns.tprint(
			"No arguments supplied, usage: modules [command] [args]\n" + 
			"-l          | List Running Modules\n" +
			"-a          | List Available Modules\n" + 
			"-r [module] | Restart a Module\n" + 
			"-s [module] | Stop a Module\n" + 
			"-S          | Stop all Modules"
		);
	}
}