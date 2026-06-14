# Production Deployment Guide

This app supports two non-serverless production paths:

- **Option A:** EC2 + Docker Compose + RDS
- **Option B:** ECS on EC2 + ECR + ALB + RDS

Both options use:

- `Dockerfile.Prod` for the app image
- AWS RDS for PostgreSQL (database stays outside app container)
- `.env` values validated by `src/utils/env.ts`

Local development uses `docker-compose.dev.yml` (app + local Postgres).  
Production uses `docker-compose.prod.yml` (app only, external RDS).

---

## Shared Setup (Required for Both Options)

### 1. Create RDS PostgreSQL

1. AWS Console -> RDS -> Create database
2. Engine: PostgreSQL 17 (or compatible)
3. Template: Production (or Dev/Test for learning)
4. Set:
   - DB identifier: `express-auth-db`
   - Master username: `app_user`
   - Master password: strong password
   - Initial database name: `express_auth`
5. Connectivity:
   - VPC: same VPC as app hosts
   - Public access: **No** (recommended)
6. Create database and copy endpoint:
   - Example: `ccud33ui.cluster-czrs8234isg7.us-east-1.rds.amazonaws.com`

### 2. Create Security Groups

Create two security groups in the same VPC:

**A) App SG (`express-auth-app-sg`)**

- Inbound:
  - Port `8000` from ALB SG (Option B) or from your IP temporarily (Option A testing)
  - Port `22` from your IP (admin SSH for EC2 options)
- Outbound: allow all (or restrict to RDS + AWS APIs)

**B) RDS SG (`express-auth-rds-sg`)**

- Inbound:
  - Port `5432` from App SG only
- Outbound: default

Attach RDS SG to RDS instance.

### 3. Prepare Production Environment Values

Create `.env` on server/task (never commit real secrets):

```env
NODE_ENV=production
PORT=8000

API_BASE_URL=https://api.yourdomain.com
CLIENT_APP_URL=https://app.yourdomain.com
JWT_ISSUER=https://api.yourdomain.com
JWT_SECRET=replace_with_long_random_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d
FROM_EMAIL=no-reply@yourdomain.com

PG_HOST=ccud33ui.cluster-czrs8234isg7.us-east-1.rds.amazonaws.com
PG_PORT=5432
PG_USER=app_user
PG_PASSWORD=replace_with_rds_password
PG_DATABASE=express_auth
DATABASE_URL=postgresql://app_user:replace_with_rds_password@ccud33ui.cluster-czrs8234isg7.us-east-1.rds.amazonaws.com:5432/express_auth

AWS_ACCESS_KEY=replace_me
AWS_SECRET_KEY=replace_me
AWS_REGION=us-east-1

DB_MIGRATING=false
DB_SEEDING=false
```

> Important: `.env.example` in this repo is development-oriented and defaults these two flags to `true`.
> For production runtime, always keep:
> - `DB_MIGRATING=false`
> - `DB_SEEDING=false`

### 4. Run Database Migration Once

Run migrations before first app start (from a machine that can reach RDS):

```bash
pnpm install
pnpm db:migrate
```

Optional one-time seed (first environment only):

```bash
pnpm db:seed
```

---

## Option A: EC2 + Docker Compose + RDS

Best for first production deployment and learning Docker operations.

### Architecture

```text
Internet -> EC2 (Docker app container) -> RDS PostgreSQL
```

### A1. Launch EC2

1. AMI: Ubuntu 24.04 LTS
2. Instance type: `t3.small` (minimum practical)
3. Storage: 20 GB+
4. Network: same VPC/subnet as RDS (or reachable subnet)
5. Security group: `express-auth-app-sg`
6. Key pair: create/download `.pem`

### A2. Install Docker on EC2

SSH into EC2:

```bash
ssh -i your-key.pem ubuntu@<ec2-public-ip>
```

Install Docker + Compose plugin:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

Install Node.js (required before pnpm):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Install pnpm (for one-time migration commands):

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
pnpm -v
```

### A3. Deploy App Code

On EC2:

```bash
git clone https://github.com/<your-org-or-user>/express-auth.git
cd express-auth
cp .env.example .env
# edit .env with production values from Shared Setup
nano .env
```

### A4. Migrate Database

```bash
pnpm install
pnpm db:migrate
```

### A5. Start Production Container

```bash
pnpm compose:prod-up
```

Check status:

```bash
pnpm compose:prod-ps
docker logs express-auth-app-prod
curl http://localhost:8000/
```

### A6. Open API Port (Temporary Direct Access)

In `express-auth-app-sg`, allow inbound TCP `8000` from your IP for testing.

Test:

```bash
curl http://<ec2-public-ip>:8000/
```

For real production, put Nginx/ALB + HTTPS in front and remove public `8000`.

### A7. Update Deployment

On code changes:

```bash
cd express-auth
git pull
pnpm db:migrate
pnpm compose:prod-up
```

### A8. Stop / Restart

```bash
pnpm compose:prod-down
pnpm compose:prod-up
```

---

## Option B: ECS on EC2 + ECR + ALB + RDS

Best when you want orchestration on your own EC2 servers (not Fargate/serverless).

### Architecture

```text
Internet -> ALB (HTTPS) -> ECS Service (EC2 launch type) -> RDS PostgreSQL
```

### B1. Create ECR Repository

1. AWS Console -> ECR -> Create repository
2. Name: `express-auth`
3. Copy repository URI:
   - Example: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/express-auth`

### B2. Build and Push Image

On your local machine (or CI):

```bash
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -f Dockerfile.Prod -t express-auth:latest .
docker tag express-auth:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/express-auth:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/express-auth:latest
```

### B3. Create ECS Cluster (EC2 Launch Type)

1. ECS -> Clusters -> Create cluster
2. Name: `express-auth-cluster`
3. Infrastructure: **Amazon EC2 instances**
4. Create/new ASG with:
   - Instance type: `t3.small`
   - Desired capacity: `1`
   - Security group: `express-auth-app-sg`
5. Create cluster

### B4. Create Target Group + ALB

**Target Group**

1. EC2 -> Target Groups -> Create
2. Target type: IP (or instance, depending setup)
3. Protocol: HTTP, Port: `8000`
4. Health check path: `/`

**ALB**

1. EC2 -> Load Balancers -> Create ALB
2. Internet-facing
3. Listener: HTTP 80 (add HTTPS 443 later with ACM cert)
4. Forward to target group above

Update `express-auth-app-sg`:

- Allow inbound `8000` from ALB security group

### B5. Create Task Definition

ECS -> Task definitions -> Create

- Launch type: EC2
- Container name: `express-auth-app`
- Image URI: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/express-auth:latest`
- Port mapping: `8000`
- Environment variables: set all required values from Shared Setup
- Secrets (recommended): store `JWT_SECRET`, `PG_PASSWORD`, `AWS_SECRET_KEY` in Secrets Manager/SSM and map in task definition
- Log driver: `awslogs` (create log group `/ecs/express-auth`)

Command (already in image):

```text
node dist/server.mjs
```

CPU/Memory example:

- CPU: `512`
- Memory: `1024`

### B6. Create ECS Service

1. Cluster -> Create service
2. Launch type: EC2
3. Task definition: latest from B5
4. Desired tasks: `1`
5. Load balancer: Application Load Balancer
6. Container to load balance: `express-auth-app:8000`
7. Target group: from B4
8. Create service

Wait until service is stable and target health is healthy.

### B7. Run Migration Task (One-Time / Per Release)

Do **not** run `pnpm db:migrate` inside the normal production runtime container from `Dockerfile.Prod`.
That image prunes dev dependencies, while migration script uses `tsx`.

Use one of these approaches:

1. **CI/runner migration step (recommended):**
   - From a CI job or admin machine that can reach RDS:
   - `pnpm install`
   - `pnpm db:migrate`

2. **Dedicated migration image/task:**
   - Build an image that includes migration tooling (`tsx`/dev deps)
   - Run that as a one-off ECS task before updating service

Example CI/runner command:

```bash
pnpm install
pnpm db:migrate
```

Run once before switching traffic to new app version.

Keep runtime env:

```env
DB_MIGRATING=false
DB_SEEDING=false
```

### B8. Verify

1. Open ALB DNS in browser:
   - `http://<alb-dns-name>/`
2. Confirm health checks pass in target group
3. Test auth/API endpoints

### B9. Deploy New Version

1. Build/push new image tag to ECR
2. Register new task definition revision with new image tag
3. Update ECS service to new revision
4. Run migration task if schema changed
5. Confirm ALB targets healthy

---

## Which Option to Choose

| Need | Choose |
|---|---|
| Fastest first production setup | Option A (EC2 + Compose) |
| Learn Docker basics first | Option A |
| Auto container restart + rolling deploy on your servers | Option B (ECS on EC2) |
| Avoid serverless abstraction | Both A and B (not Fargate) |

Recommended path:

1. Start with **Option A**
2. Move to **Option B** when you need better deploy orchestration

---

## Production Checklist

- [ ] RDS reachable only from app security group
- [ ] Real secrets not committed to git
- [ ] `DB_MIGRATING=false` and `DB_SEEDING=false` in runtime
- [ ] Migrations run as separate step
- [ ] HTTPS enabled (ALB/Nginx + ACM certificate)
- [ ] CloudWatch logs/monitoring enabled
- [ ] Backup/restore tested for RDS
