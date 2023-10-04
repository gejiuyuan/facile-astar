import nodemon from "nodemon";
import path from "path";
import http from "http";
import { exec, spawn, fork, execSync } from "child_process";

const build = () => {
	return new Promise((resolve, reject) => {
		exec("npm run build", (err, stdout, stderr) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(void 0);
		});
	});
};

const option: nodemon.Settings = {
	delay: 100,
	colours: false,
	verbose: true,
	watch: ["index.html", "src", "scripts"].map((s) => path.join(process.cwd(), s)),
	execMap: {
		js: "npm -v",
	},
	// exec: "npm run build && npm run start",
	ext: "js,ts,json,mjs",
};

class ServerProcess {
	private self: ReturnType<typeof spawn> = null!;
	constructor() {}

	start() {
		// this.self = spawn("npm run start", {
		// 	// 仅在当前运行环境为 Windows 时，才使用 shell
		// 	shell: process.platform === "win32",
		// 	// 共享打包信息给父进程
		// 	stdio: [null, null, null, "ipc"],
		// });
		// this.self.stdout?.on("data", (chunk) => {
		// 	console.log(new TextDecoder().decode(chunk), "   chunk data");
		// });

		this.self = fork(path.join(process.cwd(), "scripts/server.ts"));

		this.self.on("message", (data) => {
			console.log("收到子进程的消息了： ", data);
		});
		this.self.on("exit", (msg) => {
			console.log("server did exit: ", msg);
		});
	}

	restart() {
		console.log("will restart: ", this.self);
		this.self.send?.("update");
	}

	close() {
		this.self.send?.("close");
	}
}

const serverProcess = new ServerProcess();
let didStart = false;
nodemon(option)
	.on("start", async () => {
		if (didStart) {
			return;
		}
		didStart = true;
		await build();
		serverProcess.start();
	})
	.on("quit", () => {
		console.log(`nodemon quit...`);
		serverProcess.close();
	})
	.on("restart", async () => {
		console.log(`restart......`);
		await build();
		serverProcess.restart();
	});

process.on("exit", () => {
	serverProcess.close();
});
