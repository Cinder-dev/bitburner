export function autocomplete(data, args) {
	return [...data.servers, ...data.files];
}

/** @param {NS} ns **/
export async function main(ns) {
	if (ns.args[0] === null) return;
	let files = ["/hacks/master.js", "/hacks/worker.js"];
	if (ns.args[0] === "ALL") {
		for (let host of ns.scan("home")) {
			await replicate(ns, files, "home", host);
		}
	} else {
    	await ns.scp(files, "home", ns.args[0]);
	}
}

async function replicate(ns, files, root, target) {
	await ns.scp(files, "home", target);
	for (let host of ns.scan(target).filter(host => host !== root)) {
		await replicate(ns, files, target, host);
	}
}