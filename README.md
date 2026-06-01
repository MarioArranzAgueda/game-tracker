# GameTracker

Personal game library tracker built with Next.js, PostgreSQL, and the IGDB API. Deployed self-hosted on a Ugreen NAS via Docker Compose.

---

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5**
- **Tailwind CSS v4** · **Prisma 7** · **PostgreSQL 16**
- **TanStack Query v5** · **IGDB API** (via Twitch credentials)

---

## First-time setup on the NAS

### 1. Clone the repo

```bash
git clone <your-repo-url> gametracker
cd gametracker
```

### 2. Create the environment file

```bash
cp .env.example .env   # or create it manually
```

Required variables in `.env`:

```env
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

> Get these from [dev.twitch.tv](https://dev.twitch.tv) — the IGDB API uses Twitch OAuth.

### 3. Build and start

```bash
sudo docker compose build --no-cache
sudo docker compose up -d
```

The app will be available at `http://<NAS-IP>:3000`.

PostgreSQL data is stored in the named volume `pgdata` — it persists across rebuilds and container restarts.

---

## Deploying a new version

Every time you push changes to the code and want to update the NAS:

```bash
# 1. Pull the latest code
git pull

# 2. Rebuild the app image
sudo docker compose build --no-cache

# 3. Restart ONLY the app container (leaves the DB untouched)
sudo docker compose up -d --no-deps app
```

> `--no-deps` ensures only the `app` service is recreated. The `db` container and the `pgdata` volume are never affected.

---

## Database migrations

If the new version includes Prisma schema changes, run the migration after step 3:

```bash
sudo docker compose exec app npx prisma migrate deploy
```

---

## Enabling HTTPS (required for PWA install)

The app is accessed via **Tailscale**, which can issue free, browser-trusted HTTPS certificates for your NAS's Tailscale hostname. These are real Let's Encrypt certificates — no installation needed on any device.

Traffic flow: `browser → Tailscale VPN → Caddy (HTTPS/TLS) → Next.js app (HTTP)`

> **Important:** This guide is tested on Ugreen NAS. Standard HTTPS ports (443, 8443, 9443) are typically occupied by the NAS UI, so we use **port 8444**.

### Step 1 — Enable HTTPS in Tailscale admin

1. Go to [login.tailscale.com/admin/dns](https://login.tailscale.com/admin/dns)
2. Scroll to **HTTPS Certificates** and click **Enable**

### Step 2 — Find your NAS Tailscale hostname

1. Go to [login.tailscale.com/admin/machines](https://login.tailscale.com/admin/machines)
2. Find your NAS in the list
3. Copy the full hostname from the "Addresses" column
   - Format: `<machine-name>.<tailnet-id>.ts.net`
   - Example: `dxp2800-b191.taila81037.ts.net`

**Keep this handy — you'll need it for the next steps.**

### Step 3 — Generate the Tailscale certificate on the NAS

SSH into the NAS and replace `YOUR_TAILSCALE_HOSTNAME` with the actual hostname from Step 2:

```bash
# Navigate to the Docker compose directory (where docker-compose.yaml is)
cd /volume1/docker/gametracker

# Create certs directory
mkdir -p ./certs

# Generate the certificate (replace YOUR_TAILSCALE_HOSTNAME)
sudo tailscale cert \
  --cert-file ./certs/YOUR_TAILSCALE_HOSTNAME.crt \
  --key-file  ./certs/YOUR_TAILSCALE_HOSTNAME.key \
  YOUR_TAILSCALE_HOSTNAME
```

**Example:**
```bash
sudo tailscale cert \
  --cert-file ./certs/dxp2800-b191.taila81037.ts.net.crt \
  --key-file  ./certs/dxp2800-b191.taila81037.ts.net.key \
  dxp2800-b191.taila81037.ts.net
```

Verify the files were created:
```bash
ls -la ./certs/
```

You should see two files: `.crt` and `.key` with your hostname.

> If `tailscale cert` is not available, update Tailscale: `sudo tailscale update`

### Step 4 — Update the .env file

Edit `.env` in `/volume1/docker/gametracker/` (same directory as docker-compose.yaml):

```bash
sudo nano /volume1/docker/gametracker/.env
```

Ensure these variables are set (replace `YOUR_TAILSCALE_HOSTNAME`):

```env
CADDY_HOSTNAME=YOUR_TAILSCALE_HOSTNAME
CERTS_DIR=./certs
```

**Example:**
```env
CADDY_HOSTNAME=dxp2800-b191.taila81037.ts.net
CERTS_DIR=./certs
```

Save and exit (Ctrl+O, Enter, Ctrl+X).

### Step 5 — Verify the Caddyfile is correct

Check that `Caddyfile` (in `/volume1/docker/gametracker/`) matches this format:

```bash
cat /volume1/docker/gametracker/Caddyfile
```

Should show:
```
{$CADDY_HOSTNAME} {
  tls /certs/{$CADDY_HOSTNAME}.crt /certs/{$CADDY_HOSTNAME}.key
  reverse_proxy app:3000
}
```

If not, edit it:
```bash
sudo nano /volume1/docker/gametracker/Caddyfile
```

### Step 6 — Deploy and verify

From `/volume1/docker/gametracker/`:

```bash
sudo docker compose down
sudo docker compose up -d
sleep 3
sudo docker compose ps
```

Check that all containers are `Up` (healthy):
- `gametracker-db-1` → Healthy
- `gametracker-app-1` → Healthy  
- `gametracker-caddy-1` → Up

Check Caddy logs for errors:
```bash
sudo docker compose logs caddy --tail=10
```

Should show `"msg":"serving initial configuration"` with no errors.

### Step 7 — Access from your device

On any device connected to Tailscale:

```
https://YOUR_TAILSCALE_HOSTNAME:8444
```

**Example:** `https://dxp2800-b191.taila81037.ts.net:8444`

✅ The certificate should be valid (green lock in browser)  
✅ The GameTracker app should load

### Step 8 — Set up automatic certificate renewal

Tailscale certificates expire every 90 days. Add a cron job on the NAS:

```bash
sudo crontab -e
```

Add this line (runs every Monday at 3 AM):

```cron
0 3 * * 1 cd /volume1/docker/gametracker && sudo tailscale cert --cert-file ./certs/YOUR_TAILSCALE_HOSTNAME.crt --key-file ./certs/YOUR_TAILSCALE_HOSTNAME.key YOUR_TAILSCALE_HOSTNAME && sudo docker compose restart caddy
```

**Example:**
```cron
0 3 * * 1 cd /volume1/docker/gametracker && sudo tailscale cert --cert-file ./certs/dxp2800-b191.taila81037.ts.net.crt --key-file ./certs/dxp2800-b191.taila81037.ts.net.key dxp2800-b191.taila81037.ts.net && sudo docker compose restart caddy
```

### Install as PWA

Once HTTPS works, from your device open `https://YOUR_TAILSCALE_HOSTNAME:8444`:

**Mobile (Chrome / Edge):**
- Tap the three-dot menu (⋮) → **Add to Home Screen**

**Mobile (Safari / iPhone):**
- Tap Share → **Add to Home Screen**

**Desktop:**
- Click the install icon in the address bar (if shown)

---

## Troubleshooting HTTPS

### ❌ "Cannot access this site" or "DNS_PROBE_FINISHED_NXDOMAIN"

**Problem:** The hostname doesn't resolve.  
**Solution:** Verify you're connected to Tailscale and use the exact hostname from [login.tailscale.com/admin/machines](https://login.tailscale.com/admin/machines).

### ❌ Caddy container keeps restarting

**Problem:** `docker compose ps` shows Caddy as `Exited` or `Restarting`.  
**Solution:** Check logs for certificate path errors:
```bash
sudo docker compose logs caddy --tail=30 | grep -i "error\|cert"
```

Verify the certs exist:
```bash
ls -la /volume1/docker/gametracker/certs/
```

### ❌ "SSL_ERROR_SYSCALL" or certificate errors

**Problem:** Connection works from within the NAS but fails from devices.  
**Solution:** Ensure the certificate hostname matches exactly:
```bash
grep CADDY_HOSTNAME /volume1/docker/gametracker/.env
ls /volume1/docker/gametracker/certs/ | grep crt
```

Both must show the same hostname.

### ❌ "Address already in use" for port 8444

**Problem:** Another service is using port 8444.  
**Solution:** Find an open port (e.g., 8445, 9000) and update both:
- `docker-compose.yaml` ports section: `"8445:443"`
- `Caddyfile`: Add `:8445` to the hostname line (e.g., `{$CADDY_HOSTNAME}:8445 {`)
- Restart: `sudo docker compose down && sudo docker compose up -d`

---

## Useful commands

| Task | Command |
|------|---------|
| Check running containers | `sudo docker compose ps` |
| View app logs | `sudo docker compose logs app --tail=50 -f` |
| View Caddy logs | `sudo docker compose logs caddy --tail=50 -f` |
| View DB logs | `sudo docker compose logs db --tail=50` |
| Restart app only | `sudo docker compose restart app` |
| Reload Caddy config | `sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile` |
| Stop everything | `sudo docker compose down` |
| Stop + wipe DB volume ⚠️ | `sudo docker compose down --volumes` |

---

## Data safety

The PostgreSQL data lives in the Docker named volume `pgdata`.  
It is **never deleted** unless you explicitly run `docker compose down --volumes`.

Safe operations (do not affect data):
- `docker compose build`
- `docker compose up -d`
- `docker compose up -d --no-deps app`
- `docker compose restart app`
- `docker compose down` (without `--volumes`)
