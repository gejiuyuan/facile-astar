import Koa from "koa";
import KoaRouter from "koa-router";
import KoaBodyParser from "koa-bodyparser";
import Static from "koa-static";
import path from "path";
import fs from "fs";
import open from "open";
import { Transform, TransformCallback } from "stream";

type RouterMiddleware = Parameters<KoaRouter["get"]>[1];

class SSETransform extends Transform {
	constructor() {
		super({
			writableObjectMode: true,
		});
	}

	_transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
		this.push(`data: ${JSON.stringify(chunk)}\n\n`);
		callback();
	}
}

class SSE {
	static clients = new Set<SSE>();

	stream = new SSETransform();

	readonly responseHeaders = {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
		"Access-Control-Allow-Origin": "*",
	};

	constructor() {
		SSE.clients.add(this);
		this.stream.on("close", () => {
			SSE.clients.delete(this);
			console.log("sse stream closed!");
		});
	}

	update() {
		console.log("sse update...");
		this.stream.write({ timestamp: new Date().getTime() });
	}

	static async route(ctx: Parameters<RouterMiddleware>[0], next: Parameters<RouterMiddleware>[1]) {
		console.log("sse response...");
		const sse = new SSE();
		ctx.set(sse.responseHeaders);
		ctx.status = 200;
		ctx.body = sse.stream;
		await next();
	}
}

class LocalServer {
	port = 1008;

	app = new Koa();

	router = new KoaRouter();

	constructor() {
		this.app.on("error", () => {
			process.disconnect();
			process.exit();
		});
		this.app.use(KoaBodyParser());
		this.app.use(Static(path.join(process.cwd(), ".")));
		this.useRoutes();
	}

	private useRoutes() {
		this.router.get("/update", SSE.route);
		this.app.use(this.router.routes());
		this.app.use(this.router.allowedMethods());
	}

	#originServer: ReturnType<typeof this.app.listen> = null!;

	get url() {
		return [`http://localhost:${this.port}`].join(":");
	}

	start() {
		console.log("server start");
		this.#originServer = this.app.listen(this.port, () => {
			console.log("server started");
			open(this.url);
		});
		return this;
	}

	update() {
		SSE.clients.forEach((sse) => sse.update());
	}

	close() {
		this.app.removeAllListeners();

		this.#originServer.close((err) => {
			if (err) {
				process.disconnect();
				process.exit();
			}
		});
	}
}

try {
	console.log("will start local server");
	const localServer = new LocalServer().start();
	process.on("message", (data) => {
		switch (data) {
			case "update": {
				localServer.update();
				break;
			}
			case "close": {
				localServer.close();
				break;
			}
		}
	});
} catch (err) {
	console.log("child server process error: ", err);
}
