/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	// Infinite loop that continously hacks/grows/weakens the target server
	let lastMsg = "";

	while(true) {
		let host = ns.getHostname();
		let serverInfo = JSON.parse(ns.peek(19));
		let moneyThreshold = serverInfo.moneyMax * 0.75;
		let securityThreshold = serverInfo.minDifficulty + 5;

		let growTime = ns.getGrowTime(serverInfo.hostname);
		let weakenTime = ns.getWeakenTime(serverInfo.hostname);
		let hackTime = ns.getHackTime(serverInfo.hostname);
		let data = { threads: ns.args[0], hostname: host, startTime: Date.now(), growTime, weakenTime, hackTime, lastMsg };

		if(serverInfo.hackDifficulty > securityThreshold) {
			await ns.tryWritePort(18, JSON.stringify({...data, action: "Weaken"}));
			let weakened = await ns.weaken(serverInfo.hostname);
			lastMsg = `${host}: Weakened ${serverInfo.hostname} by ${weakened.toFixed(2)}`;
		} else if(serverInfo.moneyAvailable < moneyThreshold) {
			await ns.tryWritePort(18, JSON.stringify({...data, action: "Grow"}));
			let growth = await ns.grow(serverInfo.hostname);
			lastMsg = `${host}: Added ${ns.nFormat(serverInfo.moneyAvailable * (growth - 1), '($0.00a)')} to ${serverInfo.hostname}`;
		} else {
			await ns.tryWritePort(18, JSON.stringify({...data, action: "Hack"}));
			let stolen = await ns.hack(serverInfo.hostname);
			lastMsg = `${host}: Stolen ${ns.nFormat(stolen, '($0.00a)')} from ${serverInfo.hostname}`;
		}
	}
}