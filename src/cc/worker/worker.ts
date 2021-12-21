import {CCRuntime, CCState} from "cc/commandCenter.js";
import {MoneyFormat} from "cc/constants.js";

export async function main(ns: NS) {
	ns.disableLog("ALL");
	const id = ns.getRunningScript().pid;
	if (id === null || id < 0) return;
	const ccStatus = ns.getPortHandle(1);
	let host = ns.getHostname();

	while(true) {
		if (ccStatus.empty()){
			// Command Center is not dispatching info
			await ns.sleep(1000);
			continue;
		}
		const {state, runtime} = JSON.parse(ccStatus.peek()) as {state: CCState, runtime: CCRuntime};

		if (runtime.nodes === undefined) {
			await ns.sleep(1000);
			continue;
		}

		const {target, action} = runtime.nodes.find(n => n.pid === id)!!;

		let serverInfo = state.servers.find(s => s.hostname === target)!!;
		let lastMsg = "";
		let growTime = ns.getGrowTime(serverInfo.hostname);
		let weakenTime = ns.getWeakenTime(serverInfo.hostname);
		let hackTime = ns.getHackTime(serverInfo.hostname);
		let data = { threads: ns.args[0], hostname: host, target: serverInfo.hostname, startTime: Date.now(), lastMsg: lastMsg };

		switch (action) {
			case "Weaken":
				ns.print(JSON.stringify({...data, action, runTime: weakenTime}));
				let weakened = await ns.weaken(serverInfo.hostname);
				lastMsg = `Weakened by ${weakened.toFixed(2)}`;
				break;
			case "Grow":
				ns.print(JSON.stringify({...data, action, runTime: growTime}));
				let growth = await ns.grow(serverInfo.hostname);
				lastMsg = `Added ${ns.nFormat(serverInfo.moneyAvailable * (growth - 1), MoneyFormat)}`;
				break;
			case "Hack":
				ns.print(JSON.stringify({...data, action, runTime: hackTime}));
				let stolen = await ns.hack(serverInfo.hostname);
				lastMsg = `Stolen ${ns.nFormat(stolen, MoneyFormat)}`;
				break;
			case "Idle":
				ns.print(JSON.stringify({...data, action, runTime: 1000}));
				await ns.sleep(1000);
				lastMsg = `Idle`;
				break;
		}
	}
}