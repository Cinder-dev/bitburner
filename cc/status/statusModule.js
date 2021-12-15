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
	}

	async update(command) {
		const raw = this.ns.peek(1);
		if (raw === "NULL PORT DATA") return;
		const status = JSON.parse(raw);
		const {target, modules} = status;

		try {
			const left = [];
			const right = [];

			function row(l, r) { left.push(l); right.push(r); }

			row("Progression", "---");
			row("Hacks", Hacks.map(hack => this.ns.fileExists(hack, "home") ? 1 : 0).reduce((a, b) => a + b));

			row("Hacking", "---");

			// Add current Target
			row("Target", target.hostname);
			const {moneyAvailable, moneyMax} = target.server;
			const percentage = (moneyAvailable / moneyMax * 100).toFixed(0);
			row("Money", `${this.ns.nFormat(moneyAvailable, MoneyFormat)}/${this.ns.nFormat(moneyMax, MoneyFormat)} ${percentage}%`);
			const {minDifficulty, hackDifficulty} = target.server;
			row("Security", `${minDifficulty.toFixed(2)}/${hackDifficulty.toFixed(2)}`);
			row("Growth", target.server.serverGrowth);
			row("Hack Time", this.ns.nFormat(this.ns.getHackTime(target.hostname) / 1000, TimeFormat))
			row("Grow Time", this.ns.nFormat(this.ns.getGrowTime(target.hostname) / 1000, TimeFormat))
			row("Weaken Time", this.ns.nFormat(this.ns.getWeakenTime(target.hostname) / 1000, TimeFormat))
			row("Hack Chance", `${(this.ns.hackAnalyzeChance(target.hostname) * 100).toFixed(2)}%`)

			this.leftColumn.innerText = left.join(" \n");
			this.rightColumn.innerText = right.join("\n");
		} catch (err) {
			this.ns.print("Error: Update Skipped - " + String(err));
		}
	}
}