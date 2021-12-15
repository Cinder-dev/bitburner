const baseURL = "https://raw.githubusercontent.com/Cinder-dev/bitburner/main";

const files = [
	"/cc/commands/modules.js",
	"/cc/commands/target.js",
	"/cc/distribution/distributionModule.js",
	"/cc/hacknet/hacknetModule.js",
	"/cc/servers/serversModule.js",
	"/cc/status/statusModule.js",
	"/cc/commandCenter.js",
	"/cc/module.js",
	"/hacks/worker.js",
	"/servers/buy.js",
	"/tools/backdoor.js",
	"/tools/distribute.js",
	"/tools/find.js",
	"/tools/goto.js",
	"/tools/replicate.js",
	"/tools/serverCost.js",
	"/tools/status.js",
	"/util/lists.js",
	"/util/table.js",
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
		await ns.sleep(500);
	}
	ns.toast("Finished Updating Code From Github", "info");
}