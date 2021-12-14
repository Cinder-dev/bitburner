const baseURL = "https://raw.githubusercontent.com/Cinder-dev/bitburner/main";

const files = [
    "/cc/commands/modules.js",
    "/cc/hacknet/hacknetModule.js",
    "/cc/commandCenter.js",
    "/cc/module.js",
    "/hacks/master.js",
    "/hacks/worker.js",
    "/servers/buy.js",
    "/tools/backdoor.js",
    "/tools/distribute.js",
    "/tools/replicate.js",
    "/tools/serverCost.js",
    "/tools/status.js",
];

/** {NS} ns Scripting Runtime */
export async function main(ns) {
    ns.toast("Updating Code From Github", "info");
    for (const file of files) {
        if(await ns.wget(baseURL + file, file, "home")) {
            // Success
            ns.toast(`Updated ${file} from github.`, "success");
        } else {
            // Fail
            ns.tprint(`Failed to get ${file} from github.`);
            ns.toast(`Failed to get ${file} from github.`, "error");
        }
        await ns.sleep(200);
    }
    ns.toast("Finished Updating Code From Github", "info");
}