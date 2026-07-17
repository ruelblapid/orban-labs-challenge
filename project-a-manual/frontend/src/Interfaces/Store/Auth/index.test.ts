import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@App/Interfaces/Store/Auth";

function jsonResponse(status: number, body: unknown) {
	return {
		status,
		ok: status >= 200 && status < 300,
		json: async () => body,
	} as Response;
}

describe("useAuthStore", () => {
	const initialState = useAuthStore.getInitialState();

	beforeEach(() => {
		window.sessionStorage.clear();
		useAuthStore.setState(initialState, true);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("login", () => {
		it("stores the token and clears loading/error on success", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue(
					jsonResponse(200, {
						data: {
							access_token: "abc123",
							token_type: "bearer",
							expires_in: 3600,
						},
					})
				)
			);

			const before = Date.now();
			const result = await useAuthStore.getState().login("a@b.com", "pw");
			const after = Date.now();

			expect(result).toEqual({ success: true });

			const state = useAuthStore.getState();
			expect(state.accessToken).toBe("abc123");
			expect(state.tokenType).toBe("bearer");
			expect(state.email).toBe("a@b.com");
			expect(state.isLoading).toBe(false);
			expect(state.errorMessage).toBeNull();
			expect(state.expiresAt).toBeGreaterThanOrEqual(before + 3600 * 1000);
			expect(state.expiresAt).toBeLessThanOrEqual(after + 3600 * 1000);
		});

		it("surfaces the API error and leaves session empty on failure", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue(
					jsonResponse(401, { error: { message: "Invalid credentials" } })
				)
			);

			const result = await useAuthStore.getState().login("a@b.com", "wrong");

			expect(result).toEqual({ success: false, error: "Invalid credentials" });

			const state = useAuthStore.getState();
			expect(state.accessToken).toBeNull();
			expect(state.isLoading).toBe(false);
			expect(state.errorMessage).toBe("Invalid credentials");
		});
	});

	describe("register", () => {
		it("returns the created user on success", async () => {
			const user = { id: "1", email: "a@b.com", created_at: "2026-01-01T00:00:00Z" };
			vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(201, { data: user })));

			const result = await useAuthStore.getState().register("a@b.com", "pw");

			expect(result).toEqual({ success: true, data: user });
			expect(useAuthStore.getState().errorMessage).toBeNull();
		});

		it("surfaces the API error on failure", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue(jsonResponse(409, { error: { message: "Email taken" } }))
			);

			const result = await useAuthStore.getState().register("a@b.com", "pw");

			expect(result).toEqual({ success: false, error: "Email taken" });
			expect(useAuthStore.getState().errorMessage).toBe("Email taken");
		});
	});

	describe("logout", () => {
		it("clears the session", () => {
			useAuthStore.setState({
				accessToken: "abc123",
				tokenType: "bearer",
				expiresAt: Date.now() + 1000,
				email: "a@b.com",
				errorMessage: "stale error",
			});

			useAuthStore.getState().logout();

			const state = useAuthStore.getState();
			expect(state.accessToken).toBeNull();
			expect(state.tokenType).toBeNull();
			expect(state.expiresAt).toBeNull();
			expect(state.email).toBeNull();
			expect(state.errorMessage).toBeNull();
		});
	});

	describe("isSessionValid", () => {
		it("is false when there is no token", () => {
			expect(useAuthStore.getState().isSessionValid()).toBe(false);
		});

		it("is false when the token is expired", () => {
			useAuthStore.setState({ accessToken: "abc123", expiresAt: Date.now() - 1000 });
			expect(useAuthStore.getState().isSessionValid()).toBe(false);
		});

		it("is true when the token has not expired", () => {
			useAuthStore.setState({ accessToken: "abc123", expiresAt: Date.now() + 60_000 });
			expect(useAuthStore.getState().isSessionValid()).toBe(true);
		});
	});
});
