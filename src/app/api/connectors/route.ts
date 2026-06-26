import { NextResponse } from "next/server";
import { listConnectors, updateConnector } from "@/lib/connectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ connectors: listConnectors() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    id?: string;
    enabled?: boolean;
    url?: string;
    token?: string;
  };
  if (!body.id) {
    return NextResponse.json({ error: "Missing connector id." }, { status: 400 });
  }
  try {
    const connectors = updateConnector(body.id, {
      enabled: body.enabled,
      url: body.url,
      token: body.token,
    });
    return NextResponse.json({ connectors });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }
}
