import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotesPageClient } from "@App/Interfaces/Components/Notes/NotesPageClient";
import { useNotesViewModel } from "@App/Interfaces/ViewModels/Notes";
import { Note } from "@App/Domains/Notes/Types";

vi.mock("@App/Interfaces/ViewModels/Notes", () => ({
	useNotesViewModel: vi.fn(),
}));

const mockedUseNotesViewModel = vi.mocked(useNotesViewModel);

const notes: Note[] = [
	{
		id: "1",
		title: "First note",
		body: "Body one",
		tags: ["work"],
		created_at: "2026-01-01T00:00:00Z",
		updated_at: "2026-01-01T00:00:00Z",
	},
	{
		id: "2",
		title: "Second note",
		body: "Body two",
		tags: [],
		created_at: "2026-01-02T00:00:00Z",
		updated_at: "2026-01-02T00:00:00Z",
	},
];

function setup(overrides?: Partial<ReturnType<typeof useNotesViewModel>>) {
	const base: ReturnType<typeof useNotesViewModel> = {
		notes: [],
		isLoading: false,
		errorMessage: null,
		searchKeyword: "",
		setSearchKeyword: vi.fn(),
		selectedTag: "",
		setSelectedTag: vi.fn(),
		availableTags: [],
		currentPage: 1,
		pageSize: 10,
		totalCount: 0,
		totalPages: 1,
		goToPage: vi.fn(),
		setPageSize: vi.fn(),
		onCreateNote: vi.fn().mockResolvedValue({ success: true }),
		onUpdateNote: vi.fn().mockResolvedValue({ success: true }),
		onDeleteNote: vi.fn().mockResolvedValue(true),
	};
	const vm = { ...base, ...overrides };
	mockedUseNotesViewModel.mockReturnValue(vm);
	return vm;
}

describe("NotesPageClient", () => {
	beforeEach(() => {
		mockedUseNotesViewModel.mockReset();
	});

	it("shows a loading state when loading with no notes yet", () => {
		setup({ isLoading: true, notes: [] });
		render(<NotesPageClient />);

		expect(screen.getByText(/loading notes/i)).toBeInTheDocument();
	});

	it("shows an empty state when there are no notes and not loading", () => {
		setup({ isLoading: false, notes: [] });
		render(<NotesPageClient />);

		expect(screen.getByText("No notes found.")).toBeInTheDocument();
	});

	it("renders a card per note and the total count", () => {
		setup({ notes, totalCount: 2 });
		render(<NotesPageClient />);

		expect(screen.getByText("First note")).toBeInTheDocument();
		expect(screen.getByText("Second note")).toBeInTheDocument();
		expect(screen.getByText("2 note(s)")).toBeInTheDocument();
	});

	it("shows the error banner when errorMessage is set", () => {
		setup({ errorMessage: "Something broke" });
		render(<NotesPageClient />);

		expect(screen.getByText("Something broke")).toBeInTheDocument();
	});

	it("hides pagination when totalCount is 0 and shows it otherwise", () => {
		setup({ notes: [], totalCount: 0 });
		const { rerender } = render(<NotesPageClient />);
		expect(screen.queryByText(/page 1 of/i)).not.toBeInTheDocument();

		setup({ notes, totalCount: 2 });
		rerender(<NotesPageClient />);
		expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
	});

	it("opens the create-note modal from the 'New note' button", async () => {
		setup();
		const user = userEvent.setup();
		render(<NotesPageClient />);

		await user.click(screen.getByRole("button", { name: /new note/i }));

		expect(screen.getByRole("heading", { name: "New note" })).toBeInTheDocument();
	});

	it("opens the edit-note modal pre-filled when a card's edit button is clicked", async () => {
		setup({ notes, totalCount: 2 });
		const user = userEvent.setup();
		render(<NotesPageClient />);

		await user.click(screen.getByRole("button", { name: "Edit First note" }));

		expect(screen.getByRole("heading", { name: "Edit note" })).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("First note");
	});

	it("opens the delete confirmation dialog when a card's delete button is clicked", async () => {
		setup({ notes, totalCount: 2 });
		const user = userEvent.setup();
		render(<NotesPageClient />);

		await user.click(screen.getByRole("button", { name: "Delete First note" }));

		expect(screen.getByRole("heading", { name: "Delete note" })).toBeInTheDocument();
	});
});
