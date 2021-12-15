/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	let host = ns.getHostname();

	ns.print(`Starting Worker on ${host}`);

	let lastMsg = "N/A";
	while(true) {
		let raw = ns.peek(1);
		if (raw === "NULL PORT DATA") {
			await ns.sleep(1000);
			continue;
		}
		let status = JSON.parse(raw);

		let serverInfo = status.target.server;
		let action = status.servers.find(s => s.hostname === host).action;

		let growTime = ns.getGrowTime(serverInfo.hostname);
		let weakenTime = ns.getWeakenTime(serverInfo.hostname);
		let hackTime = ns.getHackTime(serverInfo.hostname);
		let data = { threads: ns.args[0], hostname: host, startTime: Date.now(), lastMsg: lastMsg };

		switch (action) {
			case "Weaken":
				await ns.tryWritePort(18, JSON.stringify({...data, action: "Weaken", runTime: weakenTime}));
				let weakened = await ns.weaken(serverInfo.hostname);
				lastMsg = `Weakened ${serverInfo.hostname} by ${weakened.toFixed(2)}`;
				break;
			case "Grow":
				await ns.tryWritePort(18, JSON.stringify({...data, action: "Grow", runTime: growTime}));
				let growth = await ns.grow(serverInfo.hostname);
				lastMsg = `Added ${ns.nFormat(serverInfo.moneyAvailable * (growth - 1), '($0.00a)')} to ${serverInfo.hostname}`;
				break;
			case "Hack":
				await ns.tryWritePort(18, JSON.stringify({...data, action: "Hack", runTime: hackTime}));
				let stolen = await ns.hack(serverInfo.hostname);
				lastMsg = `Stolen ${ns.nFormat(stolen, '($0.00a)')} from ${serverInfo.hostname}`;
				break;
			case "Idle":
				await ns.tryWritePort(18, JSON.stringify({...data, action: "Idle", runTime: 1000}));
				await ns.sleep(1000);
				lastMsg = `Idle`;
				break;
		}
	}
}