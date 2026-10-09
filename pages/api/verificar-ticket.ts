import type { NextApiRequest, NextApiResponse } from "next";
import { checkTicket } from "../../lib/gasTickets";

type ApiResponse =
  | {
      ok: false;
      error: string;
    }
  | Record<string, unknown>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const ticket = String(req.query.ticket ?? "").trim();
  const storeId = String(req.query.storeId ?? "PV").trim();
  if (!ticket) {
    res.status(400).json({ ok: false, error: "ticket required" });
    return;
  }

  try {
    const data = await checkTicket(ticket, storeId);
    res.status(200).json(data as Record<string, unknown>);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(">>> Error en verificar-ticket (MySQL):", message);
    res.status(500).json({ ok: false, error: message });
  }
}
