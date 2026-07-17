"use client";

import { FormEvent, useState } from "react";

import type { ApiError, ShortenResponse } from "@/lib/types";

export function ShortenForm() {
  const [longUrl, setLongUrl] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [wasExisting, setWasExisting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = longUrl.trim();
    if (!trimmedUrl) {
      setError("Enter a URL to shorten.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          long_url: trimmedUrl,
          ...(expiresInDays ? { expires_in_days: Number(expiresInDays) } : {}),
        }),
      });

      const data = (await response.json()) as ShortenResponse | ApiError;

      if (!response.ok) {
        setError("detail" in data ? data.detail : "Something went wrong.");
        return;
      }

      setResult(data as ShortenResponse);
      setWasExisting(response.status === 200);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="long-url">Long URL</label>
          <input
            id="long-url"
            type="url"
            placeholder="https://example.com/a/very/long/path"
            value={longUrl}
            onChange={(event) => setLongUrl(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="expires-in-days">Expires in (days)</label>
          <input
            id="expires-in-days"
            type="number"
            min={1}
            max={3650}
            placeholder="Optional — leave blank to never expire"
            value={expiresInDays}
            onChange={(event) => setExpiresInDays(event.target.value)}
          />
          <span className="field-hint">Leave blank for a link that never expires.</span>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Shortening…" : "Shorten URL"}
        </button>
      </form>

      {result && (
        <div className="result-card">
          <div className="result-row">
            <a href={result.short_url} target="_blank" rel="noopener noreferrer" className="result-link">
              {result.short_url}
            </a>
            <button type="button" className="btn-secondary" onClick={handleCopy}>
              Copy
            </button>
            {copied && <span className="copy-confirm">Copied!</span>}
          </div>
          <p className="result-note">
            {wasExisting
              ? "This URL was already shortened — reusing the existing code."
              : "New short link created."}
          </p>
        </div>
      )}
    </div>
  );
}
