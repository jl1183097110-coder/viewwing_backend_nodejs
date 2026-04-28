import express from "express";
import { notFoundHandler } from "./middlewares/errorhandler.js";
import { errorHandler } from "./middlewares/errorhandler.js";
import { corsMiddleware } from "./middlewares/cors.js";
import { sendSuccessResponse } from "./utils/response.js";
import { logMiddleWare } from "./middlewares/logger.js";
import router from "./routes/index.js";
import { limiter } from "./middlewares/limiter.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  app.use(logMiddleWare);
  app.use(corsMiddleware);
  app.use(limiter);
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    return sendSuccessResponse(res, 200, { ok: true }, "OK");
  });

  app.use(router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
