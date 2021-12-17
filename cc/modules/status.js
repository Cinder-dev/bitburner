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
	const statusModule = new Status(ns, ns.args[0]);
	ns.atExit(() => isRunning = false);

	await statusModule.start();
}

const MoneyFormat = '$0.0a';
const TimeFormat = '0:00:00';

const Hacks = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];

export class Status extends Module {
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
		let fontSizeBase = 10;
		style.innerHTML = `
			a { font-size: ${fontSizeBase}px !important; }
			p { 
				font-family: "Fira Mono", "Lucida Console", "Lucida Sans Unicode", Consolas, "Courier New", Courier, monospace, "Times New Roman";
				font-size: ${fontSizeBase}px !important;
				line-height: 1.1 !important;
			}
			button { 
				font-size: ${fontSizeBase}px !important;
				line-height: 1 !important;
			}
			input { font-size: ${fontSizeBase}px !important; }
			h1 { font-size: ${fontSizeBase + 12}px !important; }
			h2 { font-size: ${fontSizeBase + 10}px !important; }
			h3 { font-size: ${fontSizeBase + 8}px !important; }
			h4 { font-size: ${fontSizeBase + 6}px !important; }
			h5 { font-size: ${fontSizeBase + 4}px !important; }
			h6 { font-size: ${fontSizeBase + 2}px !important; }
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

			row("- Factions -", "---");
			row("Working @", this.ns.getPlayer().currentWorkFactionName.padStart(1, ""));


			this.leftColumn.innerText = left.join(" \n");
			this.rightColumn.innerText = right.join("\n");
		} catch (err) {
			this.ns.print("Error: Update Skipped - " + String(err));
		}
	}
}