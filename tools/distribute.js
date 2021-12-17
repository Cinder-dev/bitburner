import {getAllServers} from "/util/lists.js";

/** @param {NS} ns **/
export async function main(ns) {
	killAll(ns);

  ns.run("/tools/replicate.js", 1, "ALL");

	await ns.sleep(2000);

	startAll(ns);
}

/** @param {NS} ns **/
function startAll(ns) {
	getAllServers(ns).forEach(hostname => {
		if (!ns.hasRootAccess(hostname)) {
			rootServer(ns, hostname);
		}
		if (ns.hasRootAccess(hostname)) {
			spawnWorkers(ns, hostname);
		}
	});
}

/** @param {NS} ns **/
function killAll(ns) {
	getAllServers(ns).forEach(hostname => ns.killall(hostname));
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
		{ hack: "HTTPWorm.exe", func: (ns, target) => ns.httpworm(target) },
		{ hack: "relaySMTP.exe", func: (ns, target) => ns.relaysmtp(target) },
		{ hack: "SQLInject.exe", func: (ns, target) => ns.sqlinject(target) },
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

/** 
 * @param {NS} ns 
 * @param {string} target 
 **/
 function spawnWorkers(ns, hostname) {
	let hostInfo = ns.getServer(hostname)
	let freeMemory = hostInfo.maxRam - hostInfo.ramUsed;
	if (freeMemory < 4) return;
	let scriptReq = ns.getScriptRam("/hacks/worker.js");
	let threads = Math.floor(freeMemory / scriptReq);
	ns.toast(hostname + ": Starting Workers with " + threads + " threads");
	ns.exec("/hacks/worker.js", hostname, threads, threads);
}