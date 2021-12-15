import { getAllServers } from '/util/lists.js';

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

/**
 * Create a Table display of the provided data
 * @param {string[]} headers Column Headers
 * @param  {...string[]} columns Column data
 */
function table(headers, ...columns) {
	// Calculate Column Widths
	let widths = [];
	columns.forEach((c, i) => {
		widths[i] = c.concat([headers[i]]).map(s => s.length).reduce(MaxReducer);
	});

	let output = "\n";

	// Write Headers
	headers.forEach((h, i) => {
		output += ` ${h.padEnd(widths[i], " ")} |`;
	});

	output += "\n";

	// Write Separator
	headers.forEach((h, i) => {
		output += `${"".padEnd(widths[i] + 2, "=")}|`;
	});

	output += "\n";

	let rows = columns[0].length;
	for (let row = 0; row < rows; row++) {
		columns.forEach((c, i) => {
			if (c[row] == "-") {
				output += ` ${"".padEnd(widths[i], "-")} |`;
			} else {
				output += ` ${c[row].padEnd(widths[i], " ")} |`;
			}
		});

		output += "\n";
	}

	return output;
}