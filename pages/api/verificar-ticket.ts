import type { NextApiRequest, NextApiResponse } from "next";

type ApiResponse =
  | {
      ok: false;
      error: string;
      raw?: string;
    }
  | Record<string, unknown>;

function isHtml(text: string): boolean {
  const t = (text || "").trim().toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const gasUrl = process.env.GAS_WEBAPP_URL;
  const gasToken = process.env.GAS_API_TOKEN;
  if (!gasUrl || !gasToken) {
    res
      .status(500)
      .json({ ok: false, error: "Missing env GAS_WEBAPP_URL/GAS_API_TOKEN" });
    return;
  }

  const ticket = String(req.query.ticket ?? "").trim();
  const storeId = String(req.query.storeId ?? "PV").trim();
  if (!ticket) {
    res.status(400).json({ ok: false, error: "ticket required" });
    return;
  }

  try {
    const url =
      `${gasUrl}?action=check` +
      `&ticket=${encodeURIComponent(ticket)}` +
      `&storeId=${encodeURIComponent(storeId)}` +
      `&token=${encodeURIComponent(gasToken)}`;

    const r = await fetch(url, { method: "GET", redirect: "follow" });
    const text = await r.text();

    if (isHtml(text)) {
      res.status(502).json({
        ok: false,
        error: "GAS returned HTML",
        raw: text.slice(0, 200),
      });
      return;
    }

    try {
      const data = JSON.parse(text) as Record<string, unknown>;
      res.status(200).json(data);
      return;
    } catch {
      res.status(502).json({
        ok: false,
        error: "GAS returned non-JSON response",
        raw: text.slice(0, 200),
      });
      return;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ ok: false, error: message });
  }
}
