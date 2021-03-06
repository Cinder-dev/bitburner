const baseURL = "https://raw.githubusercontent.com/Cinder-dev/bitburner/main/dist/";
const files = [
    "cc.module.distribution.js",
    "cc.module.hacknet.js",
    "cc.module.servers.js",
    "cc.module.status.js",
    "cc.worker.js",
    "cc.commandCenter.js",
    "cc.constants.js",
    "cc.module.js",
    "tools.buyServer.js",
    "tools.backdoor.js",
    "tools.find.js",
    "tools.goto.js",
    "tools.ll.js",
    "util.lists.js",
    "util.table.js",
];
export async function main(ns) {
    ns.toast("Updating Code From Github", "info");
    for (const file of files) {
        if (await ns.wget(baseURL + file, file, "home")) {
            // Success
            ns.toast(`Updated ${file} from github.`, "success");
        }
        else {
            // Fail
            ns.tprint(`Failed to get ${file} from github.`);
            ns.toast(`Failed to get ${file} from github.`, "error");
        }
        await ns.sleep(500);
    }
    ns.toast("Finished Updating Code From Github", "info");
}
