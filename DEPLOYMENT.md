Docker 部署（服务器端直接构建）
================================

本文件说明如何在**服务器上直接构建并运行**本项目的 Docker 镜像，包含常用命令、systemd 与 Docker Compose 示例，以及运维与安全建议。文中所有命令示例均假定在项目根目录（包含 `Dockerfile`）执行，端口默认 `3000`，如有不同请对应修改。

先决条件
---------
- 目标服务器已安装 Docker（若使用 Compose，请一并安装 docker-compose 或使用 Docker Compose V2）。
- 服务器有足够磁盘空间和网络访问权限（用于拉基础镜像与 npm install）。
- （可选）如需将镜像推到镜像仓库，则需有仓库账号与权限。

在服务器上构建镜像（推荐临时或无 CI 场景）
-------------------------------------
步骤示例：

1. SSH 登录到服务器并拉取代码：

   ```bash
   ssh user@your-server
   git clone https://your.git.repo/repo.git
   cd repo
   ```

2. 在代码根目录构建镜像（替换 `myrepo`/`1.0.0` 为你的仓库与版本）：

   ```bash
   docker build -t myrepo/cat-bff-server:1.0.0 .
   ```

3. 构建完成后可直接运行：

   ```bash
   docker run -d \
     --name cat-bff \
     -p 3000:3000 \
     --env-file /path/to/.env \
     --restart unless-stopped \
     myrepo/cat-bff-server:1.0.0
   ```

说明：
- 使用 `--env-file` 或 `-e KEY=VALUE` 注入运行时的敏感配置（数据库 URL、API Key 等），避免把密钥写入镜像中。
- `--restart unless-stopped` 可在服务器重启或容器异常退出后自动重启，提高可用性。

（可选）将镜像推到镜像仓库
------------------------------
如果你希望在多台服务器上复用镜像或做版本管理，可将镜像推到 registry：

1. 打 tag（若未带仓库前缀）：

   ```bash
   docker tag myrepo/cat-bff-server:1.0.0 myregistry.example.com/myrepo/cat-bff-server:1.0.0
   ```

2. 登录并 push：

   ```bash
   docker login myregistry.example.com
   docker push myregistry.example.com/myrepo/cat-bff-server:1.0.0
   ```

3. 在目标服务器拉取并运行：

   ```bash
   docker pull myregistry.example.com/myrepo/cat-bff-server:1.0.0
   docker run -d --name cat-bff -p 3000:3000 --env-file /path/to/.env --restart unless-stopped myregistry.example.com/myrepo/cat-bff-server:1.0.0
   ```

更新部署（非零停机）
---------------------
简单的更新流程（非零停机）：

1. 拉取新镜像（如使用 registry）：

   ```bash
   docker pull myrepo/cat-bff-server:1.0.0
   ```

2. 停止并移除旧容器，运行新容器：

   ```bash
   docker stop cat-bff
   docker rm cat-bff
   docker run -d --name cat-bff -p 3000:3000 --env-file /path/to/.env --restart unless-stopped myrepo/cat-bff-server:1.0.0
   ```

如果需要零停机部署，请采用负载均衡、蓝绿/滚动更新或使用 Kubernetes 等编排工具。

systemd 服务示例
-----------------
如需将容器交由 systemd 管理（实现开机自启、统一管理），在服务器创建 `/etc/systemd/system/cat-bff.service`：

```ini
[Unit]
Description=cat-bff-server (Docker)
After=docker.service
Requires=docker.service

[Service]
Restart=always
ExecStartPre=-/usr/bin/docker rm -f cat-bff
ExecStart=/usr/bin/docker run --name cat-bff -p 3000:3000 --env-file /path/to/.env --restart unless-stopped myrepo/cat-bff-server:latest
ExecStop=/usr/bin/docker stop cat-bff
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

启用并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cat-bff
```

Docker Compose 示例（在服务器用 Compose 构建并运行）
-------------------------------------------------
在服务器放置 `docker-compose.yml` 并在项目目录运行 `docker-compose up -d --build`，示例：

```yaml
version: "3.8"
services:
  cat-bff:
    build: .
    image: myrepo/cat-bff-server:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-S", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

常用运维命令
------------
- 查看日志：`docker logs -f cat-bff`
- 进入容器：`docker exec -it cat-bff /bin/sh`
- 清理悬空镜像：`docker image prune`
- 查看运行中容器：`docker ps`

健康检查（推荐）
----------------
建议应用暴露一个健康检查接口（如 `GET /health`），Docker/Compose 可以基于该接口判断服务是否就绪或需重启。

故障排查要点
------------
- 容器立即退出：查看 `docker logs cat-bff`，常见原因为缺少必须的环境变量、端口冲突或启动脚本异常。
- 绑定 1024 以下端口失败：非 root 用户可能无法绑定，请使用高端口或授予权限。
- 构建失败：检查服务器网络能否访问 npm registry，或是否缺少构建所需依赖（比如有系统依赖需额外安装）。

最佳实践（安全与可维护性）
-------------------------
- 不要把密钥写入镜像；使用 `--env-file`、Docker secrets 或外部秘密管理（如 Vault）。
- 生产环境建议使用更小的运行时基础镜像或多阶段构建以减小攻击面。
- 在生产环境把容器放到反向代理（如 NGINX）或负载均衡器后面做 TLS 终端和路由控制。
- 长期部署建议使用 CI/CD 将构建与发布自动化，以实现可追溯的发布和便于回滚。

我可以为你做的额外事项：
- 生成 `docker-compose.prod.yml` 与 `.env.example`（适配服务器端构建）。
- 将 `systemd` 示例改为基于健康检查的重启策略或带 `--rm` 的短生命周期示例。














docker部署概要：


https://github.com/Brian0x07/cat-bff.git

docker ps -a
docker images -a



# build 镜像 通过工程生成镜像
docker build -t cat-bff .

# 容器跑起来
docker run -d -p 3000:3000 --name cat-bff cat-bff
# 删除容器
docker rm -f cat-bff


# 1. 强制删除所有容器（运行+停止，容器数据会丢失，谨慎操作）
docker rm -f $(docker ps -aq)

# 强制删除单个镜像
docker rmi -f 镜像仓库名:标签/镜像ID




# 改代码->>>>>>
👉 每次代码改了，都要重新 docker build，否则容器里还是旧代码。
docker build -t cat-bff .
👉 旧容器不会自动更新
docker rm -f cat-bff
docker run ...

