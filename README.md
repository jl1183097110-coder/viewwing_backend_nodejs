# Viewwing Backend

## 项目简介
Viewwing 后端是前端应用的业务与数据服务层，负责身份认证、地点内容管理、帖子发布、收藏关系、评论能力以及媒体存储相关接口。

项目当前基于 `Node.js + TypeScript + Express + Drizzle ORM` 构建，适合本地开发、测试、构建和部署到独立服务环境。

## 用途
这个后端主要服务于 Viewwing 的内容型旅行产品场景：

- 提供用户注册、登录、鉴权与会话相关能力
- 提供 Location、Spot、Post 等核心内容接口
- 支撑收藏、评论、个人资料和个人发布记录
- 负责数据库访问、数据校验和媒体上传链路

它的定位不是纯 CMS，也不是通用管理后台，而是为“地点发现 + 用户叙事 + 媒体内容”提供 API 支撑。

## 设计理念
后端设计方向偏向“清晰、可扩展、面向业务模块”：

- 以 REST 风格 API 为主，方便前端直接消费
- 使用 TypeScript 和 Zod 提升类型安全与输入校验能力
- 使用 Drizzle ORM 管理数据库 schema 和查询逻辑
- 保持前后端职责清晰：前端负责体验，后端负责规则、数据和安全边界
- 兼顾本地开发与生产部署需求，支持环境变量与构建产物启动

## 技术栈
- Node.js
- TypeScript
- Express 5
- Drizzle ORM
- PostgreSQL
- Zod
- JSON Web Token
- bcryptjs
- Pino / pino-http
- AWS S3 SDK
- Vitest

## 主要能力
- 用户注册、登录、获取当前用户信息
- 地点、Spot、帖子等内容的增删改查
- 评论与收藏功能
- 数据库检查与种子数据脚本
- 日志记录与基础限流能力
- 面向对象存储的媒体处理支持

## 本地使用方式
### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置环境变量
在后端目录根部创建 `.env`，可参考：

```bash
cp .env.example .env
```

请根据本地数据库、JWT 和对象存储配置填写实际值。

### 3. 启动开发服务
```bash
pnpm dev
```

这个命令会使用 `tsx watch` 运行服务，适合本地开发。

### 4. 类型检查
```bash
pnpm typecheck
```

### 5. 运行测试
```bash
pnpm test
```

监听模式：

```bash
pnpm test:watch
```

### 6. 构建生产产物
```bash
pnpm build
```

### 7. 启动构建后的服务
```bash
pnpm start
```

## 数据与脚本
常用脚本如下：

```bash
pnpm db:check
pnpm db:seed
pnpm db:seed:prod
```

如果你在维护数据库结构或初始化测试数据，这几个脚本会比较常用。

## 目录说明
```text
backend/
├─ src/                 应用源码、路由、服务、脚本
├─ drizzle/             数据库迁移与元数据
├─ tests/               单元测试与接口测试
├─ dist/                构建产物
├─ .env.example         后端环境变量模板
├─ docker-compose.yml   本地容器协作配置
├─ Dockerfile           镜像构建配置
└─ package.json         脚本与依赖定义
```

## 部署与维护建议
- 部署前先执行 `pnpm typecheck`、`pnpm test`、`pnpm build`
- 所有敏感配置通过环境变量注入，不要写死在代码里
- 数据库结构变更时同步维护 Drizzle 相关文件
- 如果前端新增模块，优先同步补齐对应接口文档和类型约定

## 与前端的关系
这个后端默认作为 Viewwing 前端的 API 服务使用。

典型联动方式如下：

- 前端通过 `VITE_API_BASE_URL` 指向该服务
- 前端负责页面交互和视觉表达
- 后端负责鉴权、数据存储、业务规则和媒体访问能力

两者组合后，形成一个完整的旅行发现与内容发布应用。
