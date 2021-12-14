export function autocomplete(data, args) {
	switch(args.length) {
		case 1: return [...data.servers];
		case 3: return [true, false];
		default: return [];
	}
}

/** @param {NS} ns **/
export async function main(ns) {
	let foundHosts = [];
    ns.disableLog("ALL")
	
	function hostInfo(root) {
		if (root === "home") return " [home] Lv." + ns.getHackingLevel()
		let display = (ns.hasRootAccess(root) ? "[" + root + "]" : "(" + root + ")");
		return display + " Lv." + ns.getServerRequiredHackingLevel(root) + 
		" " + ns.getServerMaxRam(root) + "GB" +
		" !" + ns.getServerSecurityLevel(root).toFixed(1) + 
		" " + ns.nFormat(ns.getServerMoneyAvailable(root), '($0a)') + " of " + ns.nFormat(ns.getServerMaxMoney(root), '($0a)') + ")";
	}

	function printConnections(root, parent, currentDepth, maxDepth, hideLevelBlocked) {
		if (foundHosts.includes(root)) return [0, 0];
		if (currentDepth > maxDepth) return [0, 0];
		if (!hideLevelBlocked && ns.getHackingLevel() < ns.getServerRequiredHackingLevel(root)) return [0, 0];
		foundHosts.push(root);
		ns.tprint(repeatString(".", currentDepth) + hostInfo(root))
		let connections = ns.scan(root);
		let childConnections = 1
		let roots = ns.hasRootAccess(root) ? 1 : 0;
		for (let i in connections) {
			if (connections[i] != parent) {
				let [children, cRoots] = printConnections(connections[i], root, currentDepth + 1, maxDepth, hideLevelBlocked);
				childConnections += children;
				roots += cRoots;
			}
		}
		return [childConnections, roots];
	}

	function repeatString(str, num) {
		var build = ""
		for (var i = 0; i < num; i++) { build += str; }
		return build;
	}

	ns.tprint("=====================")
	ns.tprint("= Connection Status =")
	ns.tprint("=====================")
	let root = (ns.args.length >= 1) ? ns.args[0] : "home"
	root = ns.serverExists(root) ? root : "home"
	let maxDepth = (ns.args.length >= 2) ? ns.args[1] : 1000
	let hideLevelBlocked = (ns.args.length >= 3) ? ns.args[2] : false
	ns.tprint("Root: " + root)
	ns.tprint("Depth: " + maxDepth);
	let [connections, roots] = printConnections(root, "", 0, maxDepth, hideLevelBlocked);
	ns.tprint("Found Connections: " + connections);
	ns.tprint("Rooted Servers: " + roots);
}