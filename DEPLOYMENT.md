# GCP Deployment Guide — Simple Shop

This guide covers deploying **Simple Shop** to Google Cloud Platform across three environments.
Every environment serves the same static files (`index.html`, `orders.html`, `css/`, `js/`).

---

## Table of Contents

1. [Common Prerequisites](#1-common-prerequisites)
2. [Deploying from a Git Clone — Cloud Shell Workflow](#2-deploying-from-a-git-clone--cloud-shell-workflow)
3. [Environment A — VM (Compute Engine)](#3-environment-a--vm-compute-engine)
4. [Environment B — Dockerized (Cloud Run)](#4-environment-b--dockerized-cloud-run)
5. [Environment C — Serverless (Firebase Hosting)](#5-environment-c--serverless-firebase-hosting)
6. [Comparison Table](#6-comparison-table)
7. [Cleanup](#7-cleanup)

---

## 1. Common Prerequisites

Complete this section once before following any deployment steps.

### 1.1 Google Cloud account

1. Go to <https://console.cloud.google.com> and sign in.
2. Create a new project (or select an existing one).
3. Enable billing on the project — required even for free-tier resources.
4. Copy your **Project ID** from the project selector drop-down.
   Your **Project ID** is `project1-dats5750-496606`.

### 1.2 Install and configure the Google Cloud CLI (local machine only)

Skip this if you are using Cloud Shell — `gcloud` is pre-installed there.

```bash
# Install (Linux / WSL)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL          # reload shell so gcloud is on PATH

# Authenticate
gcloud auth login       # opens a browser for Google sign-in

# Set your project
gcloud config set project project1-dats5750-496606

# Confirm
gcloud config get-value project   # should print project1-dats5750-496606
```

> **WSL tip:** If the browser does not open automatically, copy the URL that
> `gcloud auth login` prints and paste it into a Windows browser.

---

## 2. Deploying from a Git Clone — Cloud Shell Workflow

If your project is in a Git repository, the recommended approach is
**Google Cloud Shell** — a free browser-based terminal that has `git`,
`gcloud`, Docker, Node.js, and the Firebase CLI pre-installed.
No local tools or uploads needed.

### Step 1 — Open Cloud Shell

1. Go to <https://console.cloud.google.com>
2. Click the **Activate Cloud Shell** icon in the top-right toolbar (looks like `>_`)
3. A terminal panel opens at the bottom of the browser

> Cloud Shell gives you a persistent 5 GB home directory.
> Your cloned files survive between sessions even though the VM itself resets.

### Step 2 — Clone the repository

```bash
# Public repository
git clone https://github.com/albida33/SimpleShop.git
cd SimpleShop
```

### Step 3 — Set your project

```bash
gcloud config set project project1-dats5750-496606
```

---

### 2A — Run on a VM (Compute Engine)

SSH into the VM and clone the repo there directly.
The VM serves files straight from the cloned directory, so future updates
are a single `git pull`.

#### First-time setup

> Complete [Section 3](#3-environment-a--vm-compute-engine) Steps 1–4 and 6–7
> to create the VM, open the firewall, and configure nginx.
> Replace Step 5 (file upload) with the commands below.

```bash
# 1. SSH into the VM
gcloud compute ssh simple-shop-vm --zone=us-central1-a

# 2. On the VM — install git and clone the repo into the web root
sudo apt-get install -y git
sudo git clone https://github.com/albida33/SimpleShop.git \
     /var/www/simple-shop
sudo chown -R www-data:www-data /var/www/simple-shop

# 3. Exit the VM
exit
```

#### Update after a `git push`

```bash
gcloud compute ssh simple-shop-vm --zone=us-central1-a \
  --command="cd /var/www/simple-shop && sudo git pull && sudo systemctl reload nginx"
```

---

### 2B — Run on Cloud Run (Dockerized)

Use `gcloud builds submit` to build the Docker image on Cloud Build —
no local Docker installation needed.

```bash
# 1. Enable required APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

# 2. Create the Artifact Registry repository (once)
gcloud artifacts repositories create simple-shop \
  --repository-format=docker \
  --location=us-central1

# 3. Build the image on Cloud Build and push it to Artifact Registry
#    (run from the project root where Dockerfile lives)
gcloud builds submit \
  --tag=us-central1-docker.pkg.dev/project1-dats5750-496606/simple-shop/app:latest .

# 4. Deploy to Cloud Run
gcloud run deploy simple-shop \
  --image=us-central1-docker.pkg.dev/project1-dats5750-496606/simple-shop/app:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=8080

# 5. Get the live URL
gcloud run services describe simple-shop \
  --platform=managed \
  --region=us-central1 \
  --format='value(status.url)'
```

Cloud Run provides HTTPS automatically.

#### Update after a `git push`

```bash
# From the project directory in Cloud Shell
git pull

gcloud builds submit \
  --tag=us-central1-docker.pkg.dev/project1-dats5750-496606/simple-shop/app:latest .

gcloud run deploy simple-shop \
  --image=us-central1-docker.pkg.dev/project1-dats5750-496606/simple-shop/app:latest \
  --platform=managed \
  --region=us-central1
```

---

### 2C — Run on Firebase Hosting (Serverless)

Firebase CLI is pre-installed in Cloud Shell.

```bash
# 1. Log in — Cloud Shell can't open a browser, so use --no-localhost.
#    Copy the printed URL into a browser tab to authenticate.
firebase login --no-localhost

# 2. Initialise Firebase in the project directory (first time only)
firebase init hosting
```

Answer the prompts:

| Prompt | Answer |
|---|---|
| Select a Firebase project | Choose your GCP project |
| Public directory | `.` (a single dot) |
| Configure as a single-page app? | `N` |
| Set up automatic builds with GitHub? | `N` |
| Overwrite `index.html`? | `N` |

```bash
# 3. Deploy
firebase deploy --only hosting
```

Firebase prints the live URL when complete (e.g. `https://project1-dats5750-496606.web.app`).

#### Update after a `git push`

```bash
git pull && firebase deploy --only hosting
```

---

## 3. Environment A — VM (Compute Engine)

A Linux virtual machine running **nginx** to serve the static files directly.

**When to choose this:** You need full server control, want to customise the OS
or web server config, or are migrating from an on-premises setup.

### Step 1 — Enable the Compute Engine API

```bash
gcloud services enable compute.googleapis.com
```

### Step 2 — Create the VM instance

```bash
gcloud compute instances create simple-shop-vm \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --tags=http-server
```

> `e2-micro` qualifies for the GCP Always Free tier (one instance per account).

### Step 3 — Open port 80 in the firewall

```bash
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --target-tags=http-server \
  --description="Allow inbound HTTP traffic"
```

### Step 4 — Install nginx on the VM

```bash
gcloud compute ssh simple-shop-vm --zone=us-central1-a \
  --command="sudo apt-get update -y && sudo apt-get install -y nginx"
```

### Step 5 — Upload the project files

**If you cloned from Git**, see [Section 2A](#2a--run-on-a-vm-compute-engine) instead.

Run the following from your **local** project directory:

```bash
# Copy files to a temp location on the VM
gcloud compute scp --recurse \
  index.html orders.html css/ js/ \
  simple-shop-vm:/tmp/simple-shop/ \
  --zone=us-central1-a

# Move to the web root and set ownership
gcloud compute ssh simple-shop-vm --zone=us-central1-a --command="
  sudo rm -rf /var/www/simple-shop
  sudo mv /tmp/simple-shop /var/www/simple-shop
  sudo chown -R www-data:www-data /var/www/simple-shop"
```

### Step 6 — Configure nginx

```bash
gcloud compute ssh simple-shop-vm --zone=us-central1-a --command="
sudo tee /etc/nginx/sites-available/simple-shop > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;
    root /var/www/simple-shop;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
    server_tokens off;
}
NGINX
sudo ln -sf /etc/nginx/sites-available/simple-shop \
            /etc/nginx/sites-enabled/simple-shop
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx"
```

### Step 7 — Get the public IP and verify

```bash
gcloud compute instances describe simple-shop-vm \
  --zone=us-central1-a \
  --format='value(networkInterfaces[0].accessConfigs[0].natIP)'
```

Open `http://<IP_ADDRESS>` in your browser.

---

## 4. Environment B — Dockerized (Cloud Run)

The app is packaged into a **Docker image** (nginx + static files) and deployed
to **Cloud Run** — Google's fully managed container platform that scales to zero
when idle.

**When to choose this:** You use CI/CD pipelines, want reproducible builds, or
need auto-scaling without managing a VM.

> **Required files** already in the project root:
> - `Dockerfile` — builds the image using `nginx:alpine`
> - `nginx.conf` — configures nginx to listen on port 8080 (required by Cloud Run)
> - `.dockerignore` — excludes docs from the image

### Step 1 — Enable required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com
```

### Step 2 — Create an Artifact Registry repository

```bash
gcloud artifacts repositories create simple-shop \
  --repository-format=docker \
  --location=us-central1 \
  --description="Simple Shop container images"
```

### Step 3 — Build and push the image

**If deploying from Cloud Shell or a Git clone**, use Cloud Build (no Docker required locally):

```bash
gcloud builds submit \
  --tag=us-central1-docker.pkg.dev/project1-dats5750-496606/simple-shop/app:latest .
```

**If deploying from your local machine** with Docker installed:

```bash
# Authenticate Docker with GCP
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build
docker build -t \
  us-central1-docker.pkg.dev/project1-dats5750-496606/simple-shop/app:latest .

# Push
docker push \
  us-central1-docker.pkg.dev/project1-dats5750-496606/simple-shop/app:latest
```

### Step 4 — Deploy to Cloud Run

```bash
gcloud run deploy simple-shop \
  --image=us-central1-docker.pkg.dev/project1-dats5750-496606/simple-shop/app:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=8080
```

### Step 5 — Get the service URL and verify

```bash
gcloud run services describe simple-shop \
  --platform=managed \
  --region=us-central1 \
  --format='value(status.url)'
```

Cloud Run provides HTTPS automatically.

---

## 5. Environment C — Serverless (Firebase Hosting)

Static files are deployed to **Firebase Hosting** — Google's global CDN for
static sites. No VMs or containers.

**When to choose this:** You want the fastest and cheapest deployment for a static
site. Firebase Hosting provides HTTPS, a global CDN, and a generous free tier.

### Step 1 — Install the Firebase CLI (local machine only)

Skip if using Cloud Shell — Firebase CLI is pre-installed.

```bash
npm install -g firebase-tools
```

No Node.js? Use the standalone installer:

```bash
curl -sL https://firebase.tools | bash
```

### Step 2 — Log in

```bash
# Local machine
firebase login

# Cloud Shell (can't open a browser directly)
firebase login --no-localhost
```

### Step 3 — Initialise Firebase in the project (first time only)

```bash
firebase init hosting
```

| Prompt | Answer |
|---|---|
| Select a Firebase project | Choose your GCP project |
| Public directory | `.` (a single dot — files are at the project root) |
| Configure as a single-page app? | `N` |
| Set up automatic builds with GitHub? | `N` |
| Overwrite `index.html`? | `N` |

### Step 4 — Deploy

```bash
firebase deploy --only hosting
```

Firebase prints the live URL when complete (e.g. `https://project1-dats5750-496606.web.app`).

### Updating after code changes

```bash
firebase deploy --only hosting
```

### Optional: preview before going live

```bash
firebase hosting:channel:deploy preview --expires 1h
```

---

## 6. Comparison Table

| | VM (Compute Engine) | Dockerized (Cloud Run) | Serverless (Firebase) |
|---|:---:|:---:|:---:|
| **Recommended update method** | `git pull` on VM | `git pull` + `gcloud builds submit` | `git pull` + `firebase deploy` |
| **Setup complexity** | Medium | Medium | Low |
| **First deploy time** | ~10 min | ~5 min | ~2 min |
| **HTTPS** | Manual | Automatic | Automatic |
| **Auto-scaling** | No | Yes | Yes |
| **Scales to zero (no idle cost)** | No | Yes | Yes |
| **Idle cost** | ~$5/mo (e2-micro) | $0 | $0 |
| **Full OS control** | Yes | No | No |
| **Works from Cloud Shell** | Yes | Yes (`gcloud builds submit`) | Yes |

---

## 7. Cleanup

Remove all GCP resources when no longer needed to avoid charges.

### VM (Compute Engine)

```bash
gcloud compute instances delete simple-shop-vm \
  --zone=us-central1-a --quiet

gcloud compute firewall-rules delete allow-http --quiet
```

### Cloud Run + Artifact Registry

```bash
gcloud run services delete simple-shop \
  --region=us-central1 --quiet

gcloud artifacts repositories delete simple-shop \
  --location=us-central1 --quiet
```

### Firebase Hosting

```bash
# Disable hosting (removes the live site, keeps the project)
firebase hosting:disable

# Or delete the entire Firebase project:
# https://console.firebase.google.com → Project Settings → Delete project
```
