# viewwing - API 接口文档

版本

: v1.0\

Base URL

: `http://localhost:3000/api`\

认证方式

: JWT Bearer Token

---

## 目录

1. [认证模块](#1-认证模块)
2. [地区模块](#2-地区模块)
3. [地点模块](#3-地点模块)
4. [景点模块](#4-景点模块)
5. [内容模块](#5-内容模块)
6. [媒体上传模块](#6-媒体上传模块)
7. [评论模块](#7-评论模块)
8. [收藏模块](#8-收藏模块)
9. [个人主页模块](#9-个人主页模块)
10. [管理员审核模块](#10-管理员审核模块)

---

## 通用说明

### 统一响应格式

#### 成功响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

#### 失败响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "status": 400,
    "message": "错误描述",
    "details": []
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

### 错误码列表

| 错误码              | HTTP 状态码 | 说明                            |
| ------------------- | ----------- | ------------------------------- |
| AUTH_REQUIRED       | 401         | 未登录或 token 缺失             |
| INVALID_TOKEN       | 401         | Token 无效或已过期              |
| INVALID_CREDENTIALS | 401         | 用户名或密码错误                |
| FORBIDDEN           | 403         | 无权限访问                      |
| NOT_FOUND           | 404         | 资源不存在                      |
| ALREADY_EXISTS      | 409         | 资源已存在（如用户名/邮箱重复） |
| VALIDATION_ERROR    | 400         | 参数验证失败                    |
| FILE_TOO_LARGE      | 413         | 文件过大                        |
| INVALID_FILE_TYPE   | 400         | 文件类型不支持                  |
| PENDING_APPROVAL    | 403         | 内容待审核中                    |
| ALREADY_SUBMITTED   | 409         | 已提交过修改请求                |
| INTERNAL_ERROR      | 500         | 服务器内部错误                  |
| DATABASE_ERROR      | 500         | 数据库错误                      |

### 分页参数

所有列表接口支持分页：

| 参数     | 类型   | 默认值 | 说明     |
| -------- | ------ | ------ | -------- |
| page     | number | 1      | 页码     |
| pageSize | number | 20     | 每页数量 |

分页响应格式：

```json
{
  "success": true,
  "message": "success",
  "data": [...],
  "meta": {
    "requestId": "uuid",
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### 认证头

需要认证的接口，请求头必须包含：

```
Authorization: Bearer <your-jwt-token>
```

---

## 1. 认证模块

### 1.1 用户注册

POST

`/auth/register`

创建新用户账号。

请求体

：

```json
{
  "name": "user123",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "user123",
    "email": "user@example.com",
    "role": "user",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Registration successful"
}
```

错误

：

- `ALREADY_EXISTS`: 用户名或邮箱已存在
- `VALIDATION_ERROR`: 参数格式错误

---

### 1.2 用户登录

POST

`/auth/login`

使用邮箱和密码登录。

请求体

：

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "user123",
      "email": "user@example.com",
      "role": "user",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  },
  "message": "Login successful"
}
```

错误

：

- `INVALID_CREDENTIALS`: 邮箱或密码错误
- `VALIDATION_ERROR`: 参数格式错误

---

### 1.3 获取当前用户信息

GET

`/auth/me`

获取当前登录用户的详细信息。

认证

：✅ 必需

响应

：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "user123",
    "email": "user@example.com",
    "role": "user",
    "avatar_url": "https://example.com/avatar.jpg",
    "bio": "热爱自然探索",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Profile information"
}
```

---

### 1.4 更新个人资料

PUT

`/auth/profile`

更新当前用户的个人信息。

认证

：✅ 必需

说明

：请求体至少传入一个可更新字段：`name`、`avatarUrl`、`bio`

请求体

：

```json
{
  "name"?: "newUsername",
  "avatarUrl"?: "https://example.com/new-avatar.jpg",
  "bio"?: "更新后的个人简介"
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "newUsername",
    "email": "user@example.com",
    "role": "user",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "bio": "更新后的个人简介",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Profile updated"
}
```

错误

：

- `ALREADY_EXISTS`: 用户名已被占用
- `VALIDATION_ERROR`: 参数格式错误，或未提供任何可更新字段

---

### 1.5 退出登录

POST

`/auth/logout`

当前实现为无状态登出：仅校验当前 Bearer Token 是否有效，并返回成功响应。

认证

：✅ 必需

响应

：

```json
{
  "success": true,
  "data": {},
  "message": "Logout successful"
}
```

---

## 2. 地区模块

### 2.1 获取地区列表

GET

`/regions?parent_id=1`（指定父级的直接子地区） `/regions?all=true`（全部地区） `/regions`（顶层地区）

获取顶层地区或指定父级的子地区。

查询参数

：

| 参数      | 类型    | 必需 | 说明                                      |
| --------- | ------- | ---- | ----------------------------------------- |
| parent_id | number  | ❌   | 父级地区 ID，不传时返回顶层地区           |
| all       | boolean | ❌   | 传 `true` 时返回全部地区，优先于 `parent_id` |

响应

：

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nameLocal": "东亚",
      "nameEn": "East Asia",
      "path": "/1/",
      "level": 1,
      "parentId": null
    },
    {
      "id": 2,
      "nameLocal": "东南亚",
      "nameEn": "Southeast Asia",
      "path": "/2/",
      "level": 1,
      "parentId": null
    }
  ],
  "message": "Sub-regions retrieved successfully"
}
```

---

### 2.2 获取地区路径（面包屑）

GET

`/regions/:id/path`

获取地区的完整层级路径，用于面包屑导航。

路径参数

：

- `id`: 地区 ID

响应

：（按从根到当前的顺序返回）

```json
{
  "success": true,
  "data": [
    { "id": 1, "nameLocal": "东亚", "nameEn": "East Asia", "level": 1 },
    { "id": 3, "nameLocal": "日本", "nameEn": "Japan", "level": 2 },
    { "id": 7, "nameLocal": "静冈县", "nameEn": null, "level": 3 }
  ],
  "message": "Region path retrieved successfully"
}
```

---

### 2.3 创建地区

POST

`/regions`

创建新的地区节点（用于后台管理）。

认证

：✅ 必需（管理员）

请求体

：

```json
{
  "name": "日本",
  "name_en": "Japan",
  "level": 2,
  "parent_id": 1
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 3,
    "nameLocal": "日本",
    "nameEn": "Japan",
    "path": "/1/3/",
    "level": 2,
    "parentId": 1
  },
  "message": "Region created successfully"
}
```

错误

：

- `VALIDATION_ERROR`: 参数格式错误
- `ALREADY_EXISTS`: 同一父级下已存在同名地区
- `NOT_FOUND`: 指定的父地区不存在
- `FORBIDDEN`: 无权限

---

## 3. 地点模块

### 3.1 获取地点列表

GET

`/locations`

获取已发布的地点列表，支持筛选和排序。

查询参数

：

| 参数      | 类型   | 必需 | 说明                                                  |
| --------- | ------ | ---- | ----------------------------------------------------- |
| region_id | number | ❌   | 地区 ID                                               |
| category  | string | ❌   | 自然分类（mountain/lake/sea/forest/...）              |
| sort      | string | ❌   | 排序方式（`newest` 按 `created_at`，`popular` 按 `updated_at`） |
| page      | number | ❌   | 页码，默认 1                                          |
| pageSize  | number | ❌   | 每页数量，默认 20                                     |

响应

：

```json
{
  "success": true,
  "data": {
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    },
    "data": [
      {
        "id": 1,
        "name": "富士山",
        "region_id": 7,
        "category": "mountain",
        "description": "日本最高峰...",
        "cover_url": "https://example.com/fuji.jpg",
        "center_point": {
          "lat": 35.3606,
          "lng": 138.7274
        },
        "submitted_by": {
          "id": 1,
          "username": "user123"
        },
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "message": "get all locations successfully"
}
```

---

### 3.2 搜索地点

GET

`/locations/search`

根据关键词搜索地点。

查询参数

：

| 参数      | 类型   | 必需 | 说明       |
| --------- | ------ | ---- | ---------- |
| q         | string | ✅   | 搜索关键词 |
| region_id | number | ❌   | 限定地区   |
| category  | string | ❌   | 限定分类   |
| page      | number | ❌   | 页码       |
| pageSize  | number | ❌   | 每页数量   |

响应

：同 3.1（包含 `cover_url` 字段），顶层 `message` 为 `search locations successfully`

---

### 3.3 获取附近地点

GET

`/locations/nearby`

根据坐标查询附近的已发布地点。

查询参数

：

| 参数   | 类型   | 必需 | 说明                    |
| ------ | ------ | ---- | ----------------------- |
| lat    | number | ✅   | 纬度                    |
| lng    | number | ✅   | 经度                    |
| radius | number | ❌   | 半径（公里），默认 10km |

响应

：

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "富士山",
      "distance_km": 5.2,
      "center_point": {
        "lat": 35.3606,
        "lng": 138.7274
      },
      "category": "mountain"
    }
  ],
  "message": "get near locations successfully"
}
```

---

### 3.4 获取地点详情

GET

`/locations/:id`

获取已发布地点的详细信息，包括该地点下已发布的景点和内容。

路径参数

：

- `id`: 地点 ID

响应

：

```json
{
  "success": true,
  "data": {
    "location": {
      "id": 1,
      "name": "富士山",
      "region_id": 7,
      "cover_url": "https://example.com/fuji.jpg",
      "category": "mountain",
      "description": "日本最高峰，海拔3776米...",
      "key_points": ["最佳观赏期：4-10月", "需要登山许可", "建议2天行程"],
      "center_point": {
        "lat": 35.3606,
        "lng": 138.7274
      },
      "submitted_by": {
        "id": 1,
        "username": "user123",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "created_at": "2024-01-15T10:30:00Z"
    },
    "spots": [
      {
        "id": 1,
        "name": "五合目",
        "description": "半山腰观景点",
        "image_url": "https://example.com/spot-fifth-station.jpg",
        "point": {
          "lat": 35.353,
          "lng": 138.7309
        }
      }
    ],
    "posts": [
      {
        "id": 1,
        "title": "富士山日出攻略",
        "post_type": "article",
        "submitted_by": {
          "id": 2,
          "username": "traveler"
        },
        "created_at": "2024-01-20T08:00:00Z"
      }
    ]
  },
  "message": "get location detail successfully"
}
```

错误

：

- `NOT_FOUND`: 地点不存在或未发布

---

### 3.5 创建地点

POST

`/locations`

提交新地点。当前实现会直接创建为 `approved` 状态。

认证

：✅ 必需

请求体

：

```json
{
  "name": "阿尔卑斯",
  "region_id": 15,
  "category": "mountain",
  "description": "著名山岳风景区...",
  "key_points": ["最佳季节：春秋两季", "建议游玩30天"],
  "cover_url": "https://example.com/cover.jpg",
  "center_point": {
    "lat": 39.4838,
    "lng": 15.1567
  }
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 10,
    "status": "approved",
    "message": "upload success"
  },
  "message": "create location successfully"
}
```

错误

：

- `AUTH_REQUIRED`: 未登录
- `VALIDATION_ERROR`: 参数验证失败
- `NOT_FOUND`: region_id 不存在

---

### 3.6 编辑地点

PUT

`/locations/:id`

直接更新已发布地点（MVP 阶段不走审核流，不创建新版本）。

认证

：✅ 必需（提交者本人或管理员）

路径参数

：

- `id`: 地点 ID

请求体

：支持部分更新，至少传入一个字段。可更新字段如下：

```json
{
  "name": "阿尔卑斯",
  "region_id": 15,
  "category": "mountain",
  "description": "著名山岳风景区...",
  "cover_url": "https://example.com/cover.jpg",
  "key_points": ["最佳季节：春秋两季", "建议游玩30天"],
  "center_point": {
    "lat": 39.4838,
    "lng": 15.1567
  }
}
```

其中：

- `description` 可显式传 `null`
- `key_points` 可显式传 `null`

响应

：

```json
{
  "success": true,
  "data": {
    "id": 10,
    "status": "approved",
    "replaces_id": null,
    "message": "update success"
  },
  "message": "update location successfully"
}
```

说明

：

- 该接口为直接更新，不会新增地点记录
- `replaces_id` 保持默认值（通常为 `null`）

错误

：

- `AUTH_REQUIRED`: 未登录
- `FORBIDDEN`: 非提交者且非管理员，无权限编辑
- `VALIDATION_ERROR`: 参数验证失败，或未提供任何可更新字段
- `NOT_FOUND`: 原地点不存在
- `NOT_FOUND`: region_id 不存在

---

### 3.7 获取地点下的景点

GET

`/locations/:id/spots`

获取地点关联的所有已发布景点。

路径参数

：

- `id`: 地点 ID

响应

：

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "五合目",
      "description": "半山腰观景点",
      "image_url": "https://example.com/spot-fifth-station.jpg",
      "point": {
        "lat": 35.353,
        "lng": 138.7309
      },
      "submitted_by": {
        "id": 1,
        "username": "user123"
      }
    }
  ],
  "message": "get location spots successfully"
}
```

错误

：

- `NOT_FOUND`: 地点不存在

---

### 3.8 获取地点下的内容

GET

`/locations/:id/posts`

获取地点关联的已发布内容（图文/视频/攻略）。

路径参数

：

- `id`: 地点 ID

查询参数

：

| 参数      | 类型   | 必需 | 说明                            |
| --------- | ------ | ---- | ------------------------------- |
| spot_id   | number | ❌   | 筛选特定景点                    |
| post_type | string | ❌   | 内容类型（photo/video/article） |
| page      | number | ❌   | 页码                            |
| pageSize  | number | ❌   | 每页数量                        |

响应

：

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "title": "富士山日出",
        "content": "凌晨4点从五合目出发...",
        "post_type": "photo",
        "media": [
          {
            "media_type": "photo",
            "url": "https://example.com/photo1.jpg",
            "thumbnail_url": "https://example.com/photo1_thumb.jpg"
          }
        ],
        "submitted_by": {
          "id": 2,
          "username": "photographer"
        },
        "like_count": 45,
        "created_at": "2024-01-20T08:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  },
  "message": "get location posts successfully"
}
```

错误

：

- `NOT_FOUND`: 地点不存在

### 3.9 删除地点

DELETE

`/locations/:id`

删除指定地点（硬删除）。

认证

：✅ 必需（提交者本人或管理员）

路径参数

：

- `id`: 地点 ID

响应

：

```json
{
  "success": true,
  "data": {
    "deleted_id": 10,
    "message": "Location deleted successfully"
  },
  "message": "delete location successfully"
}
```

错误

：

- `AUTH_REQUIRED`: 未登录
- `FORBIDDEN`: 非提交者且非管理员，无权限删除
- `NOT_FOUND`: 地点不存在
- `DATABASE_ERROR`: 删除失败

级联说明

：

- 删除 `location` 后，将按外键配置级联删除其关联的 `spots`、`posts`、`media`、`comments`、`favorites`

## 4. 景点模块

### 4.1 创建景点

POST

`/spots`

在地点下创建新景点（POI）。

认证

：✅ 必需

请求体

：

```json
{
  "name": "五合目观景台",
  "location_id": 1,
  "description": "最佳拍照点",
  "image_url": "https://example.com/fifth-station.jpg",
  "point": {
    "lat": 35.353,
    "lng": 138.7309
  }
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 5,
    "status": "approved",
    "message": "posted"
  },
  "message": "create spot successfully"
}
```

---

### 4.2 编辑景点

PUT

`/spots/:id`

编辑景点（作者本人或管理员可编辑）。

认证

：✅ 必需

路径参数

：

- `id`: 景点 ID

请求体

：

```json
{
  "name": "五合目观景台",
  "description": "最佳拍照点",
  "image_url": "https://example.com/fifth-station.jpg",
  "point": {
    "lat": 35.353,
    "lng": 138.7309
  }
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 5,
    "status": "approved",
    "message": "posted"
  },
  "message": "update spot successfully"
}
```

---

### 4.3 获取景点详情

GET

`/spots/:spot_id`

获取景点详细信息（仅返回已审核通过的景点）。

路径参数

：

- `spot_id`: 景点 ID

响应

：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "五合目",
    "location_id": 1,
    "description": "半山腰观景点，可远眺山顶",
    "image_url": "https://example.com/fifth-station.jpg",
    "point": {
      "lat": 35.353,
      "lng": 138.7309
    },
    "submitted_by": {
      "id": 1,
      "username": "user123",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "created_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-20T14:30:00Z"
  },
  "message": "get spot successfully"
}
```

---

### 4.4 删除景点

DELETE

`/spots/:spot_id`

删除指定景点（作者本人或管理员可删除）。

认证

：✅ 必需

路径参数

：

- `spot_id`: 景点 ID

响应

：

```json
{
  "success": true,
  "data": {
    "deleted_id": 5,
    "message": "Spot deleted successfully"
  },
  "message": "delete spot successfully"
}
```

错误

：

- `AUTH_REQUIRED`: 未登录
- `FORBIDDEN`: 非作者且非管理员
- `NOT_FOUND`: 景点不存在
- `DATABASE_ERROR`: 删除失败

## 5. 内容模块

### 5.1 获取内容列表

GET

`/posts`

获取已发布的内容列表（用于首页"最近更新"）。

查询参数

：

| 参数        | 类型   | 必需 | 说明     |
| ----------- | ------ | ---- | -------- |
| location_id | number | ❌   | 筛选地点 |
| spot_id     | number | ❌   | 筛选景点 |
| post_type   | string | ❌   | 内容类型 |
| page        | number | ❌   | 页码     |
| pageSize    | number | ❌   | 每页数量 |

响应

：

```json
{
  "success": true,
  "data": {
    "data": [
    {
      "id": 1,
      "title": "富士山日出实拍",
      "content": "拍摄技巧分享...",
      "post_type": "photo",
      "location": {
        "id": 1,
        "name": "富士山"
      },
      "spot": {
        "id": 1,
        "name": "五合目"
      },
      "media": [
        {
          "media_type": "photo",
          "url": "https://example.com/photo1.jpg",
          "thumbnail_url": "https://example.com/photo1_thumb.jpg"
        }
      ],
      "submitted_by": {
        "id": 2,
        "username": "photographer",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "like_count": 120,
      "created_at": "2024-01-20T08:00:00Z",
      "updated_at": "2024-01-21T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "Posts list retrieved successfully"
}
```

---

### 5.2 获取内容详情

GET

`/posts/:post_id`

获取内容的完整信息。

路径参数

：

- `post_id`: 内容 ID

响应

：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "富士山攀登完全攻略",
    "content": "# 准备工作\n\n## 装备清单\n...",
    "post_type": "article",
    "location_id": 1,
    "spot_id": 1,
    "location_name": "富士山",
    "spot_name": "五合目",
    "media": [
      {
        "id": 1,
        "media_type": "photo",
        "url": "https://example.com/photo1.jpg",
        "thumbnail_url": "https://example.com/photo1_thumb.jpg",
        "display_order": 0
      }
    ],
    "submitted_by": {
      "id": 2,
      "username": "guide_master",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "like_count": 256,
    "created_at": "2024-01-20T08:00:00Z",
    "updated_at": "2024-01-21T10:00:00Z"
  },
  "message": "Post retrieved successfully"
}
```

---

### 5.3 创建内容

POST

`/posts`

发布新内容（图文/视频/攻略）。

认证

：✅ 必需

请求体

：

```json
{
  "title": "富士山日出",
  "content": "凌晨4点从五合目出发...",
  "location_id": 1,
  "spot_id": 1,
  "post_type": "photo"
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 15,
    "status": "approved"
  },
  "message": "Post created successfully"
}
```

---

### 5.4 编辑内容

PUT

`/posts/:post_id`

编辑已发布的内容。

认证

：✅ 必需

路径参数

：

- `post_id`: 内容 ID

请求体

：同 5.3

响应

：

```json
{
  "success": true,
  "data": {
    "id": 16,
    "status": "approved",
    "message": "Post updated successfully"
  },
  "message": "Post updated successfully"
}
```

---

### 5.5 删除内容

DELETE

`/posts/:post_id`

删除自己发布的内容（仅作者或管理员）。

认证

：✅ 必需

路径参数

：

- `post_id`: 内容 ID

响应

：

```json
{
  "success": true,
  "data": {
    "message": "deleted successfully"
  },
  "message": "post deleted successfully"
}
```

错误

：

- `FORBIDDEN`: 无权删除（不是作者且非管理员）
- `NOT_FOUND`: Post not found

---

## 6. 媒体上传模块

本模块采用“前端直传 R2，后端签名 + 落库”的方案。

配置要求：

- `R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET` 必填
- `R2_PUBLIC_BASE_URL` 必填，用于生成 `public_url` 并校验回写的 `url`

### 6.1 获取上传凭证（R2 预签名）

POST

`/media/presign`

用于在上传前向后端申请一次性上传凭证（预签名 URL）。

认证

：✅ 必需

请求体

：

```json
{
  "file_name": "sunrise.jpg",
  "content_type": "image/jpeg",
  "file_size": 2458624,
  "media_type": "photo"
}
```

参数说明

：

| 参数         | 类型   | 必需 | 说明               |
| ------------ | ------ | ---- | ------------------ |
| file_name    | string | ✅   | 原始文件名         |
| content_type | string | ✅   | MIME 类型          |
| file_size    | number | ✅   | 文件大小（字节）   |
| media_type   | string | ✅   | `photo` 或 `video` |

响应

：

```json
{
  "success": true,
  "data": {
    "upload_url": "https://<account>.r2.cloudflarestorage.com/<bucket>/media/1/2026/03/uuid-sunrise.jpg?...",
    "method": "PUT",
    "headers": {
      "Content-Type": "image/jpeg"
    },
    "object_key": "media/1/2026/03/uuid-sunrise.jpg",
    "public_url": "https://cdn.example.com/media/1/2026/03/uuid-sunrise.jpg",
    "expires_in": 900
  }
}
```

**object_key 格式说明**：

- 格式：`media/{user_id}/{year}/{month}/{uuid}-{sanitized_filename}`
- 示例：`media/1/2026/03/abc123-sunrise.jpg`
- 说明：后端自动生成，包含用户 ID、年月分层和 UUID，确保唯一性和安全性

错误

：

- `VALIDATION_ERROR`：参数格式错误
- `FILE_TOO_LARGE`：文件超过限制
- `INVALID_FILE_TYPE`：不支持的文件类型
- `AUTH_REQUIRED`：未登录

---

### 6.2 关联媒体到内容

POST

`/posts/:post_id/media`

前端完成 R2 上传后，将媒体 URL 回写到业务表并关联到内容。

认证

：✅ 必需

说明

：只有内容作者本人或管理员才能关联媒体

路径参数

：

- `post_id`：内容 ID

请求体

：

```json
{
  "media_type": "photo",
  "url": "https://cdn.example.com/media/1/2026/03/abc123-sunrise.jpg",
  "object_key": "media/1/2026/03/abc123-sunrise.jpg",
  "thumbnail_url": "https://cdn.example.com/media/1/2026/03/abc123-sunrise_thumb.jpg",
  "display_order": 0,
  "file_size": 2458624
}
```

请求体约束：

- `url` 必须是合法 URL
- `thumbnail_url` 如果传入，必须是合法 URL
- `file_size` 必填，单位为字节

响应

：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "post_id": 15,
    "media_type": "photo",
    "url": "https://cdn.example.com/media/1/2026/03/abc123-sunrise.jpg",
    "display_order": 0
  }
}
```

**安全验证**：

- `post_id` 必须是合法正整数
- 只有当前 `post_id` 对应内容的作者本人或管理员可以添加媒体
- `object_key` 必须以 `media/{当前用户ID}/` 开头，防止越权上传
- `url` 必须与 `object_key` 一致（基于 `R2_PUBLIC_BASE_URL` 拼接）

---

### 6.3 删除媒体关联

DELETE

`/posts/:post_id/media/:media_id`

删除媒体关联记录（是否同步删除 R2 对象可按业务策略决定）。

当前实现说明：

- 仅删除数据库中的媒体关联记录
- 不会同步删除对象存储中的原始文件

认证

：✅ 必需

路径参数

：

- `post_id`：内容 ID
- `media_id`：媒体 ID

响应

：

```json
{
  "success": true,
  "data": {
    "message": "delete success"
  },
  "message": "媒体删除成功"
}
```

错误

：

- `NOT_FOUND`：媒体或内容不存在
- `FORBIDDEN`：无权限删除

---

## 7. 评论模块

### 7.1 获取内容下的评论

GET

`/posts/:post_id/comments`

获取某篇内容下的评论列表。

路径参数

：

- `post_id`: 内容 ID

查询参数

：

| 参数     | 类型   | 必需 | 说明              |
| -------- | ------ | ---- | ----------------- |
| page     | number | ❌   | 页码，默认 1      |
| pageSize | number | ❌   | 每页数量，默认 20 |

响应

：

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 20,
        "content": "景色非常美，值得一去！",
        "user": {
          "id": 3,
          "username": "reader",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "created_at": "2024-01-25T08:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pageSize": 20,
      "totalPages": 1
    }
  },
  "message": "Post comments retrieved successfully"
}
```

说明

：

- 评论现在直接挂在 `post` 下
- `GET /locations/:id/comments` 已下线，不再使用

---

### 7.2 发表评论

POST

`/comments`

在内容下发表评论。

认证

：✅ 必需

请求体

：

```json
{
  "post_id": 15,
  "content": "景色非常美，值得一去！"
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 20,
    "status": "approved"
  },
  "message": "Comment created successfully"
}
```

---

### 7.3 编辑评论

PUT

`/comments/:comment_id`

编辑自己的评论。评论作者本人或管理员可操作。

认证

：✅ 必需

路径参数

：

- `comment_id`: 评论 ID

请求体

：

```json
{
  "content": "更新后的评论内容"
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 20,
    "status": "approved"
  },
  "message": "Comment updated successfully"
}
```

---

### 7.4 删除评论

DELETE

`/comments/:comment_id`

删除自己的评论。评论作者本人或管理员可操作。

认证

：✅ 必需

路径参数

：

- `comment_id`: 评论 ID

响应

：

```json
{
  "success": true,
  "data": null,
  "message": "Comment deleted successfully"
}
```

---

## 8. 收藏模块

### 8.1 获取收藏列表

GET

`/favourites`

获取当前用户的收藏景点列表。

认证

：✅ 必需

响应

：

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "spot": {
        "id": 1,
        "name": "河口湖",
        "description": "一个美丽的湖",
        "center_point": {
          "lat": 35.3606,
          "lng": 138.7274
        }
      },
      "created_at": "2024-01-18T14:00:00Z"
    }
  ],
  "message": "Favourites retrieved successfully"
}
```

说明

：

- 仅返回当前用户收藏且 `content_status = approved` 的景点

---

### 8.2 收藏景点

POST

`/favourites`

收藏一个景点。

认证

：✅ 必需

请求体

：

```json
{
  "spot_id": 1
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 5,
    "spot_id": 1,
    "created_at": "2024-01-25T10:00:00Z"
  },
  "message": "Favourite added successfully"
}
```

错误

：

- `ALREADY_EXISTS`: 已收藏过该景点
- `NOT_FOUND`: 景点不存在

---

### 8.3 取消收藏

DELETE

`/favourites`

取消收藏某个景点。

认证

：✅ 必需

请求体

：

```json
{
  "spot_id": 1
}
```

响应

：

```json
{
  "success": true,
  "data": null,
  "message": "Favourite removed successfully"
}
```

---

## 9. 个人主页模块

### 9.1 我的发布

GET

`/profile/submissions`

获取当前用户的所有提交内容。

说明

：

- 不传 `type` 时，返回 `locations`、`spots`、`posts`、`comments` 四组数据
- 传入 `type` 时，只返回对应类型的分组字段

认证

：✅ 必需

查询参数

：

| 参数   | 类型   | 必需 | 说明                               |
| ------ | ------ | ---- | ---------------------------------- |
| type   | string | ❌   | 类型（location/spot/post/comment） |
| status | string | ❌   | 状态（pending/rejected/approved）  |

响应

：

```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "id": 10,
        "name": " 富士山",
        "description": "日本最高峰，春秋最适合徒步和拍摄。",
        "cover_image": "https://example.com/location-cover.jpg",
        "status": "pending",
        "created_at": "2024-01-24T09:00:00Z"
      }
    ],
    "spots": [
      {
        "id": 5,
        "name": "五合目观景台",
        "description": "富士山经典观景点，可远眺山顶与云海。",
        "cover_image": "https://example.com/spot-cover.jpg",
        "status": "pending",
        "location": { 
          "id": 1, 
          "name": "富士山" 
        },
        "created_at": "2024-01-20T11:00:00Z"
      }
    ],
    "posts": [
      {
        "id": 15,
        "title": "富士山攀登攻略",
        "description": "从五合目凌晨出发，沿吉田线登顶并拍摄日出。",
        "cover_image": "https://example.com/post-cover.jpg",
        "status": "pending",
        "post_type": "article",
        "created_at": "2024-01-22T14:00:00Z"
      }
    ],
    "comments": [
      {
        "id": 20,
        "content": "景色非常美",
        "status": "pending",
        "post": { "id": 15, "title": "富士山攀登攻略" },
        "created_at": "2024-01-25T08:00:00Z"
      }
    ]
  },
  "message": "My submissions retrieved successfully"
}
```

---

### 9.2 我的收藏

复用 8.1 接口，不单独提供 `/profile/favorites`。

直接调用：

GET

`/favourites`

获取当前用户的收藏列表。

认证

：✅ 必需

---

## 10. 管理员审核模块 //后续再完善，MVP先不做，要先在post/location/spot表里面加字段

所有接口需要管理员权限

### 10.1 获取待审核列表

GET

`/admin/pending`

获取待审核内容列表。

认证

：✅ 管理员

查询参数

：

| 参数     | 类型   | 必需 | 说明                               |
| -------- | ------ | ---- | ---------------------------------- |
| type     | string | ❌   | 类型（location/spot/post/comment） |
| page     | number | ❌   | 页码                               |
| pageSize | number | ❌   | 每页数量                           |

响应

：

```json
{
  "success": true,
  "data": [
    {
      "type": "location",
      "id": 10,
      "name": "富士山",
      "status": "pending",
      "submitted_by": {
        "id": 3,
        "username": "contributor"
      },
      "replaces_id": null,
      "created_at": "2024-01-24T09:00:00Z"
    },
    {
      "type": "post",
      "id": 16,
      "title": "富士山日出修改版",
      "status": "pending",
      "submitted_by": {
        "id": 2,
        "username": "photographer"
      },
      "replaces_id": 15,
      "created_at": "2024-01-25T10:00:00Z"
    }
  ],
  "pagination": { ... },
  "pending_count": {
    "location": 5,
    "spot": 2,
    "post": 8,
    "comment": 12
  }
}
```

---

### 10.2 获取审核详情

GET

`/admin/review/:type/:id`

获取某条待审内容的详细信息（可编辑）。

认证

：✅ 管理员

路径参数

：

- `type`: 类型（location/spot/post/comment）
- `id`: 内容 ID

响应

：

```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "富士山",
    "region_id": 15,
    "category": "mountain",
    "description": "名山岳...",
    "center_point": {
      "lat": 30.1333,
      "lng": 118.1667
    },
    "status": "pending",
    "replaces_id": null,
    "submitted_by": {
      "id": 3,
      "username": "contributor",
      "email": "contributor@example.com"
    },
    "created_at": "2024-01-24T09:00:00Z",
    "old_version": null // 如果是编辑，这里会显示旧版本数据
  }
}
```

---

### 10.3 审核并编辑

PUT

`/admin/review/:type/:id`

审核内容，管理员可润色后通过或拒绝。

认证

：✅ 管理员

路径参数

：

- `type`: 类型（location/spot/post/comment）
- `id`: 内容 ID

请求体

：

```json
{
  // 可编辑的字段（根据 type 不同）
  "name": "富士山",
  "description": "管理员润色后的描述...",

  // 审核动作
  "action": "approve", // 或 "reject"
  "rejection_reason": null // action 为 reject 时必填
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "id": 10,
    "status": "approved",
    "reviewed_by": 1,
    "reviewed_at": "2024-01-25T11:00:00Z"
  },
  "message": "审核通过"
}
```

说明

：

- 审核通过时，如果有 `replaces_id`，旧版本如何保留或下线由业务层决定
- 管理员的编辑会直接应用，不需要再次审核

---

### 10.4 批量通过

POST

`/admin/approve`

批量审核通过多条内容。

认证

：✅ 管理员

请求体

：

```json
{
  "type": "post",
  "ids": [15, 16, 17]
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "approved_count": 3,
    "failed": []
  },
  "message": "批量审核完成"
}
```

---

### 10.5 批量拒绝

POST

`/admin/reject`

批量拒绝多条内容。

认证

：✅ 管理员

请求体

：

```json
{
  "type": "comment",
  "ids": [20, 21, 22],
  "rejection_reason": "内容不符合社区规范"
}
```

响应

：

```json
{
  "success": true,
  "data": {
    "rejected_count": 3,
    "failed": []
  },
  "message": "批量拒绝完成"
}
```

---

## 附录

### A. 地点分类（category）

```
mountain  - 山
lake      - 湖
sea       - 海/海滩
river     - 河流/瀑布
forest    - 森林
grassland - 草原
desert    - 沙漠
glacier   - 冰川
volcano   - 火山
canyon    - 峡谷
island    - 岛屿
wetland   - 湿地
cave      - 洞穴
other     - 其他
```

### B. 排序方式（sort）

```
newest   - 最新发布
popular  - 最受欢迎（按 like_count）
```

<!-- ### C. 常见使用流程

#### 用户发布图文内容流程

1. 登录获取 token
2. 上传图片 `POST /media/presign`
3. 创建 post `POST /posts`
4. 关联媒体 `POST /posts/:post_id/media`
5. 等待管理员审核

#### 管理员审核流程

1. 查看待审队列 `GET /admin/pending`
2. 查看详情 `GET /admin/review/:type/:id`
3. 编辑并审核 `PUT /admin/review/:type/:id` (action: approve/reject)

#### 用户编辑已发布内容流程

1. 编辑地点 `PUT /locations/:id`
2. 系统创建新的 pending 版本，replaces\_id 指向旧版本
3. 公共接口继续显示旧版本
4. 管理员审核通过后，新版本发布，旧版本归档 -->

---

文档版本

: v1.0\

更新日期

: 2024-01-25
