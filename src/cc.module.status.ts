import {MoneyFormat, TimeFormat, Hacks, Doc} from "./cc.constants.js";
import {Module} from './cc.module.js';
import {table} from "./util.table.js";
import {CCRuntime, CCState} from "./cc.commandCenter.js";

let isRunning = false;

export async function main(ns: NS) {
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
	const statusModule = new Status(ns, ns.args[0] as number);
	ns.atExit(() => isRunning = false);
	ns.tail();

	await statusModule.start();
}

export class Status extends Module {
	leftColumn: HTMLElement | null;
	rightColumn: HTMLElement | null;

	constructor(ns: NS, port: number) {
		super(ns, "Status", port, 1000);
		this.leftColumn = Doc.getElementById("overview-extra-hook-0");
		this.rightColumn = Doc.getElementById("overview-extra-hook-1");

		let style = Doc.createElement("style");
		style.id = "custom-styles"
		let fontSizeBase = 10;
		style.innerHTML = `
			span[role=progressbar]{
				height: 1px !important;
				margin-top: 2px !important;
			}
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
		Doc.getElementById("custom-styles")?.remove()
		Doc.getElementsByTagName('head')[0].appendChild(style);
	}

	async update(command: any | null, status: { state: CCState, runtime: CCRuntime } | null) {
		if (status === null) return;
		const {servers} = status.state;
		const {player} = status.runtime;

		// Status Tail
		this.ns.clearLog();
		// Private Server Costs
		const costs = [];
		for (let i = 2; i <= 1048576; i = i * 2) {
			const cost = this.ns.getPurchasedServerCost(i);
			costs.push({
				size: i,
				cost: this.ns.getPurchasedServerCost(i),
				color: cost > player.money ? "ERROR" : "SUCCESS"
			});
		}

		this.ns.print("||| Personal Servers Cost |||")
		table(
			["Color", "Memory", "Cost", "Command"],
			costs.map(c => c.color),
			costs.map(c => `${c.size}GB`),
			costs.map(c => this.ns.nFormat(c.cost, MoneyFormat)),
			costs.map(c => `buyServer --mem ${c.size} --count #`)
		).split("\n").forEach(line => {
			this.ns.print(line);
		})

		this.ns.print("||| Servers |||")
		this.ns.print("SUCCESS: Rooted")
		this.ns.print("WARN: Can Root")
		this.ns.print("ERROR: Cannot Root")
		// Servers
		servers.sort((a, b) => a.requiredHackingSkill - b.requiredHackingSkill);
		table(
			["Color", "Lv", "Hostname", "Memory", "Usage", "Cur $", "Max $", "Security", "Growth", "Hack Time", "Grow Time", "Weaken Time", "Hack Chance"],
			servers.map(s => {
				if (s.hasAdminRights) {
					return "SUCCESS"
				} else {
					if (s.numOpenPortsRequired <= (Hacks.map(hack => this.ns.fileExists(hack) ? 1 : 0) as number[]).reduce((a, b) => a + b)) {
						return "WARN"
					} else {
						return "ERROR"
					}
				}
			}),
			servers.map(s => `${s.requiredHackingSkill}`),
			servers.map(s => s.hostname),
			servers.map(s => `${s.maxRam}GB`),
			servers.map(s => s.maxRam === 0 ? "-" : `${(s.ramUsed / s.maxRam * 100).toFixed(0)}%`),
			servers.map(s => s.moneyMax === 0 ? "-" : this.ns.nFormat(s.moneyAvailable, MoneyFormat)),
			servers.map(s => s.moneyMax === 0 ? "-" : this.ns.nFormat(s.moneyMax, MoneyFormat)),
			servers.map(s => s.moneyMax === 0 ? "-" : `${s.minDifficulty.toFixed(1)}/${s.hackDifficulty.toFixed(1)}`),
			servers.map(s => s.moneyMax === 0 ? "-" : `${s.serverGrowth}`),
			servers.map(s => s.moneyMax === 0 ? "-" : this.ns.nFormat(this.ns.getHackTime(s.hostname) / 1000, TimeFormat)),
			servers.map(s => s.moneyMax === 0 ? "-" : this.ns.nFormat(this.ns.getGrowTime(s.hostname) / 1000, TimeFormat)),
			servers.map(s => s.moneyMax === 0 ? "-" : this.ns.nFormat(this.ns.getWeakenTime(s.hostname) / 1000, TimeFormat)),
			servers.map(s => s.moneyMax === 0 ? "-" : `${(this.ns.hackAnalyzeChance(s.hostname) * 100).toFixed(2)}%`),
		).split("\n").forEach(line => {
			this.ns.print(line);
		})

		// Sidebar
		try {
			const left: string[] = [];
			const right: string[] = [];

			function row(l: string, r: string) {
				left.push(l);
				right.push(r);
			}

			row("- Current -", "---");
			row("Uptime", this.ns.nFormat(this.ns.getPlayer().playtimeSinceLastAug / 1000, TimeFormat))
			row("Hacks", (Hacks.map(hack => this.ns.fileExists(hack) ? 1 : 0) as number[]).reduce((a, b) => a + b).toString());

			row("- Hacknet -", "---")
			row("Nodes", this.ns.hacknet.numNodes().toString())
			row("Production", this.ns.hacknet.numNodes() === 0 ? "$0/s" : `${this.ns.nFormat(Array(this.ns.hacknet.numNodes()).fill(0).map((v, i) => this.ns.hacknet.getNodeStats(i).production).reduce((a, b) => a + b), MoneyFormat)}/s`);

			// row("- Hacking -", "---");
			// Add current Target
			// row("Target", target.hostname);
			// const {moneyAvailable, moneyMax} = target.server;
			// const percentage = (moneyAvailable / moneyMax * 100).toFixed(0);
			// row("Money", `${this.ns.nFormat(moneyAvailable, MoneyFormat)} ${percentage}%`);
			// row("Max", this.ns.nFormat(moneyMax, MoneyFormat))
			// const {minDifficulty, hackDifficulty} = target.server;
			// row("Security", `${minDifficulty.toFixed(2)}/${hackDifficulty.toFixed(2)}`);
			// row("Growth", target.server.serverGrowth);
			// row("Hack Time", this.ns.nFormat(this.ns.getHackTime(target.hostname) / 1000, TimeFormat))
			// row("Grow Time", this.ns.nFormat(this.ns.getGrowTime(target.hostname) / 1000, TimeFormat))
			// row("Weaken Time", this.ns.nFormat(this.ns.getWeakenTime(target.hostname) / 1000, TimeFormat))
			// row("Hack Chance", `${(this.ns.hackAnalyzeChance(target.hostname) * 100).toFixed(2)}%`)
			//
			// row("- Workers -", "---")
			// row("Weakening", servers.filter(s => this.ns.serverExists(s.hostname) && this.ns.hasRootAccess(s.hostname) && s.action === "Weaken").length)
			// row("Growing", servers.filter(s => this.ns.serverExists(s.hostname) && this.ns.hasRootAccess(s.hostname) && s.action === "Grow").length)
			// row("Hacking", servers.filter(s => this.ns.serverExists(s.hostname) && this.ns.hasRootAccess(s.hostname) && s.action === "Hack").length)
			//
			// row("- Factions -", "---");
			// row("Working @", this.ns.getPlayer().currentWorkFactionName.padStart(1, ""));

			if (this.leftColumn)
				this.leftColumn.innerText = left.join(" \n");
			if (this.rightColumn)
				this.rightColumn.innerText = right.join("\n");
		} catch (err) {
			this.ns.print("Error: Update Skipped - " + String(err));
		}
	}
}