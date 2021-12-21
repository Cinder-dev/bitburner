export async function main(ns: NS) {
    await backdoor(ns);
}

async function backdoor(ns: NS) {
	for(let host of ns.scan("home")) {
		await _backdoor(ns, "home", host);
	}
}

async function _backdoor(ns: NS, root: string, target: string) {
	ns.connect(target);
	let serverInfo = ns.getServer();
	if (!serverInfo.backdoorInstalled && serverInfo.hasAdminRights) {
		await ns.installBackdoor();
		ns.toast("Backdoor Installed at" + serverInfo.hostname);
	}
	for(let host of ns.scan(target)) {
		await _backdoor(ns, target, host);
	}
	ns.connect(root);
}