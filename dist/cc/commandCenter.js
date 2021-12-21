import { getAllServers } from 'util/lists.js';
let instance = null;
const StartFlags = [["fresh", false]];
export function autocomplete(data, args) {
    let commands = [];
    switch (args.length) {
        case 1:
            commands.push("show", "start", "stop", "task");
            break;
        case 2:
            switch (args[0]) {
                case "start":
                    data.flags(StartFlags);
                    break;
            }
            break;
        default:
            commands.push(...data.servers);
            break;
    }
    return commands;
}
export async function main(ns) {
    switch (ns.args[0]) {
        case "show":
            if (instance !== null) {
                instance.ns.tail();
            }
            else {
                ns.tprint("Command Center is not running");
            }
            break;
        case "stop":
            if (instance !== null) {
                instance.shutdown();
            }
            else {
                ns.tprint("Command Center is not running");
            }
            break; // Stop
        case "start":
            const { fresh } = ns.flags(StartFlags);
            if (fresh) {
                if (instance !== null) {
                    instance.shutdown();
                }
                instance = new CommandCenter(ns);
                ns.atExit(() => instance = null);
                await instance.start();
                return;
            }
            else {
                if (instance !== null) {
                    ns.tprint("Command Center is already running, us 'cc start --fresh' to restart it.");
                    return;
                }
                else {
                    instance = new CommandCenter(ns);
                    ns.atExit(() => instance = null);
                    await instance.start();
                    return;
                }
            }
            break; // Start
        default:
            ns.tprint("Command Center Usage: ");
            ns.tprint("TBA");
            break;
    }
}
class ModuleRef {
    name;
    script;
    threads;
    port;
    pid = -1;
    constructor(name, script, threads, port) {
        this.name = name;
        this.script = script;
        this.threads = threads;
        this.port = port;
    }
}
class Node {
    pid;
    threads;
    target;
    server;
    action = "Weaken";
    log = "";
    constructor(pid, threads, target, server) {
        this.pid = pid;
        this.threads = threads;
        this.target = target;
        this.server = server;
    }
}
export const Modules = [
    new ModuleRef("Hacknet", "/cc/modules/hacknet.js", 1, 3),
    new ModuleRef("Distribution", "/cc/modules/distribution.js", 1, 4),
    new ModuleRef("Status", "/cc/modules/status.js", 1, 5),
    new ModuleRef("Servers", "/cc/modules/servers.js", 1, 6),
];
class CommandCenter {
    ns;
    state = {
        servers: [],
        manipulateStock: []
    };
    runtime;
    constructor(ns) {
        this.ns = ns;
        this.runtime = {
            nodes: [],
            script: this.ns.getRunningScript(),
            player: this.ns.getPlayer(),
            running: true,
            modules: [...Modules],
        };
        this.readState();
    }
    readState() {
        let raw = this.ns.read("/cc/state.txt");
        if (raw === "")
            return;
        this.state = JSON.parse(raw);
    }
    async writeState() {
        await this.ns.write("/cc/state.txt", JSON.stringify(this.state), "w");
    }
    async postStatus() {
        this.ns.clearPort(1);
        let status = JSON.stringify({
            state: this.state,
            runtime: this.runtime
        });
        await this.ns.writePort(1, status);
    }
    async findServers() {
        this.state.servers = getAllServers(this.ns).map(h => this.ns.getServer(h));
    }
    async checkModules() {
        for (const module of this.runtime.modules) {
            if (this.ns.getRunningScript(module.pid) === null) {
                module.pid = -1;
            }
        }
    }
    async cleanupWorkers() {
        console.log(this.runtime.nodes);
        // for (const node in this.state.nodes) {
        // 	if (this.ns.getRunningScript(node) === null) {
        // 		this.state.nodes
        // 	}
        // }
    }
    async growWorkers() {
        const workerRam = this.ns.getScriptRam("/cc/worker/worker.js", "home");
        for (const server of this.state.servers.filter(s => s.hasAdminRights)) {
            const { hostname, maxRam, ramUsed } = server;
            const freeRam = maxRam - ramUsed;
            const maxThreads = Math.floor(freeRam / workerRam);
            if (maxThreads > 0) {
                this.ns.print("INFO: Attempting to start 'worker.js' @" + hostname + " w " + maxThreads + " threads");
                await this.ns.scp(["/cc/worker/worker.js"], "home", hostname);
                const pid = this.ns.exec("/cc/worker/worker.js", hostname, maxThreads);
                if (pid !== 0) {
                    this.runtime.nodes.push(new Node(pid, maxThreads, "n00dles", server));
                }
                else {
                    this.ns.print("ERROR: Unable to start 'worker.js' @" + hostname);
                }
            }
        }
    }
    async start() {
        for (const module of this.runtime.modules) {
            module.pid = this.ns.run(module.script, module.threads, module.port);
        }
        while (this.runtime.running) {
            await this.checkModules();
            this.runtime.script = this.ns.getRunningScript();
            this.runtime.player = this.ns.getPlayer();
            await this.findServers();
            await this.growWorkers();
            await this.postStatus();
            await this.cleanupWorkers();
            await this.writeState();
            await this.ns.sleep(50);
        }
        for (const module of this.runtime.modules) {
            module.pid > 0 && this.ns.kill(module.pid);
        }
    }
    shutdown() {
        this.runtime.running = false;
    }
}
