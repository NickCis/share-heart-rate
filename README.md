# Share Heart Rate

Live heart rate sharing from a Garmin watch to a web viewer.

## Stack

- **Garmin Connect IQ** (`garmin/`) — watch app for Forerunner 55 and Fenix 7s
- **Vercel** — hosts the React web app and `/api/*` serverless routes at `https://share-heart-rate.vercel.app`
- **Firebase Firestore** (Spark plan) — session documents and `hearts` subcollection

## Quick start

### 1. Install dependencies

```bash
npm install
npm install --prefix web
```

### 2. Configure environment

Copy [`.env.example`](.env.example) and [`web/.env.example`](web/.env.example).

For local API + web together:

```bash
npm run dev:vercel
```

Create `.env.local` in the project root with `FIREBASE_SERVICE_ACCOUNT_KEY` (see [Troubleshooting](#troubleshooting-http-500) below).

For web-only dev with API proxied from Vercel:

```bash
npm run dev:vercel      # terminal 1 — Vercel dev on :3000
npm run dev:web      # terminal 2 — Vite on :5173, proxies /api → :3000
```

Set `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local` (Vercel) or project root for `vercel dev` so API routes can write to Firestore.

### 3. Firestore emulator (optional)

```bash
npm run emulators
```

Then point the web client at the emulator (`VITE_USE_FIREBASE_EMULATORS=true` in `web/.env`).

### 4. Build and run the Garmin app

Requires Connect IQ SDK (see [garmin/Makefile](garmin/Makefile)) and a signing key:

```bash
openssl pkcs8 -topk8 -nocrypt -in private_key.pem -outform DER -out garmin/private_key.der
```

#### Simulator device (Forerunner 55)

The default build target is **fr55**. The compiler and simulator need the FR55 device files installed under `~/.Garmin/ConnectIQ/Devices/fr55`.

If `make build` reports `Invalid device id: fr55`, open **Connect IQ SDK Manager** and download the **Forerunner 55** device for your SDK version. On this machine the manager is at `~/repos/garmin` (or `connectiq-sdk-manager` on `$PATH`).

In the simulator UI, select **Forerunner 55** before running the app.

```bash
npm run garmin:simulator   # separate terminal — pick FR55 in the simulator
npm run garmin:run           # builds for fr55 and loads the .prg
```

Build for another product: `make -C garmin build DEVICE=fenix7s`

#### Garmin API base URL

| Environment | Base URL |
|---|---|
| Local (`vercel dev`) | `http://127.0.0.1:3000` |
| Production | `https://share-heart-rate.vercel.app` |

Set this in Garmin Connect IQ app settings on the watch/simulator, or edit persistent storage in the simulator.

#### Target devices

- **Forerunner 55** — default (`DEVICE=fr55`, `minSdkVersion="3.4.0"`)
- **Fenix 7s** — also listed in `manifest.xml`; build with `DEVICE=fenix7s`

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/session` | Create session → `{ id, secret }` |
| `POST` | `/api/session/:id/heart` | Post BPM (Bearer secret) |
| `GET` | `/api/session/:id/qr.png` | QR image for session viewer URL |

## Deploy

### Vercel (web + API)

```bash
npm run deploy
```

Deploys to Vercel production. Set these in the Vercel project settings:

| Variable | Purpose |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin JSON (single line) for Firestore writes |
| `PUBLIC_BASE_URL` | `https://share-heart-rate.vercel.app` (used in QR codes) |

### Firestore rules & indexes (Firebase)

```bash
npm run deploy:rules
```

Deploys only `firestore.rules` and `firestore.indexes.json` to the `share-heart-rate` Firebase project.

## Watch app behavior

1. On launch, load or create a session (`POST /api/session`)
2. Every 30 seconds, read heart rate and `POST /api/session/:id/heart`
3. **QR screen** — server-rendered QR linking to `/session/:id`
4. **Heart screen** — last sent BPM (number only; unit shown separately)
5. **Link screen** — full session URL as text (wrapped for round display)
6. Swipe up/down (or next/prev) to cycle: QR → Heart → Link → QR
7. Start/menu button → **Reset session** (new session + new QR)

## Troubleshooting HTTP 500

The watch shows **HTTP 500** when the API cannot write to Firestore. The default watch URL points at production (`https://share-heart-rate.vercel.app`), so this usually means **Vercel is missing Firebase credentials**.

### Fix (Vercel production)

1. Firebase Console → **Project settings** → **Service accounts** → **Generate new private key** (downloads a `.json` file).
2. Vercel → your project → **Settings** → **Environment Variables**
3. Add:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value:** paste the **entire JSON file contents** as one line (or use Vercel's multiline editor)
   - Also set `PUBLIC_BASE_URL` = `https://share-heart-rate.vercel.app`
4. **Redeploy** (`npm run deploy`) so the new env vars take effect.

### Fix (local simulator)

1. Copy the service account JSON into `.env.local` at the repo root:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"share-heart-rate",...}
PUBLIC_BASE_URL=http://127.0.0.1:3000
```

2. Start the API: `npm run dev:vercel`
3. In the simulator app settings, set **API base URL** to `http://127.0.0.1:3000` (not the Vercel URL).

### Verify

```bash
curl -X POST https://share-heart-rate.vercel.app/api/session \
  -H "Content-Type: application/json" \
  -d '{"device":"fr55"}'
```

Success returns `201` with `{"id":"...","secret":"..."}`. A `500` with `Internal server error` means credentials are still missing or invalid.
