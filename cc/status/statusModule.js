import { Module } from '/cc/module.js';

let isRunning = false;

/** @param {NS} ns Scripting Runtime */
export async function main(ns) {
	ns.disableLog("ALL");
	// Check for command port
	if (ns.args.length === 0) { 
		ns.print("Module Port required");
		return;
	}
	if (isRunning) {
		ns.tprint("Status Module is already running.");
		return;
	}
	isRunning = true;
	const statusModule = new StatusModule(ns, ns.args[0]);
	ns.atExit(() => isRunning = false);

	await statusModule.start();
}

const MoneyFormat = '$0.0a';
const TimeFormat = '0:00:00';

const Hacks = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];

export class StatusModule extends Module {
	/** 
	 * @param {NS} ns Scripting Runtime
	 * @param {number} port command port
	 */
	constructor(ns, port) {
		super(ns, "Status", port, 1000);
		this.doc = globalThis["document"];
		this.leftColumn = this.doc.getElementById("overview-extra-hook-0");
		this.rightColumn = this.doc.getElementById("overview-extra-hook-1");

		let style = this.doc.createElement("style");
		style.innerHTML = `
			a { font-size: 12px !important; }
			p { font-size: 12px !important; }
			button { 
				font-size: 12px !important;
				line-height: 1 !important;
			}
			input { font-size: 12px !important; }
			h1 { font-size: 24px !important; }
			h2 { font-size: 22px !important; }
			h3 { font-size: 20px !important; }
			h4 { font-size: 18px !important; }
			h5 { font-size: 16px !important; }
			h6 { font-size: 14px !important; }
		`;
		this.doc.getElementsByTagName('head')[0].appendChild(style);
	}

	async update(command, status) {
		if (status === null) return;
		const {target, servers} = status;

		try {
			const left = [];
			const right = [];

			function row(l, r) { left.push(l); right.push(r); }

			row("- Current -", "---");
			row("Uptime", this.ns.nFormat(this.ns.getPlayer().playtimeSinceLastAug / 1000, TimeFormat))
			row("Hacks", Hacks.map(hack => this.ns.fileExists(hack, "home") ? 1 : 0).reduce((a, b) => a + b));

			row("- Hacknet -", "---")
			row("Nodes", this.ns.hacknet.numNodes())
			row("Production", this.ns.nFormat(Array(this.ns.hacknet.numNodes()).fill(0).map((v, i) => this.ns.hacknet.getNodeStats(i).production).reduce((a, b) => a + b), MoneyFormat));

			row("- Hacking -", "---");
			// Add current Target
			row("Target", target.hostname);
			const {moneyAvailable, moneyMax} = target.server;
			const percentage = (moneyAvailable / moneyMax * 100).toFixed(0);
			row("Money", `${this.ns.nFormat(moneyAvailable, MoneyFormat)} ${percentage}%`);
			row("Max", this.ns.nFormat(moneyMax, MoneyFormat))
			const {minDifficulty, hackDifficulty} = target.server;
			row("Security", `${minDifficulty.toFixed(2)}/${hackDifficulty.toFixed(2)}`);
			row("Growth", target.server.serverGrowth);
			row("Hack Time", this.ns.nFormat(this.ns.getHackTime(target.hostname) / 1000, TimeFormat))
			row("Grow Time", this.ns.nFormat(this.ns.getGrowTime(target.hostname) / 1000, TimeFormat))
			row("Weaken Time", this.ns.nFormat(this.ns.getWeakenTime(target.hostname) / 1000, TimeFormat))
			row("Hack Chance", `${(this.ns.hackAnalyzeChance(target.hostname) * 100).toFixed(2)}%`)

			row("- Workers -", "---")
			row("Weakening", servers.filter(s => this.ns.serverExists(s.hostname) && this.ns.hasRootAccess(s.hostname) && s.action === "Weaken").length)
			row("Growing", servers.filter(s => this.ns.serverExists(s.hostname) && this.ns.hasRootAccess(s.hostname) && s.action === "Grow").length)
			row("Hacking", servers.filter(s => this.ns.serverExists(s.hostname) && this.ns.hasRootAccess(s.hostname) && s.action === "Hack").length)


			this.leftColumn.innerText = left.join(" \n");
			this.rightColumn.innerText = right.join("\n");
		} catch (err) {
			this.ns.print("Error: Update Skipped - " + String(err));
		}
	}
}