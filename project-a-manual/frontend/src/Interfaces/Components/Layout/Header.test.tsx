import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "@App/Interfaces/Components/Layout/Header";
import { useAuthStore } from "@App/Interfaces/Store/Auth";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace }),
}));

describe("Header", () => {
	const initialState = useAuthStore.getInitialState();

	beforeEach(() => {
		replace.mockClear();
		useAuthStore.setState(initialState, true);
	});

	it("shows the signed-in user's email", () => {
		useAuthStore.setState({ email: "a@b.com" });
		render(<Header />);

		expect(screen.getByText("a@b.com")).toBeInTheDocument();
	});

	it("omits the email when signed out", () => {
		useAuthStore.setState({ email: null });
		render(<Header />);

		expect(screen.queryByText(/@/)).not.toBeInTheDocument();
	});

	it("logs out and redirects to /login when the logout button is clicked", async () => {
		useAuthStore.setState({
			email: "a@b.com",
			accessToken: "tok",
			expiresAt: Date.now() + 60_000,
		});
		const user = userEvent.setup();
		render(<Header />);

		await user.click(screen.getByRole("button", { name: /logout/i }));

		expect(useAuthStore.getState().accessToken).toBeNull();
		expect(replace).toHaveBeenCalledWith("/login");
	});
});
