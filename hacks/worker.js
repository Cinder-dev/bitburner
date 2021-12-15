/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	// Infinite loop that continously hacks/grows/weakens the target server
	while(true) {
		let host = ns.getHostname();
		let serverInfo = JSON.parse(ns.peek(19));
		let moneyThreshold = serverInfo.moneyMax * 0.75;
		let securityThreshold = serverInfo.minDifficulty + 5;

		let msg = "";
		let variant = "success";
		if(serverInfo.hackDifficulty > securityThreshold) {
			await ns.tryWritePort(18, JSON.stringify({hostname: serverInfo.hostname, action: "Weaken"}));
			let weakened = await ns.weaken(serverInfo.hostname);
			msg = `${host}: Weakened ${serverInfo.hostname} by ${weakened.toFixed(2)}`;
			variant = "warning";
		} else if(serverInfo.moneyAvailable < moneyThreshold) {
			await ns.tryWritePort(18, JSON.stringify({hostname: serverInfo.hostname, action: "Grow"}));
			let growth = await ns.grow(serverInfo.hostname);
			msg = `${host}: Added ${ns.nFormat(serverInfo.moneyAvailable * (growth - 1), '($0.00a)')} to ${serverInfo.hostname}`;
			variant = "info"
		} else {
			await ns.tryWritePort(18, JSON.stringify({hostname: serverInfo.hostname, action: "Hack"}));
			let stolen = await ns.hack(serverInfo.hostname);
			msg = `${host}: Stolen ${ns.nFormat(stolen, '($0.00a)')} from ${serverInfo.hostname}`;
			variant = "success";
		}

		ns.toast(msg, variant);
		ns.print(msg);
	}
}