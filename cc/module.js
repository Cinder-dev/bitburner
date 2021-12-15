export class Module {
	/** 
	 * @param {NS} ns Scripting Runtime 
	 * @param {string} name module name
	 * @param {number} port command port
	 * @param {number} interval ms between update pulses
	 */
	constructor(ns, name, port, interval = 100) {
		this.ns = ns;
		this.name = name;
		this.port = port;
		this.interval = interval;
		this.running = true;
	}

	async start() {
		while(this.running) {
			let raw = this.ns.readPort(this.port);
			let command = (raw == "NULL PORT DATA" ? null : JSON.parse(raw));
			raw = this.ns.peek(1);
			let status = (raw == "NULL PORT DATA" ? null : JSON.parse(raw));
			await this.update(command, status);
			await this.ns.sleep(this.interval);
		}
	}

	/** 
	 * @param {any | null} command Commands issued by the Command Center
	 * @param {any | null} status Command Center Status
	 */
	async update(command, status) {
		this.ns.print(`${this.name} Module is not implementing update`);
	}

	shutdown() {
		this.running = false;
	}
}