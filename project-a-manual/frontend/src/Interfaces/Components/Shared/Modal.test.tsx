import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Modal } from "@App/Interfaces/Components/Shared/Modal";

describe("Modal", () => {
	afterEach(() => {
		document.body.style.overflow = "";
	});

	it("renders the title, children, and footer", () => {
		render(
			<Modal title="My Modal" onClose={vi.fn()} footer={<button>Footer action</button>}>
				<p>Body content</p>
			</Modal>
		);

		expect(screen.getByRole("heading", { name: "My Modal" })).toBeInTheDocument();
		expect(screen.getByText("Body content")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Footer action" })).toBeInTheDocument();
	});

	it("omits the footer section when none is provided", () => {
		render(
			<Modal title="No footer" onClose={vi.fn()}>
				<p>Body</p>
			</Modal>
		);

		expect(screen.queryByRole("button", { name: /footer/i })).not.toBeInTheDocument();
	});

	it("calls onClose when the close button is clicked", async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();
		render(
			<Modal title="Closeable" onClose={onClose}>
				<p>Body</p>
			</Modal>
		);

		await user.click(screen.getByRole("button", { name: "Close" }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("calls onClose when the Escape key is pressed", async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();
		render(
			<Modal title="Closeable" onClose={onClose}>
				<p>Body</p>
			</Modal>
		);

		await user.keyboard("{Escape}");

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("locks body scroll while mounted and restores it on unmount", () => {
		const { unmount } = render(
			<Modal title="Scroll lock" onClose={vi.fn()}>
				<p>Body</p>
			</Modal>
		);

		expect(document.body.style.overflow).toBe("hidden");

		unmount();

		expect(document.body.style.overflow).toBe("");
	});
});
