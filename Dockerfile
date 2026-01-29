FROM node:20-alpine AS builder

WORKDIR /app

# 安装构建所需的依赖（使用 npm ci 保证可重复性）
# 在服务器构建时会联网下载依赖，请确保服务器能访问 npm registry
COPY package*.json ./
RUN npm ci

# 复制源码并执行构建（假设 package.json 中定义了 build 脚本）
COPY . .
RUN npm run build

# 精简为仅包含生产依赖，减小最终镜像体积
RUN npm prune --production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 只拷贝运行时需要的文件：package.json、node_modules 与构建产物 dist
# 这样可以避免把源码/构建工具带入运行镜像
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# 暴露应用端口（如应用监听其他端口请修改）
EXPOSE 3000

# 启动命令：以编译后的产物运行应用
CMD ["node", "dist/main"]


