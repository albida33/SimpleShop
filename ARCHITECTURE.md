# Simple Shop — Architecture Overview

## Application Components

Simple Shop is a fully **client-side static web application** — no backend, no database, no API calls.


| Component          | File(s)                                          | Responsibility                                                        |
| ------------------ | ------------------------------------------------ | --------------------------------------------------------------------- |
| Shop page          | `index.html`                                     | Product grid, cart sidebar, checkout modal                            |
| Order history page | `orders.html`                                    | Reads and renders saved orders from`localStorage`                     |
| Product catalogue  | `js/products.js`                                 | Hardcoded product data; renders the product card grid                 |
| Cart logic         | `js/cart.js`                                     | In-memory cart state, sidebar, quantity controls, toast notifications |
| Checkout logic     | `js/checkout.js`                                 | Customer ID modal, order ID generation, persistence to`localStorage`  |
| Styles             | `css/base.css`, `css/shop.css`, `css/orders.css` | Reset/tokens, shop layout, order history layout                       |
| Product images     | `images/`                                        | Static`.jpg`/`.png` files referenced in `js/products.js`              |
| Container config   | `Dockerfile`, `nginx.conf`                       | Packages the full app into an`nginx:alpine` Docker image              |
| Hosting config     | `firebase.json`, `.firebaserc`                   | Tells Firebase CLI which directory to publish                         |

---

## Three Deployment Environments


|                       | **A — VM (Compute Engine)**                | **B — Cloud Run**                       | **C — Firebase Hosting**             |
| --------------------- | ------------------------------------------- | ---------------------------------------- | ------------------------------------- |
| **Type**              | IaaS                                        | PaaS / containers                        | Serverless / CDN                      |
| **Infrastructure**    | Debian`e2-micro` VM                         | Managed container platform               | Google global CDN                     |
| **Web server**        | nginx (native), port 80                     | nginx (in container), port 8080          | Firebase edge nodes                   |
| **Deploy command**    | `git pull` + `systemctl reload nginx`       | `gcloud builds submit` → Cloud Run swap | `firebase deploy`                     |
| **Image storage**     | Local disk at`/var/www/simple-shop/images/` | Baked into Docker image at build time    | Uploaded to CDN alongside HTML/JS/CSS |
| **Image update path** | `git pull` — live immediately              | Rebuild + redeploy container             | Re-run`firebase deploy` (~60 s)       |
| **HTTPS**             | Manual (Certbot / Let's Encrypt)            | Automatic                                | Automatic                             |
| **Scales to zero**    | No                                          | Yes                                      | Yes                                   |
| **Idle cost**         | ~$5 / mo                                    | $0                                       | $0                                    |
| **Best for**          | Learning server ops                         | CI/CD pipelines                          | Cheapest static hosting ✓            |

**Recommended:** Firebase Hosting — zero idle cost, global CDN, automatic HTTPS, two-minute deploys.

---

## Architecture Decisions

**1. `localStorage` only — no backend or database**
The app is a product demo with no user accounts, no shared state, and no server-side logic needed.  The project is focused on deployment in the cloud environment.

**2. Images bundled as static files — no Cloud Storage bucket**
A dedicated object store (GCS, S3, Cloudinary) would require separate bucket configuration in each environment. Since the catalogue is small and hardcoded, co-deploying images with the HTML keeps the architecture identical across all three targets.
*Trade-off:* changing a product image requires a redeploy rather than an upload.

**3. `nginx:alpine` as the container base image**
Alpine produces a final image under 25 MB versus ~180 MB for the Debian variant — faster Cloud Build times, cheaper Artifact Registry storage, and a smaller CVE surface for a container serving only static files.

**4. nginx on port 8080, not 80**
Cloud Run rejects containers bound to privileged ports (< 1024). Port 8080 satisfies that constraint with a single `nginx.conf` that works unchanged across both container environments; the VM runs nginx natively and is not subject to this restriction.

**5. IaaS → PaaS → Serverless — one app, three tiers**
Deploying the same codebase to all three environments makes the control-vs-overhead trade-off concrete and measurable: the VM teaches server operations; Cloud Run demonstrates containerised CI/CD; Firebase shows how far managed platforms can reduce operational burden.
