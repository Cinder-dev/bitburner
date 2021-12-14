/** @param {NS} ns **/
export async function main(ns) {
	if (ns.args[0] === null || !ns.serverExists(ns.args[0])) return;
	killAll(ns);

	ns.tprint("Replicating Code to Servers.")
    ns.run("/tools/replicate.js", 1, "ALL");

	await ns.sleep(2000);

	startAll(ns);
}

/** @param {NS} ns **/
function startAll(ns) {
	ns.scan("home").forEach(host => _startAll(ns, "home", host));
}

/** @param {NS} ns **/
function _startAll(ns, root, target) {
	ns.print("Starting all processes on " + target)
	if (!ns.hasRootAccess(target)) {
		rootServer(ns, target);
	}
	ns.exec("/hacks/master.ns", target, 1, ns.args[0]);
	ns.scan(target)
		.filter(host => host !== root)
		.forEach(host => _startAll(ns, target, host));
}

/** @param {NS} ns **/
function killAll(ns) {
	ns.scan("home").forEach(host => _killAll(ns, "home", host));
}

/** @param {NS} ns **/
function _killAll(ns, root, target) {
	ns.print("Killing all processes on " + target)
	ns.killall(target);
	ns.scan(target)
		.filter(host => host !== root)
		.forEach(host => _killAll(ns, target, host));
}

/** 
 * @param {NS} ns 
 * @param {string} target
 * @return {bool} If Nuke was successful
 **/
function rootServer(ns, target) {
	// Open Ports
	let hacks = [
		{ hack: "BruteSSH.exe", func: (ns, target) => ns.brutessh(target) },
		{ hack: "FTPCrack.exe", func: (ns, target) => ns.ftpcrack(target) },
	];

	hacks.forEach(hack => {
		if (ns.fileExists(hack.hack, "home")) {
			hack.func(ns, target);
		}
	});

	let server = ns.getServer(target);

	// Get root access to target server
	if (server.numOpenPortsRequired <= server.openPortCount) {
		ns.nuke(target);
		return true;
	} 
	return false;
}