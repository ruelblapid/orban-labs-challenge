import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import NotesLayout from "@/app/notes/layout";
import { useSessionGuard } from "@App/Interfaces/Hooks/useSessionGuard";

vi.mock("@App/Interfaces/Hooks/useSessionGuard", () => ({
	useSessionGuard: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@App/Interfaces/Store/Auth", () => ({
	useAuthStore: (selector: (s: { email: string | null; logout: () => void }) => unknown) =>
		selector({ email: "a@b.com", logout: vi.fn() }),
}));

const mockedUseSessionGuard = vi.mocked(useSessionGuard);

describe("NotesLayout", () => {
	it("shows a loading spinner instead of children while the session guard is not ready", () => {
		mockedUseSessionGuard.mockReturnValue({ isReady: false });

		render(
			<NotesLayout>
				<div>Protected content</div>
			</NotesLayout>
		);

		expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
	});

	it("renders the header and children once the session guard is ready", () => {
		mockedUseSessionGuard.mockReturnValue({ isReady: true });

		render(
			<NotesLayout>
				<div>Protected content</div>
			</NotesLayout>
		);

		expect(screen.getByText("Protected content")).toBeInTheDocument();
		expect(screen.getByText("a@b.com")).toBeInTheDocument();
	});
});
