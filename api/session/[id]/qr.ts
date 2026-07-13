import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSessionQr } from "../../lib/sessions.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await getSessionQr(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
