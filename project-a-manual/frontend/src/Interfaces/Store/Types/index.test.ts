import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch, isApiOk } from "@App/Interfaces/Store/Types";
import { useAuthStore } from "@App/Interfaces/Store/Auth";

function jsonResponse(status: number, body: unknown) {
	return {
		status,
		ok: status >= 200 && status < 300,
		json: async () => body,
	} as Response;
}

describe("apiFetch", () => {
	const initialState = useAuthStore.getInitialState();

	beforeEach(() => {
		useAuthStore.setState(initialState, true);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("attaches the bearer token from the auth store when present", async () => {
		useAuthStore.setState({ accessToken: "tok-123" });
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: "ok" }));
		vi.stubGlobal("fetch", fetchMock);

		await apiFetch("/notes");

		const headers = fetchMock.mock.calls[0][1].headers as Headers;
		expect(headers.get("Authorization")).toBe("Bearer tok-123");
	});

	it("does not attach a token when unauthenticated", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: "ok" }));
		vi.stubGlobal("fetch", fetchMock);

		await apiFetch("/notes");

		const headers = fetchMock.mock.calls[0][1].headers as Headers;
		expect(headers.has("Authorization")).toBe(false);
	});

	it("sets Content-Type: application/json when a body is present and not already set", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: "ok" }));
		vi.stubGlobal("fetch", fetchMock);

		await apiFetch("/notes", { method: "POST", body: JSON.stringify({ a: 1 }) });

		const headers = fetchMock.mock.calls[0][1].headers as Headers;
		expect(headers.get("Content-Type")).toBe("application/json");
	});

	it("respects an explicitly provided Content-Type", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: "ok" }));
		vi.stubGlobal("fetch", fetchMock);

		await apiFetch("/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: "a=1",
		});

		const headers = fetchMock.mock.calls[0][1].headers as Headers;
		expect(headers.get("Content-Type")).toBe("application/x-www-form-urlencoded");
	});

	it("returns ok:true with undefined data on a 204 response", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(204, {}));
		vi.stubGlobal("fetch", fetchMock);

		const result = await apiFetch("/notes/1", { method: "DELETE" });

		expect(result).toEqual({ ok: true, data: undefined });
	});

	it("returns data and links on success", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			jsonResponse(200, { data: [{ id: "1" }], links: { total: 1 } })
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await apiFetch("/notes");

		expect(result).toEqual({ ok: true, data: [{ id: "1" }], links: { total: 1 } });
	});

	it("maps a non-ok response to ok:false with the API error message", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			jsonResponse(422, { error: { message: "Title is required" } })
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await apiFetch("/notes", { method: "POST", body: "{}" });

		expect(isApiOk(result)).toBe(false);
		expect(result).toEqual({ ok: false, error: "Title is required", status: 422 });
	});

	it("falls back to a generic message when the error body has no message", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(500, {}));
		vi.stubGlobal("fetch", fetchMock);

		const result = await apiFetch("/notes");

		expect(result).toEqual({ ok: false, error: "Request failed (HTTP 500)", status: 500 });
	});

	it("treats success:false in the body as a failure even on an ok HTTP status", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			jsonResponse(200, { success: false, error: { message: "Rejected" } })
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await apiFetch("/notes");

		expect(result).toEqual({ ok: false, error: "Rejected", status: 200 });
	});

	it("returns ok:false with the error message when fetch throws", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

		const result = await apiFetch("/notes");

		expect(result).toEqual({ ok: false, error: "network down" });
	});

	it("returns a generic message when a non-Error is thrown", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue("boom"));

		const result = await apiFetch("/notes");

		expect(result).toEqual({ ok: false, error: "Network error. Please try again." });
	});
});
