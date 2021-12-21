import { table } from "./util.table.js";
export async function main(ns) {
    let files = ns.ls("home").filter(s => s.endsWith(".js"));
    ns.tprint(table(["Filename", "Ram Size"], files, files.map(s => `${ns.getScriptRam(s, "home")}GB`)));
}
