import { Module } from './cc.module.js';
import {CCRuntime, CCState} from "./cc.commandCenter.js";

let isRunning = false;

export async function main(ns: NS) {
	ns.disableLog("ALL");
	// Check for command port
	if (ns.args.length === 0) { 
		ns.print("Module Port required");
		return;
	}
	if (isRunning) {
		ns.tprint("Distribution Module is already running.");
		return;
	}
	isRunning = true;
	const distributionModule = new Distribution(ns, ns.args[0] as number);
	//ns.tail(ns.getRunningScript().pid);
	ns.atExit(() => isRunning = false);

	await distributionModule.start();
}

export class Distribution extends Module {
	constructor(ns: NS, port: number) {
		super(ns, "Distribution", port, 1000);
	}

	async update(command: any | null, status: {state: CCState, runtime: CCRuntime} | null) {
	}
}