import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";

vi.mock("@App/Interfaces/ViewModels/Auth", () => ({
	useLoginViewModel: vi.fn(() => ({ onLogin: vi.fn(), isLoading: false, errorMessage: null })),
}));

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
	useSearchParams: () => searchParams,
}));

describe("LoginPage", () => {
	it("shows no info message and an empty email by default", () => {
		searchParams = new URLSearchParams();
		render(<LoginPage />);

		expect(screen.getByLabelText("Email")).toHaveValue("");
		expect(
			screen.queryByText(/account created|session expired/i)
		).not.toBeInTheDocument();
	});

	it("pre-fills the email and shows a confirmation message after registering", () => {
		searchParams = new URLSearchParams({ registered: "1", email: "a@b.com" });
		render(<LoginPage />);

		expect(screen.getByLabelText("Email")).toHaveValue("a@b.com");
		expect(screen.getByText("Account created. Sign in to continue.")).toBeInTheDocument();
	});

	it("shows a session-expired message when reason=expired", () => {
		searchParams = new URLSearchParams({ reason: "expired" });
		render(<LoginPage />);

		expect(screen.getByText("Your session expired. Please sign in again.")).toBeInTheDocument();
	});

	it("prefers the registration message over the expired-session message", () => {
		searchParams = new URLSearchParams({ registered: "1", reason: "expired" });
		render(<LoginPage />);

		expect(screen.getByText("Account created. Sign in to continue.")).toBeInTheDocument();
	});
});
