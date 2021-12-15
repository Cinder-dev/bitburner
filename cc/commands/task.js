export function autocomplete(data, args) {
	data.flags([
		["grow", false],
		["hack", false],
		["weak", true],
		["help", false],
	]);
	return [...data.servers];
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
			"Usage: task [--grow | --hack | --weak] [...server]\n" +
			"  --grow: Have server grow it's target\n" +
			"  --hack: Have server hack it's target\n" +
			"  --weak: Have server weaken it's target\n" +
			"  server: Server running a worker script"
		)
	}

	for (let server of _) {
		if (!ns.serverExists(server)) {
			ns.tprint(`ERROR: ${server} doesn't exist`);
			continue;
		}

		await ns.writePort(2, JSON.stringify({
			command: "task",
			data: {
				server: server,
				action: (grow ? "Grow" : (hack ? "Hack" : (weak ? "Weaken" : "Idle")))
			}
		}));
	}
}