export function getAllServers(ns: NS): string[] {
	return _getAllServers(ns, "", "home");
}

function _getAllServers(ns: NS, parent: string, child: string): string[] {
	let servers: string[] = [];
	let scan = ns.scan(child);
	for(let server of scan) {
		if (server === parent) continue;
		servers.push(server);
		servers = servers.concat(_getAllServers(ns, child, server));
	}
	return servers;
}