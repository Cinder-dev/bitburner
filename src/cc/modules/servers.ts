import {Module} from 'cc/module.js';
import {table} from 'util/table.js';
import {CCRuntime, CCState} from "cc/commandCenter.js";

let isRunning = false;

export async function main(ns: NS) {
	ns.disableLog("ALL");
	// Check for command port
	if (ns.args.length === 0) {
		ns.print("Module Port required");
		return;
	}
	if (isRunning) {
		ns.tprint("Servers Module is already running.");
		return;
	}
	isRunning = true;
	const serversModule = new Servers(ns, ns.args[0] as number);
	ns.tail();
	ns.atExit(() => isRunning = false);

	await serversModule.start();
}

export class Servers extends Module {
	constructor(ns: NS, port: number) {
		super(ns, "Servers", port, 1000);
	}

	async update(command: any | null, status: { state: CCState, runtime: CCRuntime } | null) {
		let now = Date.now();

		if (status && status.runtime.nodes.length > 0) {
			this.ns.clearLog();
			const nodes = status.runtime.nodes;
			nodes.sort((a, b) => (a.threads !== b.threads ? (a.threads - b.threads) : a.server.hostname.localeCompare(b.server.hostname)));

			this.ns.print(table(
				["Hostname", "T", "Target", "Action", "Time Left", "Bar", "Result"],
				nodes.map(s => s.server.hostname),
				nodes.map(s => `${s.threads}`),
				nodes.map(s => s.target),
				nodes.map(s => s.action),
				nodes.map(s => {
					let finishTime = JSON.parse(s.log).startTime + JSON.parse(s.log).runTime;
					return this.ns.nFormat((finishTime - now) / 1000, '00:00:00');
				}),
				nodes.map(s => {
					const BarSize = 20;
					let finishTime = JSON.parse(s.log).startTime + JSON.parse(s.log).runTime;
					let timeRemaining = finishTime - now;
					let percentage = (JSON.parse(s.log).runTime - timeRemaining) / JSON.parse(s.log).runTime;
					let fill = Math.round(BarSize * percentage);
					let drain = Math.round(BarSize * (1 - percentage));
					if (isNaN(fill) || isNaN(drain) || !isFinite(fill) || !isFinite(drain) || fill < 0 || drain < 0) return "-".repeat(BarSize);
					try {
						return ("|".repeat(fill) + "-".repeat(drain));
					} catch (err) {
						console.log(fill + " " + drain);
						return "-".repeat(BarSize);
					}
				}),
				nodes.map(s => JSON.parse(s.log).lastMsg),
			));
		}
	}
}