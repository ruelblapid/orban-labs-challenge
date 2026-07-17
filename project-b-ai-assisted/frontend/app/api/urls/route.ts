import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

export async function GET() {
  let response: Response;
  try {
    response = await backendFetch("/api/urls", { method: "GET" });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Could not reach the backend service";
    return NextResponse.json({ detail }, { status: 502 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
