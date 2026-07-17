import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Request body must be valid JSON" }, { status: 400 });
  }

  let response: Response;
  try {
    response = await backendFetch("/api/shorten", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Could not reach the backend service";
    return NextResponse.json({ detail }, { status: 502 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
