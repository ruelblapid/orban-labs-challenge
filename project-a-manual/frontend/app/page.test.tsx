import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";
import { useAuthStore } from "@App/Interfaces/Store/Auth";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace }),
}));

describe("HomePage", () => {
	const initialState = useAuthStore.getInitialState();

	beforeEach(() => {
		replace.mockClear();
		useAuthStore.setState(initialState, true);
	});

	it("does not redirect before hydration completes", () => {
		useAuthStore.setState({ hasHydrated: false });

		render(<HomePage />);

		expect(replace).not.toHaveBeenCalled();
	});

	it("redirects to /notes once hydrated with a valid session", () => {
		useAuthStore.setState({
			hasHydrated: true,
			accessToken: "tok",
			expiresAt: Date.now() + 60_000,
		});

		render(<HomePage />);

		expect(replace).toHaveBeenCalledWith("/notes");
	});

	it("redirects to /login once hydrated without a valid session", () => {
		useAuthStore.setState({ hasHydrated: true, accessToken: null, expiresAt: null });

		render(<HomePage />);

		expect(replace).toHaveBeenCalledWith("/login");
	});
});
