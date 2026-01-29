Docker deployment for cat-bff-server
===================================

This document explains how to build the Docker image, push it to a registry, and run it on a server. It also includes examples for `systemd` and `docker-compose`.

Prerequisites
-------------
- Docker installed on the server.
- (Optional) Access to a container registry (Docker Hub, GHCR, private registry).
- Application port: 3000 (change if your app uses a different port).

Build image locally
-------------------
1. From the project root (where `Dockerfile` is):

   ```bash
   docker build -t cat-bff-server:latest .
   ```

2. Build with a registry tag (replace `myrepo` and `1.0.0`):

   ```bash
   docker build -t myrepo/cat-bff-server:1.0.0 .
   ```

Push image to a registry
------------------------
1. Tag (if not already tagged):

   ```bash
   docker tag cat-bff-server:latest myrepo/cat-bff-server:latest
   ```

2. Login and push:

   ```bash
   docker login myregistry.example.com
   docker push myrepo/cat-bff-server:1.0.0
   ```

Run container (simple)
----------------------
Run the image detached, mapping port 3000 and providing an env file:

```bash
docker run -d \
  --name cat-bff \
  -p 3000:3000 \
  --env-file /path/to/.env \
  --restart unless-stopped \
  myrepo/cat-bff-server:latest
```

Notes:
- Use `--env-file` or `-e KEY=VALUE` to provide environment variables (e.g., database URL, API keys).
- `--restart unless-stopped` ensures the container restarts after host reboot.

Update / deploy new version (zero-downtime is not covered here)
-------------------------------------------------------------
1. Pull new image (on server):

   ```bash
   docker pull myrepo/cat-bff-server:1.0.0
   ```

2. Stop and remove old container, then run the new one:

   ```bash
   docker stop cat-bff
   docker rm cat-bff
   docker run -d --name cat-bff -p 3000:3000 --env-file /path/to/.env --restart unless-stopped myrepo/cat-bff-server:1.0.0
   ```

Systemd unit example
--------------------
Create `/etc/systemd/system/cat-bff.service`:

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

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cat-bff
```

Docker Compose example
----------------------
Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  cat-bff:
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

Commands:
- Start: `docker-compose up -d`
- Update: `docker-compose pull && docker-compose up -d`
- Logs: `docker-compose logs -f`

Healthcheck
-----------
If your app exposes a health endpoint (recommended), the container will be considered healthy when that endpoint returns success. Example health URL: `GET /health`.

Common operations
-----------------
- View logs: `docker logs -f cat-bff`
- Exec into running container: `docker exec -it cat-bff /bin/sh`
- Remove dangling images: `docker image prune`
- Show running containers: `docker ps`

Troubleshooting
---------------
- Container exits immediately: check `docker logs cat-bff` for errors (missing env vars, port conflict).
- Permission errors when binding port < 1024: use a higher port or run with appropriate privileges.
- If build fails locally, ensure you have network access to fetch npm packages.

Security & best practices
-------------------------
- Do not bake secrets into images; use `--env-file` or a secret management solution.
- Consider using a smaller runtime base image (e.g., distroless) for production if you need reduced attack surface.
- Run containers behind a reverse proxy (NGINX) for TLS termination and additional routing.

If you want, I can also:
- Add a `docker-compose.prod.yml` and `.env.example`.
- Provide a `systemd` unit that uses `docker run --rm` or a short healthcheck-based restart policy.


