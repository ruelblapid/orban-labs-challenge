"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { ApiError, UrlStats } from "@/lib/types";

function formatDate(value: string | null): string {
  if (!value) return "Never";
  // Backend timestamps are UTC, formatted as "YYYY-MM-DD HH:MM:SS" with no
  // offset marker — append one so Date parses it as UTC instead of local time.
  const parsed = new Date(`${value.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

const SKELETON_ROWS = 3;

export function UrlsTable() {
  const [data, setData] = useState<UrlStats[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bumped by the refresh button to re-run the effect below. Kept as a
  // dependency rather than an extracted callback so there is a single fetch
  // implementation, run from the effect the same way on mount and refresh.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/urls", { cache: "no-store" });
        const body = (await response.json()) as UrlStats[] | ApiError;
        if (!response.ok) {
          throw new Error("detail" in body ? body.detail : "Could not load URLs.");
        }
        setData(body as UrlStats[]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load URLs.");
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  function handleRefresh() {
    setLoading(true);
    setRefreshKey((key) => key + 1);
  }

  return (
    <div>
      <div className="dashboard-toolbar">
        <span className="page-subtitle" style={{ marginBottom: 0 }}>
          {data ? `${data.length} short URL${data.length === 1 ? "" : "s"}` : ""}
        </span>
        <button type="button" className="btn-secondary" onClick={handleRefresh} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Short code</th>
                <th>Long URL</th>
                <th>Clicks</th>
                <th>Created</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td>
                    <span className="skeleton-block" />
                  </td>
                  <td>
                    <span className="skeleton-block" />
                  </td>
                  <td>
                    <span className="skeleton-block" />
                  </td>
                  <td>
                    <span className="skeleton-block" />
                  </td>
                  <td>
                    <span className="skeleton-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && data && data.length === 0 && (
        <div className="empty-state">
          No URLs created yet. <Link href="/">Shorten your first one</Link>.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Short code</th>
                <th>Long URL</th>
                <th>Clicks</th>
                <th>Created</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.short_code}>
                  <td>
                    <a href={row.short_url} target="_blank" rel="noopener noreferrer">
                      {row.short_code}
                    </a>
                  </td>
                  <td className="truncate" title={row.long_url}>
                    {row.long_url}
                  </td>
                  <td>{row.clicks}</td>
                  <td>{formatDate(row.created_at)}</td>
                  <td>{formatDate(row.expires_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
