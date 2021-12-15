/** 
 * @param {NS} ns Scripting Runtime 
 * @return {string[]} list of servers
 */
export function getAllServers(ns) {
	return _getAllServers(ns, "", "home")
}

function _getAllServers(ns, parent, child) {
	let servers = [];
	let scan = ns.scan(child);
	for(let server of scan) {
		if (server == parent) continue;
		servers.push(server);
		servers = servers.concat(_getAllServers(ns, child, server))
	}
	return servers;
}