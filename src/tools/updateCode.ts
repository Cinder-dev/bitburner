const baseURL = "https://raw.githubusercontent.com/Cinder-dev/bitburner/main/dist";

const files: string[] = [
	"/cc/commands/modules.js",
	"/cc/commands/target.js",
	"/cc/commands/task.js",
	"/cc/modules/distribution.js",
	"/cc/modules/hacknet.js",
	"/cc/modules/servers.js",
	"/cc/modules/status.js",
	"/cc/worker/worker.js",
	"/cc/commandCenter.js",
	"/cc/constants.js",
	"/cc/module.js",
	"/servers/buy.js",
	"/tools/backdoor.js",
	"/tools/find.js",
	"/tools/goto.js",
	"/util/lists.js",
	"/util/table.js",
];

export async function main(ns: NS) {
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