# Viewwing Database Design

数据库: `PostgreSQL 14+`  
ORM: `Drizzle ORM`  
编码要求: 所有 schema、migration、文档统一使用 `UTF-8`

## 核心枚举

```sql
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE content_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE post_type AS ENUM ('photo', 'video', 'article');
CREATE TYPE media_type AS ENUM ('photo', 'video');
```

## 表结构

### users

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | SERIAL | PK | 用户 ID |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | 用户名 |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱 |
| `passwordHash` | VARCHAR(255) | NOT NULL | 密码哈希 |
| `role` | `user_role` | NOT NULL, DEFAULT `user` | 角色 |
| `avatar_url` | VARCHAR(500) | NULL | 头像 |
| `bio` | VARCHAR(500) | NULL | 简介 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

### region

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | SERIAL | PK | 地区 ID |
| `nameLocal` | VARCHAR(100) | NOT NULL | 本地名 |
| `nameEn` | VARCHAR(100) | NULL | 英文名 |
| `path` | VARCHAR(500) | NOT NULL | 物化路径 |
| `level` | INTEGER | NOT NULL | 层级 |
| `parent_id` | INTEGER | FK -> `region.id` | 父节点 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |

业务约束：

- 同一父级下的 `nameLocal` 不允许重复
- 顶层地区（`parent_id` 为 `NULL`）之间的 `nameLocal` 不允许重复

### location

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | SERIAL | PK | 地点 ID |
| `name` | VARCHAR(255) | NOT NULL | 名称 |
| `nameEn` | VARCHAR(255) | NULL | 英文名 |
| `region_id` | INTEGER | FK -> `region.id`, NOT NULL | 所属地区 |
| `category` | VARCHAR(50) | NOT NULL | 分类 |
| `coverUrl` | VARCHAR(500) | NOT NULL | 封面图 |
| `description` | TEXT | NULL | 描述 |
| `key_points` | TEXT[] | NULL | 要点 |
| `center_lat` | DOUBLE PRECISION | NOT NULL | 中心点纬度 |
| `center_lng` | DOUBLE PRECISION | NOT NULL | 中心点经度 |
| `content_status` | `content_status` | NOT NULL | 审核状态 |
| `replaces_id` | INTEGER | FK -> `location.id` | 被替换版本 |
| `rejection_reason` | TEXT | NULL | 拒绝原因 |
| `submitted_by` | INTEGER | FK -> `users.id`, NOT NULL | 提交人 |
| `reviewed_by` | INTEGER | FK -> `users.id` | 审核人 |
| `reviewed_at` | TIMESTAMP | NULL | 审核时间 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

业务约束：

- 列表、搜索、附近地点、地点详情接口仅返回 `content_status = approved` 的地点
- 地点详情中关联的 `spots`、`posts` 仅返回 `content_status = approved` 的数据
- 更新/删除地点仅允许 `submitted_by` 对应的发布者本人或管理员执行

### spots

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | SERIAL | PK | 景点 ID |
| `name` | VARCHAR(255) | NOT NULL | 名称 |
| `location_id` | INTEGER | FK -> `location.id`, NOT NULL | 所属地点 |
| `description` | TEXT | NULL | 描述 |
| `image_url` | VARCHAR(500) | NULL | 景点单图链接 |
| `point_lat` | DOUBLE PRECISION | NOT NULL | 纬度 |
| `point_lng` | DOUBLE PRECISION | NOT NULL | 经度 |
| `content_status` | `content_status` | NOT NULL | 审核状态 |
| `rejection_reason` | TEXT | NULL | 拒绝原因 |
| `submitted_by` | INTEGER | FK -> `users.id`, NOT NULL | 提交人 |
| `reviewed_by` | INTEGER | FK -> `users.id` | 审核人 |
| `reviewed_at` | TIMESTAMP | NULL | 审核时间 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

### posts

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | SERIAL | PK | 内容 ID |
| `title` | VARCHAR(255) | NOT NULL | 标题 |
| `content` | TEXT | NOT NULL | 正文 |
| `location_id` | INTEGER | FK -> `location.id`, NOT NULL | 所属地点 |
| `spot_id` | INTEGER | FK -> `spots.id`, NULL | 所属景点（可选） |
| `post_type` | `post_type` | NOT NULL | 内容类型 |
| `content_status` | `content_status` | NOT NULL | 审核状态 |
| `rejection_reason` | TEXT | NULL | 拒绝原因 |
| `submitted_by` | INTEGER | FK -> `users.id`, NOT NULL | 提交人 |
| `like_count` | INTEGER | DEFAULT `0` | 点赞数 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

### media

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | SERIAL | PK | 媒体 ID |
| `post_id` | INTEGER | FK -> `posts.id` ON DELETE CASCADE, NULL | 所属内容（可选） |
| `spot_id` | INTEGER | FK -> `spots.id` ON DELETE CASCADE, NULL | 所属景点（可选） |
| `location_id` | INTEGER | FK -> `location.id` ON DELETE CASCADE, NULL | 所属地点（可选） |
| `object_key` | VARCHAR(500) | NOT NULL | 对象存储 key |
| `media_type` | `media_type` | NOT NULL | 媒体类型 |
| `url` | VARCHAR(500) | NOT NULL | 文件地址 |
| `thumbnail_url` | VARCHAR(500) | NULL | 缩略图地址 |
| `file_size` | BIGINT | NULL | 文件大小 |
| `display_order` | INTEGER | DEFAULT `0` | 展示顺序 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |

约束:

- `CHECK (media_single_owner_check)`: 恰好一个 FK 非空
  ```sql
  (CASE WHEN post_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN spot_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN location_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  ```
- `INDEX media_post_display_order_idx (post_id, display_order) WHERE post_id IS NOT NULL`
- `INDEX media_spot_display_order_idx (spot_id, display_order) WHERE spot_id IS NOT NULL`
- `INDEX media_location_display_order_idx (location_id, display_order) WHERE location_id IS NOT NULL`

业务约束：

- 采用多列可空 FK + CHECK 约束实现多态媒体关联（post / spot / location）
- `POST /media/presign` 与 `POST /posts/:post_id/media` 都依赖 `R2_PUBLIC_BASE_URL`，该配置为必填
- 关联媒体时，只有目标实体的 `submitted_by` 对应的作者本人或管理员可以写入 `media`
- `url` 必须与 `object_key` 基于 `R2_PUBLIC_BASE_URL` 拼接后的公开地址一致
- `file_size` 在接口层为必填，落库到 `media.file_size`
- 删除 media 关联记录不会同步删除对象存储文件
- 删除目标实体时，关联的 media 记录级联删除

### comments

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | SERIAL | PK | 评论 ID |
| `post_id` | INTEGER | FK -> `posts.id`, NOT NULL | 所属内容 |
| `content` | TEXT | NOT NULL | 评论内容 |
| `user_id` | INTEGER | FK -> `users.id`, NOT NULL | 评论作者 |
| `content_status` | `content_status` | NOT NULL | 审核状态 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

说明:

- 评论现在直接挂在 `post` 下
- 删除 `post` 时，其 `comments` 级联删除
- 旧的 `comments.location_id` 已废弃

### favorites

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | SERIAL | PK | 收藏 ID |
| `user_id` | INTEGER | FK -> `users.id` ON DELETE CASCADE, NOT NULL | 用户 ID |
| `spot_id` | INTEGER | FK -> `spots.id` ON DELETE CASCADE, NULL | 景点 ID（可选） |
| `post_id` | INTEGER | FK -> `posts.id` ON DELETE CASCADE, NULL | 内容 ID（可选） |
| `location_id` | INTEGER | FK -> `location.id` ON DELETE CASCADE, NULL | 地点 ID（可选） |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |

约束:

- `CHECK (favorites_single_target_check)`: 恰好一个 FK 非空
  ```sql
  (CASE WHEN post_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN spot_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN location_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  ```
- `UNIQUE INDEX favorites_user_spot_unique_idx (user_id, spot_id) WHERE spot_id IS NOT NULL`
- `UNIQUE INDEX favorites_user_post_unique_idx (user_id, post_id) WHERE post_id IS NOT NULL`
- `UNIQUE INDEX favorites_user_location_unique_idx (user_id, location_id) WHERE location_id IS NOT NULL`

说明:

- 采用多列可空 FK + CHECK 约束实现多态收藏（spot / post / location）
- 收藏列表接口仅返回当前用户已收藏且目标实体 `content_status = approved` 的记录
- 删除目标实体时，关联的收藏记录级联删除

## 关系图

```text
users
  ├─> locations (submitted_by)
  ├─> spots (submitted_by)
  ├─> posts (submitted_by)
  ├─> comments (user_id)
  └─> favorites (user_id)

region
  └─> location (region_id)

location
  ├─> spots (location_id)
  ├─> posts (location_id)
  ├─> location (replaces_id)
  ├─> favorites (location_id)
  └─> media (location_id)

spots
  ├─> posts (spot_id)
  ├─> favorites (spot_id)
  └─> media (spot_id)

posts
  ├─> media (post_id)
  ├─> comments (post_id)
  └─> favorites (post_id)
```

## 本次迁移说明

- 新增 migration: [0002_polymorphic_favorites_media.sql](/d:/projects/viewwing-new/backend/drizzle/0002_polymorphic_favorites_media.sql)
- `favorites` 表：`spot_id` 改为可空，新增 `post_id`、`location_id` 可空列，加 CHECK 约束确保恰好一列非空
- `media` 表：`post_id` 改为可空，新增 `spot_id`、`location_id` 可空列，加 CHECK 约束确保恰好一列非空
- 现有数据满足 CHECK 约束（`favorites` 行 `spot_id` 非空，`media` 行 `post_id` 非空）
- 采用多列可空 FK + CHECK 约束方案，保留数据库级外键约束和级联删除能力
