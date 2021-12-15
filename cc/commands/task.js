export function autocomplete(data, args) {
	return [...data.servers, ...data.flags];
}

/** @param {NS} ns Scripting Runtime */
export async function main(ns) {
	const { _, grow, hack, weak, help } = ns.flags([
		["grow", false],
		["hack", false],
		["weak", true],
		["help", false],
	]);

	if (help) {
		ns.tprint(
			"Usage: task [--grow | --hack | --weak] [server]\n" +
			"  --grow: Have server grow it's target" +
			"  --hack: Have server hack it's target" +
			"  --weak: Have server weaken it's target" +
			"  server: Server running a worker script"
		)
	}

	if (_[0] === null && !ns.serverExists(_[0])) {
		ns.tprint("ERROR: Invalid Arguments, check 'task --help' for usage.");
		return;
	}

	await ns.writePort(2, JSON.stringify({
		command: "task",
		data: {
			server: _[0],
			action: (grow ? "Grow" : (hack ? "Hack" : (weak ? "Weaken" : "Idle")))
		}
	}));
}