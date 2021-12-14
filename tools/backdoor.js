/** @param {NS} ns **/
export async function main(ns) {
    await backdoor(ns);
}

/** @param {NS} ns **/
async function backdoor(ns) {
	for(let host of ns.scan("home")) {
		await _backdoor(ns, "home", host);
	}
}

/** @param {NS} ns **/
async function _backdoor(ns, root, target) {
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