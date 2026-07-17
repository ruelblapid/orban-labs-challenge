import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSessionGuard } from "@App/Interfaces/Hooks/useSessionGuard";
import { useAuthStore } from "@App/Interfaces/Store/Auth";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace }),
}));

describe("useSessionGuard", () => {
	const initialState = useAuthStore.getInitialState();

	beforeEach(() => {
		replace.mockClear();
		useAuthStore.setState(initialState, true);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("is not ready and takes no action before hydration completes", () => {
		useAuthStore.setState({ hasHydrated: false });

		const { result } = renderHook(() => useSessionGuard());

		expect(result.current.isReady).toBe(false);
		expect(replace).not.toHaveBeenCalled();
	});

	it("logs out and redirects to /login when hydrated with no valid session", () => {
		useAuthStore.setState({ hasHydrated: true, accessToken: null, expiresAt: null });

		const { result } = renderHook(() => useSessionGuard());

		expect(replace).toHaveBeenCalledWith("/login");
		expect(result.current.isReady).toBe(false);
	});

	it("logs out and redirects to /login when the stored session is already expired", () => {
		useAuthStore.setState({
			hasHydrated: true,
			accessToken: "stale",
			expiresAt: Date.now() - 1000,
		});

		renderHook(() => useSessionGuard());

		expect(replace).toHaveBeenCalledWith("/login");
		expect(useAuthStore.getState().accessToken).toBeNull();
	});

	it("is ready immediately when hydrated with a valid session", () => {
		useAuthStore.setState({
			hasHydrated: true,
			accessToken: "tok",
			expiresAt: Date.now() + 60_000,
		});

		const { result } = renderHook(() => useSessionGuard());

		expect(result.current.isReady).toBe(true);
		expect(replace).not.toHaveBeenCalled();
	});

	it("auto-logs-out and redirects with reason=expired once the token's remaining time elapses", () => {
		vi.useFakeTimers();
		useAuthStore.setState({
			hasHydrated: true,
			accessToken: "tok",
			expiresAt: Date.now() + 5000,
		});

		renderHook(() => useSessionGuard());
		expect(replace).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(replace).toHaveBeenCalledWith("/login?reason=expired");
		expect(useAuthStore.getState().accessToken).toBeNull();
	});
});
