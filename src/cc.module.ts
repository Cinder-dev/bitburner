import {CCRuntime, CCState} from "./cc.commandCenter.js";

export class Module {
	ns: NS;
	name: string;
	interval: number;
	running: boolean = true;

	statusPort: NetscriptPort;
	commandPort: NetscriptPort;

	constructor(ns: NS, name: string, port: number, interval: number = 100) {
		this.ns = ns;
		this.name = name;
		this.interval = interval;
		this.statusPort = this.ns.getPortHandle(1);
		this.commandPort = this.ns.getPortHandle(port);
	}

	async start() {
		while(this.running) {
			let raw = this.commandPort.read();
			let command = (raw === "NULL PORT DATA" ? null : JSON.parse(raw));
			raw = this.statusPort.peek();
			let status = (raw === "NULL PORT DATA" ? null : JSON.parse(raw));
			await this.update(command, status);
			await this.ns.sleep(this.interval);
		}
	}

	/** 
	 * @param command Commands issued by the Command Center
	 * @param status Command Center Status
	 */
	async update(command: any | null, status: { state: CCState, runtime: CCRuntime} | null) {
		this.ns.print(`${this.name} Module is not implementing update`);
	}

	shutdown() {
		this.running = false;
	}
}