import { Module } from '../module.js';
import { table } from '../../util/table.js';
import { MoneyFormat, TimeFormat } from "../constants.js";
let isRunning = false;
export async function main(ns) {
    ns.disableLog("ALL");
    // Check for command port
    if (ns.args.length === 0) {
        ns.print("Module Port required");
        return;
    }
    if (isRunning) {
        ns.tprint("Hacknet Module is already running.");
        return;
    }
    isRunning = true;
    const hacknetModule = new HackNet(ns, ns.args[0]);
    ns.tail();
    ns.atExit(() => isRunning = false);
    await hacknetModule.start();
}
export class HackNet extends Module {
    hacknet;
    constructor(ns, port) {
        super(ns, "Hacknet", port, 500);
        this.hacknet = ns.hacknet;
    }
    async update(command, status) {
        this.ns.clearLog();
        let nodes = Array(this.hacknet.numNodes()).fill(0);
        this.ns.print(`Nodes: ${nodes.length} of ${this.hacknet.maxNumNodes()}`);
        this.ns.print(`Total Production: ${nodes.length === 0 ? "$0 /s" : this.ns.nFormat(nodes.map((v, i) => this.hacknet.getNodeStats(i).production).reduce((a, b) => a + b), MoneyFormat)} /s`);
        this.ns.print(`Total Produced: ${nodes.length === 0 ? "$0" : this.ns.nFormat(nodes.map((v, i) => this.hacknet.getNodeStats(i).totalProduction).reduce((a, b) => a + b), MoneyFormat)}`);
        this.ns.print(table(["Node", "Produced", "Uptime", "Production", "Lv", "RAM", "Cores"], nodes.map((v, i) => this.hacknet.getNodeStats(i).name), nodes.map((v, i) => this.ns.nFormat(this.hacknet.getNodeStats(i).totalProduction, MoneyFormat)), nodes.map((v, i) => this.ns.nFormat(this.hacknet.getNodeStats(i).timeOnline, TimeFormat)), nodes.map((v, i) => `${this.ns.nFormat(this.hacknet.getNodeStats(i).production, MoneyFormat)} /s`), nodes.map((v, i) => `${this.hacknet.getNodeStats(i).level}`), nodes.map((v, i) => `${this.hacknet.getNodeStats(i).ram}`), nodes.map((v, i) => `${this.hacknet.getNodeStats(i).cores}`)));
        this.ns.print("Next Node Cost: " + this.ns.nFormat(this.hacknet.getPurchaseNodeCost(), MoneyFormat));
        this.ns.print("Upgrade Budget: " + this.ns.nFormat(this.ns.getPlayer().money / 100, MoneyFormat));
        await this.checkForUpgrades();
    }
    async checkForUpgrades() {
        let availableFunds = this.ns.getPlayer().money / 100;
        // Check if we can buy a new node
        if (availableFunds >= this.hacknet.getPurchaseNodeCost()) {
            this.hacknet.purchaseNode();
            return;
        }
        for (let i = 0; i < this.hacknet.numNodes(); i++) {
            let node = this.hacknet.getNodeStats(i);
            // Check if we can buy a node level
            if (node.level < 200 && availableFunds >= this.hacknet.getLevelUpgradeCost(i, 1)) {
                this.hacknet.upgradeLevel(i, 1);
                return;
            }
            // Check if we can buy node ram
            if (node.ram < 64 && availableFunds >= this.hacknet.getRamUpgradeCost(i, 1)) {
                this.hacknet.upgradeRam(i, 1);
                return;
            }
            // Check if we can buy node cores
            if (node.cores < 16 && availableFunds >= this.hacknet.getCoreUpgradeCost(i, 1)) {
                this.hacknet.upgradeCore(i, 1);
                return;
            }
        }
    }
}
