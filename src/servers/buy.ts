export async function main(ns: NS) {
	let {mem, count, label} = ns.flags([
		["mem", 0],
		["count", 0],
		["label", "private"]
	]);

	if (mem === 0 || count === 0) return;

	let cost = count * ns.getPurchasedServerCost(mem);

	let confirmation = await ns.prompt(`Purchase ${count} ${mem}GB server(s) for ${ns.nFormat(cost, '($0a)')}`);

	if(confirmation)
		Array(count).forEach(() => ns.purchaseServer(label, mem));
}