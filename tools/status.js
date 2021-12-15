import { getAllServers } from '/util/lists.js';
import { table } from '/util/table.js';

const MaxReducer = (a, b) => a > b ? a : b;
const LevelSort = (a, b) => a.requiredHackingSkill - b.requiredHackingSkill;

const MoneyFormat = '$0.0a';
const TimeFormat = '0:00:00';

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail("/tools/status.js", "home", ...ns.args);
	const hostnames = getAllServers(ns);
	/** @type {Server[]} */
	const servers = hostnames.map(hostname => ns.getServer(hostname));
	servers.sort(LevelSort);

	ns.print(table(
		["Lv", "Hostname", "R", "P", "Memory", "Usage", "Cur $", "Max $", "Security", "Growth", "Hack Time", "Grow Time", "Weaken Time", "Hack Chance"],
		servers.map(s => `${s.requiredHackingSkill}`),
		servers.map(s => s.hostname),
		servers.map(s => s.hasAdminRights ? "Y" : "N"),
		servers.map(s => `${s.numOpenPortsRequired}`),
		servers.map(s => `${s.maxRam}GB`),
		servers.map(s => s.maxRam == 0 ? "-" : `${(s.ramUsed / s.maxRam * 100).toFixed(0)}%`),
		servers.map(s => s.moneyMax == 0 ? "-" : ns.nFormat(s.moneyAvailable, MoneyFormat)),
		servers.map(s => s.moneyMax == 0 ? "-" : ns.nFormat(s.moneyMax, MoneyFormat)),
		servers.map(s => s.moneyMax == 0 ? "-" : `${s.minDifficulty.toFixed(1)}/${s.hackDifficulty.toFixed(1)}`),
		servers.map(s => s.moneyMax == 0 ? "-" : `${s.serverGrowth}`),
		servers.map(s => s.moneyMax == 0 ? "-" : ns.nFormat(ns.getHackTime(s.hostname) / 1000, TimeFormat)),
		servers.map(s => s.moneyMax == 0 ? "-" : ns.nFormat(ns.getGrowTime(s.hostname) / 1000, TimeFormat)),
		servers.map(s => s.moneyMax == 0 ? "-" : ns.nFormat(ns.getWeakenTime(s.hostname) / 1000, TimeFormat)),
		servers.map(s => s.moneyMax == 0 ? "-" : `${(ns.hackAnalyzeChance(s.hostname) * 100).toFixed(2)}%`),
	));
}