import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import QRCode from "qrcode";
import { getDb, FieldValue } from "./firestore.js";

const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL ?? "https://share-heart-rate.vercel.app";

const MAX_QR_SIZE = 240;
const MIN_QR_SIZE = 80;

function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

function generateSecret(): string {
  return randomBytes(32).toString("hex");
}

function sessionViewerUrl(sessionId: string): string {
  return `${PUBLIC_BASE_URL}/session/${sessionId}`;
}

function parseBearerSecret(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header || typeof header !== "string") {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() ?? null;
}

function secretsMatch(storedHash: string, provided: string): boolean {
  const providedHash = hashSecret(provided);
  const a = Buffer.from(storedHash, "utf8");
  const b = Buffer.from(providedHash, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

function parseQrSize(raw: unknown): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 180;
  }
  return Math.min(MAX_QR_SIZE, Math.max(MIN_QR_SIZE, Math.round(parsed)));
}

function paramId(value: string | string[] | undefined): string | null {
  if (value == null) {
    return null;
  }
  return Array.isArray(value) ? value[0] : value;
}

export async function createSession(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const sessionId = randomUUID();
  const secret = generateSecret();
  const body = req.body as { device?: string } | undefined;
  const device =
    typeof body?.device === "string" && body.device.trim().length > 0
      ? body.device.trim()
      : undefined;

  const doc: Record<string, unknown> = {
    createdAt: FieldValue.serverTimestamp(),
    secretHash: hashSecret(secret),
  };
  if (device) {
    doc.device = device;
  }

  await getDb().collection("sessions").doc(sessionId).set(doc);

  res.status(201).json({ id: sessionId, secret });
}

export async function postHeart(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const sessionId = paramId(req.query.id);
  if (!sessionId) {
    res.status(400).json({ error: "Missing session id" });
    return;
  }

  const secret = parseBearerSecret(req);
  if (!secret) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const body = req.body as { bpm?: number } | undefined;
  const bpm = body?.bpm;
  if (typeof bpm !== "number" || !Number.isFinite(bpm) || bpm <= 0 || bpm > 300) {
    res.status(400).json({ error: "Invalid bpm" });
    return;
  }

  const sessionRef = getDb().collection("sessions").doc(sessionId);
  const sessionSnap = await sessionRef.get();
  if (!sessionSnap.exists) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const data = sessionSnap.data();
  const storedHash = data?.secretHash;
  if (typeof storedHash !== "string" || !secretsMatch(storedHash, secret)) {
    res.status(401).json({ error: "Invalid session secret" });
    return;
  }

  const heartRef = sessionRef.collection("hearts").doc();
  await heartRef.set({
    bpm: Math.round(bpm),
    createdAt: FieldValue.serverTimestamp(),
  });

  await sessionRef.update({
    lastBpm: Math.round(bpm),
    lastAt: FieldValue.serverTimestamp(),
  });

  res.status(201).json({ ok: true, id: heartRef.id });
}

export async function getSessionQr(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const sessionId = paramId(req.query.id);
  if (!sessionId) {
    res.status(400).json({ error: "Missing session id" });
    return;
  }

  const sessionSnap = await getDb().collection("sessions").doc(sessionId).get();
  if (!sessionSnap.exists) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const size = parseQrSize(req.query.size);
  const url = sessionViewerUrl(sessionId);
  const png = await QRCode.toBuffer(url, {
    type: "png",
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(png);
}
