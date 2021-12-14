export class Module {
	/** 
	 * @param {NS} ns Scripting Runtime 
	 * @param {string} name module name
	 */
	constructor(ns, name) {
		this.ns = ns;
		this.name = name
	}

	async update() {
		this.ns.print(`${this.name} Module is not implementing update`);
	}

	async shutdown() {
		this.ns.print(`${this.name} Module is not implementing shutdown`);
	}
}