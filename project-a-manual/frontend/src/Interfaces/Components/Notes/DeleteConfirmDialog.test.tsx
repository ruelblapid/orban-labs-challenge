import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteConfirmDialog } from "@App/Interfaces/Components/Notes/DeleteConfirmDialog";
import { Note } from "@App/Domains/Notes/Types";

const note: Note = {
	id: "1",
	title: "Grocery list",
	body: "Milk",
	tags: [],
	created_at: "2026-01-01T00:00:00Z",
	updated_at: "2026-01-01T00:00:00Z",
};

describe("DeleteConfirmDialog", () => {
	it("shows the note title in the confirmation message", () => {
		render(<DeleteConfirmDialog note={note} onClose={vi.fn()} onConfirm={vi.fn()} />);

		expect(screen.getByText("Grocery list")).toBeInTheDocument();
	});

	it("calls onClose without confirming when Cancel is clicked", async () => {
		const onClose = vi.fn();
		const onConfirm = vi.fn();
		const user = userEvent.setup();
		render(<DeleteConfirmDialog note={note} onClose={onClose} onConfirm={onConfirm} />);

		await user.click(screen.getByRole("button", { name: "Cancel" }));

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it("calls onConfirm with the note id and closes on success", async () => {
		const onClose = vi.fn();
		const onConfirm = vi.fn().mockResolvedValue(true);
		const user = userEvent.setup();
		render(<DeleteConfirmDialog note={note} onClose={onClose} onConfirm={onConfirm} />);

		await user.click(screen.getByRole("button", { name: "Delete" }));

		expect(onConfirm).toHaveBeenCalledWith("1");
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("stays open when the deletion fails", async () => {
		const onClose = vi.fn();
		const onConfirm = vi.fn().mockResolvedValue(false);
		const user = userEvent.setup();
		render(<DeleteConfirmDialog note={note} onClose={onClose} onConfirm={onConfirm} />);

		await user.click(screen.getByRole("button", { name: "Delete" }));

		expect(onConfirm).toHaveBeenCalledWith("1");
		expect(onClose).not.toHaveBeenCalled();
	});
});
