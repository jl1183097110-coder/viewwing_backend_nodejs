import type { AddressInfo } from "node:net";
import { createApp } from "./app.js";
import { pool } from "./drizzle.js";
import { logger } from "./middlewares/logger.js";

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

let isShuttingDown = false;

const server = app.listen(port, () => {
  const address = server.address() as AddressInfo | null;
  logger.info(
    { port: address?.port ?? port },
    "Server is running",
  );
});

async function shutdown(signal: string) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  logger.info({ signal }, "Shutdown signal received");

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    await pool.end();
    logger.info("HTTP server and database pool closed");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error, signal }, "Graceful shutdown failed");
    process.exit(1);
  }
}

server.on("error", (error) => {
  logger.error({ err: error, port }, "Server failed to start");
  process.exit(1);
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
  void shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  logger.error({ err: error }, "Uncaught exception");
  void shutdown("uncaughtException");
});


