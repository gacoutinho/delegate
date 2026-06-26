import { NextResponse } from "next/server";
import { loadAreas, loadAgents, toSummary } from "@/lib/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const areas = loadAreas();
  const agents = loadAgents().map(toSummary);
  return NextResponse.json({ areas, agents });
}
