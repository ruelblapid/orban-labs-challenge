import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useLoginViewModel, useRegisterViewModel } from "@App/Interfaces/ViewModels/Auth";
import { useAuthStore } from "@App/Interfaces/Store/Auth";

const push = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
}));

vi.mock("@App/Interfaces/Store/Auth", () => ({
	useAuthStore: vi.fn(),
}));

const mockedUseAuthStore = vi.mocked(useAuthStore);

function mockAuthStore(overrides: {
	login?: ReturnType<typeof vi.fn>;
	register?: ReturnType<typeof vi.fn>;
	isLoading?: boolean;
	errorMessage?: string | null;
}) {
	const state = {
		login: vi.fn(),
		register: vi.fn(),
		isLoading: false,
		errorMessage: null,
		...overrides,
	};
	mockedUseAuthStore.mockImplementation(((selector: (s: typeof state) => unknown) =>
		selector(state)) as typeof useAuthStore);
	return state;
}

describe("useLoginViewModel", () => {
	beforeEach(() => {
		push.mockClear();
	});

	it("navigates to /notes on successful login", async () => {
		const login = vi.fn().mockResolvedValue({ success: true });
		mockAuthStore({ login });

		const { result } = renderHook(() => useLoginViewModel());

		await act(async () => {
			await result.current.onLogin("a@b.com", "pw");
		});

		expect(login).toHaveBeenCalledWith("a@b.com", "pw");
		expect(push).toHaveBeenCalledWith("/notes");
	});

	it("does not navigate when login fails", async () => {
		const login = vi.fn().mockResolvedValue({ success: false, error: "bad creds" });
		mockAuthStore({ login });

		const { result } = renderHook(() => useLoginViewModel());

		let outcome;
		await act(async () => {
			outcome = await result.current.onLogin("a@b.com", "pw");
		});

		expect(outcome).toEqual({ success: false, error: "bad creds" });
		expect(push).not.toHaveBeenCalled();
	});

	it("exposes isLoading and errorMessage from the store", () => {
		mockAuthStore({ isLoading: true, errorMessage: "boom" });

		const { result } = renderHook(() => useLoginViewModel());

		expect(result.current.isLoading).toBe(true);
		expect(result.current.errorMessage).toBe("boom");
	});
});

describe("useRegisterViewModel", () => {
	beforeEach(() => {
		push.mockClear();
	});

	it("navigates to the login page with the registered email on success", async () => {
		const register = vi.fn().mockResolvedValue({ success: true });
		mockAuthStore({ register });

		const { result } = renderHook(() => useRegisterViewModel());

		await act(async () => {
			await result.current.onRegister("a+b@c.com", "pw");
		});

		expect(register).toHaveBeenCalledWith("a+b@c.com", "pw");
		expect(push).toHaveBeenCalledWith(
			"/login?registered=1&email=a%2Bb%40c.com"
		);
	});

	it("does not navigate when registration fails", async () => {
		const register = vi.fn().mockResolvedValue({ success: false, error: "taken" });
		mockAuthStore({ register });

		const { result } = renderHook(() => useRegisterViewModel());

		await act(async () => {
			await result.current.onRegister("a@b.com", "pw");
		});

		expect(push).not.toHaveBeenCalled();
	});
});
