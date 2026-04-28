import fs from "node:fs";
import path from "node:path";
import pino from "pino";
import { pinoHttp } from "pino-http";
import { randomUUID } from "node:crypto";

const isProduction = process.env.NODE_ENV === "production";
const level = process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug");
const logToFile = process.env.LOG_TO_FILE !== "false";
const logToConsole = process.env.LOG_TO_CONSOLE !== "false";
const logDir = process.env.LOG_DIR ?? "logs";
const logFileName = process.env.LOG_FILE_NAME ?? "app.log";
const errorLogFileName = process.env.ERROR_LOG_FILE_NAME ?? "error.log";

//一个存日志输出目标的数组，放入不同的object，表示不同的输出位置（控制台和文件）
const streams: pino.StreamEntry[] = [];

if (logToConsole) {
  streams.push({ stream: process.stdout });
}

if (logToFile) {
  // 把当前工作目录（process.cwd()）和 logDir（如 logs）合成绝对路径。
  // // 例如当前在 d:/projects/viewwing-new/backend，结果会是 d:/projects/viewwing-new/backend/logs。
  const absoluteLogDir = path.resolve(process.cwd(), logDir);
  // 在日志目录后拼文件名，得到 app.log 的完整路径。

  const logFilePath = path.join(absoluteLogDir, logFileName);
  

  const errorLogFilePath = path.join(absoluteLogDir, errorLogFileName);
  fs.mkdirSync(absoluteLogDir, { recursive: true });//同步创建目录，后一个参数表示如果没有则创建父文件夹
  streams.push({
    stream: pino.destination({
      dest: logFilePath,
      mkdir: true,
      //异步写日志，更好的性能
      sync: false,
    }),
  });
  streams.push({
    level: "error",
    stream: pino.destination({
      dest: errorLogFilePath,
      mkdir: true,
      sync: false,
    }),
  });
}

export const logger = pino(
  {
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "password",
        "*.password",
        "token",
        "*.token",
        "accessToken",
        "*.accessToken",
        "refreshToken",
        "*.refreshToken",
      ],
      //上面的替换成这个
      censor: "[REDACTED]",
    },
  },
  //按照输出目标数组，输出所有日志，没有就输出到控制台
  
  pino.multistream(streams.length > 0 ? streams : [{ stream: process.stdout }]),
);

export const logMiddleWare =  pinoHttp({
      logger,
      genReqId: (req, res) => {
        const incoming = req.headers["x-request-id"];
        const requestId =
          (Array.isArray(incoming) ? incoming[0] : incoming) ?? randomUUID();
        res.setHeader("x-request-id", requestId);
        return requestId;
      },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      autoLogging: {
        ignore: (req) => req.url === "/api/health",
      },
    })
