import { spawn, type ChildProcess } from "node:child_process";
import { ACCEPTANCE_PORT, BASE_URL } from "./config";

let server: ChildProcess | undefined;

async function waitForServer(timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE_URL, { method: "GET" });
      if (response.ok) return;
    } catch {
      // server not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(
    `The server did not start on ${BASE_URL} within ${timeoutMs}ms. ` +
      `Make sure \`npm start\` boots the HTTP server and honours process.env.PORT.`,
  );
}

export async function setup(): Promise<void> {
  server = spawn("npm", ["start", "--silent"], {
    env: { ...process.env, PORT: String(ACCEPTANCE_PORT) },
    stdio: "ignore",
    detached: true,
  });

  server.on("error", (error) => {
    throw error;
  });

  await waitForServer();
}

export async function teardown(): Promise<void> {
  if (!server?.pid) return;

  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}
