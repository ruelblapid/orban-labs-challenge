import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterForm } from "@App/Interfaces/Components/Auth/RegisterForm";
import { useRegisterViewModel } from "@App/Interfaces/ViewModels/Auth";

vi.mock("@App/Interfaces/ViewModels/Auth", () => ({
	useRegisterViewModel: vi.fn(),
}));

const mockedUseRegisterViewModel = vi.mocked(useRegisterViewModel);

function setup(overrides?: { isLoading?: boolean; errorMessage?: string | null }) {
	const onRegister = vi.fn().mockResolvedValue({ success: true });
	mockedUseRegisterViewModel.mockReturnValue({
		onRegister,
		isLoading: false,
		errorMessage: null,
		...overrides,
	});
	return { onRegister };
}

describe("RegisterForm", () => {
	beforeEach(() => {
		mockedUseRegisterViewModel.mockReset();
	});

	it("renders the form fields", () => {
		setup();
		render(<RegisterForm />);

		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
	});

	it("blocks submission and shows a validation error when the password is too short", async () => {
		const { onRegister } = setup();
		const user = userEvent.setup();
		render(<RegisterForm />);

		await user.type(screen.getByLabelText("Email"), "a@b.com");
		await user.type(screen.getByLabelText("Password"), "short1");
		await user.type(screen.getByLabelText("Confirm password"), "short1");
		await user.click(screen.getByRole("button", { name: /create account/i }));

		expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
		expect(onRegister).not.toHaveBeenCalled();
	});

	it("blocks submission and shows a validation error when passwords don't match", async () => {
		const { onRegister } = setup();
		const user = userEvent.setup();
		render(<RegisterForm />);

		await user.type(screen.getByLabelText("Email"), "a@b.com");
		await user.type(screen.getByLabelText("Password"), "password1");
		await user.type(screen.getByLabelText("Confirm password"), "password2");
		await user.click(screen.getByRole("button", { name: /create account/i }));

		expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
		expect(onRegister).not.toHaveBeenCalled();
	});

	it("submits the email and password once validation passes", async () => {
		const { onRegister } = setup();
		const user = userEvent.setup();
		render(<RegisterForm />);

		await user.type(screen.getByLabelText("Email"), "a@b.com");
		await user.type(screen.getByLabelText("Password"), "password1");
		await user.type(screen.getByLabelText("Confirm password"), "password1");
		await user.click(screen.getByRole("button", { name: /create account/i }));

		expect(onRegister).toHaveBeenCalledWith("a@b.com", "password1");
	});

	it("shows the view-model's error message when there is no local validation error", () => {
		setup({ errorMessage: "Email already registered" });
		render(<RegisterForm />);

		expect(screen.getByText("Email already registered")).toBeInTheDocument();
	});

	it("disables the submit button while loading", () => {
		setup({ isLoading: true });
		render(<RegisterForm />);

		expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
	});
});
