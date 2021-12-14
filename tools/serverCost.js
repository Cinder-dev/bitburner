/** @param {NS} ns **/
export async function main(ns) {
	for(let i = 2; i <= 1048576; i = i * 2) {
		ns.tprint(`${i}GB - ${ns.nFormat(ns.getPurchasedServerCost(i), '($0.00a)')}`);
	}
}