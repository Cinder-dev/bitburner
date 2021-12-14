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
		ns.tprint("No arguments supplied, usage: modules [command] [args]\n" + 
			"-l          | List Running Modules\n" +
			"-a          | List Available Modules\n" + 
			"-r [module] | Restart a Module\n" + 
			"-s [module] | Stop a Module\n" + 
			"-S          | Stop all Modules"
		);
		return;
	}

	const data = ns.readPort(10);
	ns.print(data);
	const status = JSON.parse(data);

	switch (ns.args[0]) {
		case "-l": {
			status.modules.running.forEach(name => ns.tprint(name));
			return;
		}
		default: {
			// Invalid Argument, show usage.
			ns.tprint("Invalid arguments supplied, usage: modules [command] [args]\n" + 
				"-l          | List Running Modules\n" +
				"-a          | List Available Modules\n" + 
				"-r [module] | Restart a Module\n" + 
				"-s [module] | Stop a Module\n" + 
				"-S          | Stop all Modules"
			);
			return;
		}
	}
}