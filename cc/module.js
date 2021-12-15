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
			await this.update(this.ns.readPort(this.port));
			await this.ns.sleep(100);
		}
	}

	/** @param {string} command Commands issued by the Command Center */
	async update(command) {
		this.ns.print(`${this.name} Module is not implementing update`);
	}

	shutdown() {
		this.running = false;
	}
}