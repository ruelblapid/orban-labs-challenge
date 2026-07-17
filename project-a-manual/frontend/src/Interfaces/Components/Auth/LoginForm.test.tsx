import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@App/Interfaces/Components/Auth/LoginForm";
import { useLoginViewModel } from "@App/Interfaces/ViewModels/Auth";

vi.mock("@App/Interfaces/ViewModels/Auth", () => ({
	useLoginViewModel: vi.fn(),
}));

const mockedUseLoginViewModel = vi.mocked(useLoginViewModel);

function setup(overrides?: { isLoading?: boolean; errorMessage?: string | null }) {
	const onLogin = vi.fn().mockResolvedValue({ success: true });
	mockedUseLoginViewModel.mockReturnValue({
		onLogin,
		isLoading: false,
		errorMessage: null,
		...overrides,
	});
	return { onLogin };
}

describe("LoginForm", () => {
	beforeEach(() => {
		mockedUseLoginViewModel.mockReset();
	});

	it("renders the form fields and a link to register", () => {
		setup();
		render(<LoginForm />);

		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute("href", "/register");
	});

	it("pre-fills the email field with initialEmail", () => {
		setup();
		render(<LoginForm initialEmail="a@b.com" />);

		expect(screen.getByLabelText("Email")).toHaveValue("a@b.com");
	});

	it("shows the infoMessage banner when provided", () => {
		setup();
		render(<LoginForm infoMessage="Account created. Sign in to continue." />);

		expect(screen.getByText("Account created. Sign in to continue.")).toBeInTheDocument();
	});

	it("submits the entered email and password", async () => {
		const { onLogin } = setup();
		const user = userEvent.setup();
		render(<LoginForm />);

		await user.type(screen.getByLabelText("Email"), "a@b.com");
		await user.type(screen.getByLabelText("Password"), "pw");
		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(onLogin).toHaveBeenCalledWith("a@b.com", "pw");
	});

	it("shows the view-model's error message", () => {
		setup({ errorMessage: "Invalid credentials" });
		render(<LoginForm />);

		expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
	});

	it("disables the submit button while loading", () => {
		setup({ isLoading: true });
		render(<LoginForm />);

		expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
	});
});
