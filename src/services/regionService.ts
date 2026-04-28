import { regionTable } from "../db/schema.js";
import { createRegionSchema } from "../utils/zodschemas.js";
import { db } from "../drizzle.js";
import { z } from "zod";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { AppError } from "../utils/error.js";

// 这个文件实现「地区模块」的 service：
// - 创建地区（并维护 path 字段，用于面包屑/路径查询）
// - 获取子地区列表（顶层 or 指定 parent_id）
// - 获取某个地区的完整路径（祖先链）
//
// 约定：
// - service 只处理业务与数据库读写；入参由 controller 用 zod 校验
// - 出错时抛 AppError，由 errorHandler 统一转成标准错误响应

// -----------------------------
// 2.4 创建地区：插入记录后再回填 path
// -----------------------------
export const createRegionService = async (
  region: z.infer<typeof createRegionSchema>,
) => {
  // 1) 从请求体中取出字段（命名与 db schema 不一致时做映射）
  const data = {
    name: region.name,
    name_en: region.name_en,
    level: region.level,
    parent_id: region.parent_id,
  };

  // 2) 先准备插入值：path 暂时写成 "/"，因为还没拿到自增 id
  //    插入成功后再把 path 更新成：
  //    - 顶层："/{id}/"
  //    - 子级："{parent.path}{id}/"
  const values: {
    nameLocal: string;
    nameEn?: string;
    level: number;
    parentId?: number;
    path: string;
  } = {
    nameLocal: data.name,
    level: data.level,
    path: "/",
  };

  // 3) 可选字段做条件赋值，避免插入 undefined
  if (data.name_en !== undefined) values.nameEn = data.name_en;
  if (data.parent_id !== undefined) values.parentId = data.parent_id;

  // 4) 如果有 parentId，需要先确认父级存在，并拿到父级 path
  let parentPath: string | null = null;
  if (values.parentId !== undefined) {
    const parentRows = await db
      .select({ path: regionTable.path })
      .from(regionTable)
      .where(eq(regionTable.id, values.parentId))
      .limit(1);
    const parent = parentRows[0];
    if (!parent) {
      throw new AppError(404, "NOT_FOUND", "Parent region not found");
    }
    parentPath = parent.path;
  }

  // 5) 同一父节点下不允许创建同名地区（顶层节点按 parentId 为 null 判重）
  const duplicateRows = await db
    .select({ id: regionTable.id })
    .from(regionTable)
    .where(
      values.parentId !== undefined
        ? and(
            eq(regionTable.nameLocal, values.nameLocal),
            eq(regionTable.parentId, values.parentId),
          )
        : and(eq(regionTable.nameLocal, values.nameLocal), isNull(regionTable.parentId)),
    )
    .limit(1);

  if (duplicateRows.length > 0) {
    throw new AppError(409, "ALREADY_EXISTS", "Region already exists under the same parent");
  }

  // 6) 插入地区记录，拿到新生成的 id
  const [regionInfo] = await db.insert(regionTable).values(values).returning({
    id: regionTable.id,
    nameLocal: regionTable.nameLocal,
    nameEn: regionTable.nameEn,
    level: regionTable.level,
    parentId: regionTable.parentId,
  });

  if (!regionInfo) {
    throw new AppError(500, "DATABASE_ERROR", "Region creation failed");
  }

  // 7) 计算并回填 path（用于后续快速查询整条路径）
  const thisPath = parentPath
    ? `${parentPath}${regionInfo.id}/`
    : `/${regionInfo.id}/`;
  const [updatedRegion] = await db
    .update(regionTable)
    .set({ path: thisPath })
    .where(eq(regionTable.id, regionInfo.id))
    .returning({
      id: regionTable.id,
      nameLocal: regionTable.nameLocal,
      nameEn: regionTable.nameEn,
      level: regionTable.level,
      parentId: regionTable.parentId,
      path: regionTable.path,
    });
  if (!updatedRegion) {
    throw new AppError(
      500,
      "DATABASE_ERROR",
      "Failed to create region path, please examine the database",
    );
  }

  return updatedRegion;
};

// -----------------------------
// 2.1 获取地区列表 / 2.2 获取子地区：
// - 传 parentId：返回该 parentId 的直接子节点
// - 不传 parentId：返回顶层节点（parentId 为 null）
// -----------------------------
export const getSubRegionService = async (options: { parentId?: number; all?: boolean }) => {
  const { parentId, all } = options;
  const baseQuery = db.select({
    id: regionTable.id,
    nameLocal: regionTable.nameLocal,
    nameEn: regionTable.nameEn,
    level: regionTable.level,
    parentId: regionTable.parentId,
    path: regionTable.path,
  }).from(regionTable);

  if (all) {
    return await baseQuery.limit(10000);
  } else if (parentId !== undefined) {
    return await baseQuery.where(eq(regionTable.parentId, parentId)).limit(10000);
  } else {
    return await baseQuery.where(isNull(regionTable.parentId)).limit(100);
  }
};

// -----------------------------
// 2.3 获取地区路径（面包屑）：
// - 先读 region.path（例如 "/1/7/15/"）
// - 解析出 id 列表 [1,7,15]
// - 一次性查出这些 id 对应的节点并按顺序返回
// -----------------------------
export const getPathService = async (id: number) => {
  // 1) 先拿到目标地区的 path 字符串
  const pathRow = await db
    .select({ path: regionTable.path })
    .from(regionTable)
    .where(eq(regionTable.id, id))
    .limit(1);

  if (!pathRow[0]) {
    throw new AppError(404, "NOT_FOUND", "Region not found");
  }

  // 2) 把 path 解析成 ID 列表（顺序就是面包屑顺序）
  const ids = pathRow[0].path.split("/").filter(Boolean).map(Number);

  if (ids.length === 0) {
    return [];
  }

  // 3) 一次性查出所有节点，避免 N+1 查询
  const rows = await db
    .select({
      id: regionTable.id,
      nameLocal: regionTable.nameLocal,
      nameEn: regionTable.nameEn,
      level: regionTable.level,
    })
    .from(regionTable)
    .where(inArray(regionTable.id, ids));

  // 4) 按 path 顺序组装结果
  const byId = new Map(rows.map((r) => [r.id, r]));
  const result = ids.map((pathId) => byId.get(pathId));

  // 5) 如果 path 中某个 id 在表里查不到，说明数据不一致，直接报错
  if (result.some((r) => r === undefined)) {
    throw new AppError(404, "NOT_FOUND", "Some regions not found");
  }

  return result as Array<{
    id: number;
    nameLocal: string;
    nameEn: string | null;
    level: number;
  }>;
};
