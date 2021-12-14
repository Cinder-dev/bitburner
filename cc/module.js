export class Module {
	/** @param {NS} ns Scripting Runtime */
	constructor(ns) {
		this.ns = ns;
	}

	async update() {
		this.ns.print("Module is not implementing update");
	}

	async shutdown() {
		this.ns.print("Module is not implementing shutdown");
	}
}