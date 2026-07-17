import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NoteCard } from "@App/Interfaces/Components/Notes/NoteCard";
import { Note } from "@App/Domains/Notes/Types";

const note: Note = {
	id: "1",
	title: "Grocery list",
	body: "Milk\nEggs",
	tags: ["home", "errands"],
	created_at: "2026-01-01T00:00:00Z",
	updated_at: "2026-01-02T00:00:00Z",
};

describe("NoteCard", () => {
	it("renders the title, body, and tags", () => {
		render(<NoteCard note={note} onEdit={vi.fn()} onDelete={vi.fn()} />);

		expect(screen.getByText("Grocery list")).toBeInTheDocument();
		expect(screen.getByText(/Milk/)).toBeInTheDocument();
		expect(screen.getByText("home")).toBeInTheDocument();
		expect(screen.getByText("errands")).toBeInTheDocument();
	});

	it("omits the tags section when there are no tags", () => {
		render(<NoteCard note={{ ...note, tags: [] }} onEdit={vi.fn()} onDelete={vi.fn()} />);

		expect(screen.queryByText("home")).not.toBeInTheDocument();
	});

	it("calls onEdit with the note when the edit button is clicked", async () => {
		const onEdit = vi.fn();
		const user = userEvent.setup();
		render(<NoteCard note={note} onEdit={onEdit} onDelete={vi.fn()} />);

		await user.click(screen.getByRole("button", { name: "Edit Grocery list" }));

		expect(onEdit).toHaveBeenCalledWith(note);
	});

	it("calls onDelete with the note when the delete button is clicked", async () => {
		const onDelete = vi.fn();
		const user = userEvent.setup();
		render(<NoteCard note={note} onEdit={vi.fn()} onDelete={onDelete} />);

		await user.click(screen.getByRole("button", { name: "Delete Grocery list" }));

		expect(onDelete).toHaveBeenCalledWith(note);
	});
});
