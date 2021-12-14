/** @param {NS} ns **/
export async function main(ns) {
	if (ns.args[0] === null || ns.args[0] % 2 !== 0) return;
    let mem = ns.args[0];

	if(await ns.prompt(`Purchase a ${mem}GB server for ${ns.nFormat(ns.getPurchasedServerCost(mem), '($0a)')}`)) {
		ns.purchaseServer("private", mem);
	}
}