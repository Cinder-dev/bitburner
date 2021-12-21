export function scan(ns, parent, server, target, route) {
    const children = ns.scan(server);
    for (const child of children) {
        if (parent === child)
            continue;
        if (child === target) {
            route.unshift(child);
            route.unshift(server);
            return true;
        }
        if (scan(ns, server, child, target, route)) {
            route.unshift(server);
            return true;
        }
    }
    return false;
}
export async function main(ns) {
    let server = ns.args[0];
    if (!ns.serverExists(server)) {
        ns.tprint("Server doesn't exist.");
        return;
    }
    ns.disableLog("ALL");
    ns.tail("/tools/find.js", "home", ...ns.args);
    let route = [];
    scan(ns, '', 'home', server, route);
    for (let i = 0; i < route.length; i++) {
        const extra = i > 0 ? "└ " : "";
        ns.print(`${" ".repeat(i)}${extra}${route[i]}`);
    }
}
export function autocomplete(data, args) {
    return data.servers;
}
