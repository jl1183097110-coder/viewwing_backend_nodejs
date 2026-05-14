import type { RequestHandler } from "express";

// 从环境变量读取允许跨域的前端地址。
// `CORS_ORIGIN` 支持逗号分隔，例如：
// http://localhost:5173,http://127.0.0.1:5173,https://your-site.com
function parseAllowedOrigins(raw?: string): string[] {
  // 本地开发默认放行 Vite 常用地址，避免未配置时前端直接被浏览器拦截。
  if (!raw) {
    return ["http://localhost:5173", "http://127.0.0.1:5174"];
  }

  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGIN);

export const corsMiddleware: RequestHandler = (req, res, next) => {
  const origin: string | undefined = req.headers.origin;

  // 只有请求来源命中白名单时，才回写对应的 CORS 头。
  // 这里不能在允许携带 cookie/authorization 时使用 `*`。
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    // 告诉缓存层：不同 Origin 的响应不能混用。
    res.header("Vary", "Origin");
    // 允许浏览器携带 cookie / authorization 等凭证。
    res.header("Access-Control-Allow-Credentials", "true");
  }

  // 声明浏览器跨域预检时允许的 HTTP 方法。
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );

  // 声明前端实际请求时允许携带的请求头。
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );

  // 预检请求只需要返回响应头，不进入后续业务逻辑。
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
};
