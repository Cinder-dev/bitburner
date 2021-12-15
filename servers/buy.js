/** @param {NS} ns **/
export async function main(ns) {
	let {mem, count} = ns.flags([
		["mem", 0],
		["count", 0]
	]);

	if (mem === 0 || count === 0) return;

	if(await ns.prompt(`Purchase ${count} ${mem}GB server(s) for ${ns.nFormat(count * ns.getPurchasedServerCost(mem), '($0a)')}`)) {
		for (let i = 0; i < count; i++) {
			ns.purchaseServer("private", mem);
		}
	}
}