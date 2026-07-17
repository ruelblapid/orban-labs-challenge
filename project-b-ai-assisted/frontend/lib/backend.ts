import "server-only";

/**
 * Server-only fetch wrapper for the FastAPI backend. Attaches the API key
 * here (never in a client component) so it never ships to the browser —
 * the two route handlers under app/api/ are the only callers.
 */
export function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const baseUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
  const apiKey = process.env.BACKEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "BACKEND_API_KEY is not set. Copy .env.example to .env.local and set it to the same value as the backend's API_KEY."
    );
  }

  const headers = new Headers(init.headers);
  headers.set("X-API-Key", apiKey);
  headers.set("Content-Type", "application/json");

  return fetch(`${baseUrl}${path}`, { ...init, headers, cache: "no-store" });
}
