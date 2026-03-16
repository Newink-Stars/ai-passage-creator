# AI 爆款文章创作器

> 基于多智能体协作的 AI 文章生成平台，输入一个选题，自动完成标题创作、大纲规划、正文撰写、智能配图，一键生成图文并茂的爆款文章。

---

## ✨ 功能特性

- **5 智能体串行编排** — 标题 → 大纲 → 正文 → 配图分析 → 图文合成，全流程自动化
- **SSE 实时推流** — 前端实时展示各阶段进度与流式文字生成过程
- **智能配图** — 通过 Pexels API 检索高质量图片，自动嵌入文章对应章节
- **Markdown 渲染** — 文章以 Markdown 格式输出，支持富文本预览
- **用户系统** — 注册/登录/退出，基于 Redis Session 保持登录态
- **权限控制** — AOP 注解（`@AuthCheck`）实现接口级别的角色鉴权

---

## 🛠 技术栈

| 层次 | 技术 |
|------|------|
| 后端语言 | Java 21 |
| 后端框架 | Spring Boot 3.5 |
| AI 框架 | Spring AI Alibaba（通义千问 / DashScope）|
| ORM | MyBatis-Flex |
| 数据库 | MySQL 8 |
| 缓存 / Session | Redis + Spring Session |
| 图片来源 | Pexels API（降级 Picsum）|
| 前端框架 | Vue 3.5 + TypeScript + Vite 7 |
| UI 组件库 | Ant Design Vue 4 |
| 状态管理 | Pinia |
| HTTP 客户端 | Axios |
| 容器化 | Docker（多阶段构建）|

---

## 📦 前置要求

- **JDK** 21+
- **Maven** 3.9+
- **Node.js** 20.19+ 或 22.12+
- **MySQL** 8.0+
- **Redis** 6.0+
- **通义千问 API Key**（[获取地址](https://dashscope.aliyun.com/)）
- **Pexels API Key**（[获取地址](https://www.pexels.com/api/)，可选，不填则使用 Picsum 占位图）

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/ai-passage-creator.git
cd ai-passage-creator
```

### 2. 初始化数据库

登录 MySQL，创建数据库并导入初始化脚本：

```sql
CREATE DATABASE ai_passage_creator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> 数据库表结构会在首次启动时通过 MyBatis-Flex 自动映射，也可根据实体类手动建表。

### 3. 配置后端环境变量

在 `src/main/resources/` 目录下创建 `application-local.yml`（本地开发配置，已在 `.gitignore` 中）：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ai_passage_creator?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: your_mysql_username
    password: your_mysql_password
  data:
    redis:
      host: localhost
      port: 6379
      database: 0
      # password: your_redis_password  # 如果 Redis 设置了密码则取消注释

  ai:
    alibaba:
      dashscope:
        api-key: sk-your-dashscope-api-key   # 通义千问 API Key

pexels:
  api-key: your-pexels-api-key               # Pexels 图片 API Key（可选）
```

### 4. 启动后端

```bash
# 使用 Maven Wrapper（推荐）
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# 或者先打包再运行
./mvnw clean package -DskipTests
java -jar target/ai-passage-creator-*.jar --spring.profiles.active=local
```

启动成功后，后端服务运行在：`http://localhost:8567`

API 接口文档（Knife4j）：`http://localhost:8567/api/doc.html`

### 5. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务运行在：`http://localhost:5173`

---

## 🐳 Docker 部署

### 构建镜像

```bash
docker build -t ai-passage-creator:latest .
```

### 运行容器

```bash
docker run -d \
  --name ai-passage-creator \
  -p 8123:8123 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://host.docker.internal:3306/ai_passage_creator" \
  -e SPRING_DATASOURCE_USERNAME="root" \
  -e SPRING_DATASOURCE_PASSWORD="your_password" \
  -e SPRING_DATA_REDIS_HOST="host.docker.internal" \
  -e SPRING_AI_ALIBABA_DASHSCOPE_API_KEY="sk-your-key" \
  -e PEXELS_API_KEY="your-pexels-key" \
  ai-passage-creator:latest
```

> 使用 `host.docker.internal` 连接宿主机的 MySQL 和 Redis（Mac/Windows Docker Desktop 支持）。Linux 环境请使用 `--network=host` 或 Docker 网络。

健康检查接口：`GET http://localhost:8123/api/health/`

---

## 📖 使用示例

### 创作一篇文章

1. 打开浏览器访问 `http://localhost:5173`
2. 注册账号并登录
3. 点击导航栏「**开始创作**」
4. 在输入框中填写文章选题，例如：

   ```
   2025年程序员必须掌握的10个AI工具
   ```

5. 选择文章风格（正式 / 轻松 / 专业等）
6. 点击「**生成文章**」按钮

系统将依次展示 5 个智能体的执行进度：

```
✅ Agent 1 — 生成标题（主标题 + 副标题）
✅ Agent 2 — 规划文章大纲（3~5个章节）
✅ Agent 3 — 撰写正文（流式输出，实时可见）
✅ Agent 4 — 分析配图需求
✅ Agent 5 — 检索并嵌入配图
✅ 图文合成完成，文章已保存
```

### 查看历史文章

点击导航栏「**我的文章**」，查看所有已生成的文章列表，点击任意文章卡片进入详情页。

---

## 📡 主要 API 接口

> 完整文档请访问 `http://localhost:8567/api/doc.html`

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/article/create` | 创建文章生成任务，返回 `taskId` |
| `GET` | `/api/article/progress/{taskId}` | 订阅 SSE 推流，实时获取生成进度 |
| `GET` | `/api/article/get/{taskId}` | 获取文章详情 |
| `POST` | `/api/article/list` | 分页查询文章列表 |
| `POST` | `/api/article/delete` | 删除文章 |
| `POST` | `/api/user/register` | 用户注册 |
| `POST` | `/api/user/login` | 用户登录 |
| `POST` | `/api/user/logout` | 用户退出 |
| `GET` | `/api/user/get/login` | 获取当前登录用户信息 |
| `GET` | `/api/health/` | 服务健康检查 |

### 请求示例：创建文章

```bash
curl -X POST http://localhost:8567/api/article/create \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "2025年程序员必须掌握的10个AI工具",
    "style": "专业"
  }'
```

响应：

```json
{
  "code": 0,
  "data": "task-uuid-xxxxxxxx",
  "message": "ok"
}
```

### 订阅进度推流（SSE）

```javascript
const taskId = 'task-uuid-xxxxxxxx';
const eventSource = new EventSource(`/api/article/progress/${taskId}`);

eventSource.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log(`[${msg.type}]`, msg.content);
};

eventSource.addEventListener('ALL_COMPLETE', () => {
  eventSource.close();
  console.log('文章生成完成！');
});
```

---

## 🗂 项目结构

```
ai-passage-creator/
├── src/main/java/com/newink/aipassagecreator/
│   ├── controller/          # API 控制器（Article / User / Health）
│   ├── service/             # 业务逻辑
│   │   ├── ArticleAgentService    # 5智能体编排核心
│   │   ├── ArticleAsyncService    # 异步任务 + SSE 分发
│   │   ├── PexelsService          # Pexels 图片检索
│   │   └── ...
│   ├── manager/
│   │   └── SseEmitterManager      # SSE 连接生命周期管理
│   ├── aop/
│   │   └── AuthInterceptor        # 基于注解的权限 AOP
│   ├── config/              # 跨域 / 异步线程池 / COS / Pexels 配置
│   ├── model/               # 实体 / DTO / 枚举
│   └── constant/            # Prompt 模板 / 业务常量
├── frontend/
│   ├── src/
│   │   ├── views/           # 页面组件（首页/创作/列表/详情/用户/管理）
│   │   ├── components/      # 公共组件（Header / Footer）
│   │   ├── api/             # 自动生成的 API 调用层
│   │   ├── router/          # 前端路由
│   │   ├── stores/          # Pinia 状态
│   │   └── utils/           # Markdown 渲染 / SSE 工具
│   └── package.json
├── Dockerfile               # 多阶段 Docker 构建
└── pom.xml
```

---

## ⚙️ 常见问题

**Q：SSE 连接断开或长时间无响应？**  
A：SSE 连接超时默认为 30 分钟，请检查网络连接和服务器状态。如使用反向代理（Nginx），请确保设置了 `proxy_read_timeout` 和 `proxy_buffering off`。

**Q：文章生成失败，提示 API 调用错误？**  
A：请确认 `application-local.yml` 中的 `dashscope.api-key` 填写正确，且账号有足够的 Token 余额。

**Q：图片无法显示？**  
A：检查 `pexels.api-key` 是否填写。如果未填写，系统会自动降级使用 Picsum 随机图片。

**Q：Docker 容器无法连接数据库？**  
A：确保数据库允许远程连接，且防火墙开放了 3306 端口。可在 MySQL 中执行：  
```sql
GRANT ALL PRIVILEGES ON ai_passage_creator.* TO 'root'@'%' IDENTIFIED BY 'your_password';
FLUSH PRIVILEGES;
```

---

## 📄 许可证

[MIT License](./LICENSE)
