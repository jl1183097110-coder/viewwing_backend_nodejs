import { usersTable } from "../db/schema.js";
import { db } from "../drizzle.js";
import { eq } from "drizzle-orm";
import { AppError } from "../utils/error.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logger } from "../middlewares/logger.js";
import { isPgUniqueViolation } from "../utils/db.js";

// 这个文件实现「认证/用户」相关的 service：
// - 注册：校验唯一性、加密密码、写入用户表
// - 登录：校验密码、签发 JWT
// - 获取个人信息 / 更新个人资料
//
// 约定：
// - service 不直接读 req/res，由 controller 负责参数校验与取值
// - 出错时抛 AppError，由统一错误处理中间件转成标准错误响应

// 从环境变量读取 JWT_SECRET，缺失则视为服务端配置错误
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "INTERNAL_ERROR", "JWT secret not configured");
  }
  return secret;
}

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

type UpdateProfileInput = {
  name?: string;
  avatarUrl?: string;
  bio?: string;
};

// -----------------------------
// 1.1 用户注册
// - 检查用户名/邮箱唯一
// - bcrypt 加盐哈希密码
// - 写入 users 表
// -----------------------------
export async function registerService(input: RegisterInput) {
  const { email, password, name } = input;

  // 1) 校验用户名是否已存在
  const existingByName = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.name, name))
    .limit(1);

  if (existingByName.length > 0) {
    logger.warn({ action: "auth.register", name }, "username already exists");
    throw new AppError(409, "ALREADY_EXISTS", "Username already exists");
  }

  // 2) 校验邮箱是否已存在
  const existingByEmail = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existingByEmail.length > 0) {
    logger.warn({ action: "auth.register", email }, "email already exists");
    throw new AppError(409, "ALREADY_EXISTS", "Email already exists");
  }

  // 3) bcrypt 加盐并哈希密码（存储 hash，绝不存明文）
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // 4) 插入用户记录，并返回必要字段
  let user:
    | {
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: Date;
      }
    | undefined;
  try {
    [user] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        passwordHash: hash,
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        created_at: usersTable.createdAt,
      });
  } catch (error) {
    if (isPgUniqueViolation(error)) {
      logger.warn(
        { action: "auth.register", name, email, error },
        "registration conflict",
      );

      if (error.constraint === "users_name_unique") {
        throw new AppError(409, "ALREADY_EXISTS", "Username already exists");
      }

      if (error.constraint === "users_email_unique") {
        throw new AppError(409, "ALREADY_EXISTS", "Email already exists");
      }

      throw new AppError(
        409,
        "ALREADY_EXISTS",
        "Username or email already exists",
      );
    }

    throw error;
  }

  if (!user) {
    logger.error(
      { action: "auth.register", name, email },
      "registration insert failed",
    );
    throw new AppError(500, "DATABASE_ERROR", "Registration failed");
  }

  logger.info(
    { action: "auth.register", userId: user.id },
    "registration success",
  );
  return user;
}

// -----------------------------
// 1.2 用户登录
// - 查用户（通过 email）
// - bcrypt 校验密码
// - 签发 JWT（payload 只放 user id）
// -----------------------------
export async function loginService(input: LoginInput) {
  const { email, password } = input;
  const rows = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      avatar_url: usersTable.avatar_url,
      // 这里需要拿 passwordHash 用于 bcrypt.compare，返回给 controller 前会剥离
      passwordHash: usersTable.passwordHash,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  const info = rows[0];
  if (!info) {
    logger.warn(
      { action: "auth.login", email },
      "login failed: user not found",
    );
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  // bcrypt.compare 会把明文 password 与 hash 做安全对比
  const isMatch = await bcrypt.compare(password, info.passwordHash);
  if (!isMatch) {
    logger.warn(
      { action: "auth.login", userId: info.id },
      "login failed: password mismatch",
    );
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  // 不把 passwordHash 暴露给外部响应
  const { passwordHash, ...user } = info;

  // 签发 token，过期时间 1d（这里与 requireAuth 的解析逻辑保持一致：payload 里有 id）
  const token = jwt.sign(
    {
      id: user.id as number,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: "1d",
    },
  );
  logger.info({ action: "auth.login", userId: user.id }, "login success");
  return { token, user };
}

// -----------------------------
// 1.3 获取当前用户信息
// -----------------------------
export async function getUserProfileService(userId: number) {
  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      avatar_url: usersTable.avatar_url,
      bio: usersTable.bio,
      created_at: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  const user = rows[0];
  if (!user) {
    logger.warn({ action: "auth.profile.get", userId }, "user not found");
    throw new AppError(404, "NOT_FOUND", "User not found");
  }
  return user;
}

// -----------------------------
// 1.4 更新个人资料（部分字段可选）
// - 先确认用户存在
// - 动态构造 update payload，避免把 undefined 写入数据库
// -----------------------------
export async function updateUserProfileService(
  userId: number,
  input: UpdateProfileInput,
) {
  const { name, avatarUrl, bio } = input;

  // 1) Ensure the user exists
  const existingRows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      avatar_url: usersTable.avatar_url,
      bio: usersTable.bio,
      created_at: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (existingRows.length === 0) {
    logger.warn({ action: "auth.profile.update", userId }, "user not found");
    throw new AppError(404, "NOT_FOUND", "User not found");
  }

  const existingUser = existingRows[0];

  // 2) Build update payload dynamically
  const updatePayload: Record<string, unknown> = {};
  if (name !== undefined) updatePayload.name = name;
  if (avatarUrl !== undefined) updatePayload.avatar_url = avatarUrl;
  if (bio !== undefined) updatePayload.bio = bio;

  if (Object.keys(updatePayload).length === 0) {
    // Nothing to update
    logger.warn(
      { action: "auth.profile.update", userId },
      "profile update failed: empty payload",
    );
    throw new AppError(400, "VALIDATION_ERROR", "At least one field is required");
  }

  if (name !== undefined && name !== existingUser.name) {
    const duplicateRows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.name, name))
      .limit(1);

    if (duplicateRows.length > 0) {
      logger.warn(
        { action: "auth.profile.update", userId, name },
        "username already exists",
      );
      throw new AppError(409, "ALREADY_EXISTS", "Username already exists");
    }
  }

  // 3) Perform the update
  const [updatedUser] = await db
    .update(usersTable)
    .set(updatePayload)
    .where(eq(usersTable.id, userId))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      avatar_url: usersTable.avatar_url,
      bio: usersTable.bio,
      created_at: usersTable.createdAt,
    });

  logger.info(
    { action: "auth.profile.update", userId },
    "profile update success",
  );
  return updatedUser;
}
