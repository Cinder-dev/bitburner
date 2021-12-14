export function autocomplete(data, args) {
	return [...data.servers];
}

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	let target = ns.args[0];

	if (target === null && !ns.serverExists(target)) return;

	let serverInfo = ns.getServer(target);

	let isAdmin = serverInfo.hasAdminRights;
	
	if (!isAdmin) {
		ns.toast("Unable to root " + serverInfo.hostname, "error")
		return;
	}

	spawnWorkers(ns);

	while(true) {
		let pull = ""
		do { pull = ns.readPort(19); } while (pull != "NULL PORT DATA");
		serverInfo = ns.getServer(target);
		await ns.writePort(19, JSON.stringify(serverInfo));
		logInfo(ns, serverInfo);
		await ns.sleep(1000);
	}
}

/** 
 * @param {NS} ns 
 * @param {Server} serverInfo
 **/
function logInfo(ns, serverInfo) {
	let percentage = ((serverInfo.moneyAvailable / serverInfo.moneyMax) * 100).toFixed(0);
	let info = `${ns.getHostname()} -> ${serverInfo.hostname}: ` + 
	`${ns.nFormat(serverInfo.moneyAvailable, '($0a)')}/${ns.nFormat(serverInfo.moneyMax, '($0a)')} ${percentage}%, ` + 
	`${serverInfo.hackDifficulty.toFixed(1)}, ` + 
	`HT: ${ns.nFormat(ns.getHackTime(serverInfo.hostname) / 1000, '00:00:00')}, ` + 
	`GT: ${ns.nFormat(ns.getGrowTime(serverInfo.hostname) / 1000, '00:00:00')}, ` + 
	`WT: ${ns.nFormat(ns.getWeakenTime(serverInfo.hostname) / 1000, '00:00:00')}`;
	ns.print(info);
}

/** 
 * @param {NS} ns 
 * @param {string} target 
 **/
function spawnWorkers(ns) {
	let hostInfo = ns.getServer(ns.getHostname())
	let freeMemory = hostInfo.maxRam - hostInfo.ramUsed;
	let scriptReq = ns.getScriptRam("/hacks/worker.js");
	let threads = Math.floor(freeMemory / scriptReq);
	ns.toast(ns.getHostname() + ": Starting Workers with " + threads + " threads");
	ns.exec("/hacks/worker.js", hostInfo.hostname, threads);
}