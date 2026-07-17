import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNotesViewModel } from "@App/Interfaces/ViewModels/Notes";
import { useNotesStore } from "@App/Interfaces/Store/Notes";
import { useAuthStore } from "@App/Interfaces/Store/Auth";
import { Note } from "@App/Domains/Notes/Types";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push, replace }),
}));

vi.mock("@App/Interfaces/Store/Notes", () => ({
	useNotesStore: vi.fn(),
}));

vi.mock("@App/Interfaces/Store/Auth", () => ({
	useAuthStore: vi.fn(),
}));

const mockedUseNotesStore = vi.mocked(useNotesStore);
const mockedUseAuthStore = vi.mocked(useAuthStore);

function makeNote(overrides: Partial<Note>): Note {
	return {
		id: "1",
		title: "Title",
		body: "Body",
		tags: [],
		created_at: "2026-01-01T00:00:00Z",
		updated_at: "2026-01-01T00:00:00Z",
		...overrides,
	};
}

async function waitOutDebounce() {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 350));
	});
}

interface StoreOverrides {
	fetchList?: ReturnType<typeof vi.fn>;
	search?: ReturnType<typeof vi.fn>;
	create?: ReturnType<typeof vi.fn>;
	update?: ReturnType<typeof vi.fn>;
	remove?: ReturnType<typeof vi.fn>;
	isLoading?: boolean;
	logout?: ReturnType<typeof vi.fn>;
}

function setupStores({
	fetchList = vi.fn().mockResolvedValue({ ok: true, data: [] }),
	search = vi.fn().mockResolvedValue({ ok: true, data: [] }),
	create = vi.fn(),
	update = vi.fn(),
	remove = vi.fn(),
	isLoading = false,
	logout = vi.fn(),
}: StoreOverrides) {
	mockedUseNotesStore.mockReturnValue({
		fetchList,
		search,
		create,
		update,
		remove,
		isLoading,
	} as unknown as ReturnType<typeof useNotesStore>);

	mockedUseAuthStore.mockImplementation(((selector: (s: { logout: typeof logout }) => unknown) =>
		selector({ logout })) as typeof useAuthStore);

	return { fetchList, search, create, update, remove, logout };
}

describe("useNotesViewModel", () => {
	beforeEach(() => {
		push.mockClear();
		replace.mockClear();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("loads the first page and available tags on mount", async () => {
		const notes = [makeNote({ id: "1", tags: ["work"] }), makeNote({ id: "2", tags: ["home", "work"] })];
		const fetchList = vi.fn().mockImplementation(async (limit?: number) => {
			if (limit === 500) return { ok: true, data: notes };
			return { ok: true, data: notes, links: { total: 2 } };
		});
		setupStores({ fetchList });

		const { result } = renderHook(() => useNotesViewModel());

		await waitFor(() => expect(result.current.notes).toEqual(notes));
		expect(result.current.totalCount).toBe(2);
		expect(result.current.availableTags).toEqual(["home", "work"]);
		expect(result.current.errorMessage).toBeNull();
	});

	it("logs out and redirects when the initial page load returns a 401", async () => {
		const fetchList = vi.fn().mockResolvedValue({ ok: false, error: "Expired", status: 401 });
		const { logout } = setupStores({ fetchList });

		renderHook(() => useNotesViewModel());

		await waitFor(() => expect(logout).toHaveBeenCalled());
		expect(replace).toHaveBeenCalledWith("/login?reason=expired");
	});

	it("debounces filter changes into a search() call instead of fetching immediately", async () => {
		const filtered = [makeNote({ id: "3", title: "Filtered" })];
		const fetchList = vi.fn().mockResolvedValue({ ok: true, data: [], links: { total: 0 } });
		const search = vi.fn().mockResolvedValue({ ok: true, data: filtered });
		setupStores({ fetchList, search });

		const { result } = renderHook(() => useNotesViewModel());
		await waitFor(() => expect(fetchList).toHaveBeenCalled());

		act(() => {
			result.current.setSearchKeyword("foo");
		});
		expect(search).not.toHaveBeenCalled();

		await waitOutDebounce();

		expect(search).toHaveBeenCalledWith({ tag: undefined, keyword: "foo" });
		await waitFor(() => expect(result.current.notes).toEqual(filtered));
		expect(result.current.totalCount).toBe(1);
	});

	it("resets to page 1 and slices filtered results client-side by page size", async () => {
		const filtered = [
			makeNote({ id: "a" }),
			makeNote({ id: "b" }),
			makeNote({ id: "c" }),
		];
		const fetchList = vi.fn().mockResolvedValue({ ok: true, data: [], links: { total: 0 } });
		const search = vi.fn().mockResolvedValue({ ok: true, data: filtered });
		setupStores({ fetchList, search });

		const { result } = renderHook(() => useNotesViewModel());
		await waitFor(() => expect(fetchList).toHaveBeenCalled());

		act(() => {
			result.current.setSelectedTag("work");
		});
		await waitOutDebounce();
		await waitFor(() => expect(result.current.totalCount).toBe(3));

		act(() => {
			result.current.setPageSize(2);
		});
		await waitOutDebounce();
		await waitFor(() => expect(result.current.notes).toEqual(filtered.slice(0, 2)));
		expect(result.current.totalPages).toBe(2);

		act(() => {
			result.current.goToPage(2);
		});
		await waitOutDebounce();
		await waitFor(() => expect(result.current.notes).toEqual(filtered.slice(2, 4)));
	});

	it("clamps goToPage within [1, totalPages]", async () => {
		const notes = [makeNote({ id: "1" })];
		const fetchList = vi.fn().mockResolvedValue({ ok: true, data: notes, links: { total: 1 } });
		setupStores({ fetchList });

		const { result } = renderHook(() => useNotesViewModel());
		await waitFor(() => expect(result.current.notes).toEqual(notes));
		expect(result.current.totalPages).toBe(1);

		act(() => result.current.goToPage(99));
		expect(result.current.currentPage).toBe(1);

		act(() => result.current.goToPage(0));
		expect(result.current.currentPage).toBe(1);
	});

	describe("onCreateNote", () => {
		it("reloads the list and returns success", async () => {
			const notes = [makeNote({ id: "1" })];
			const fetchList = vi.fn().mockResolvedValue({ ok: true, data: notes, links: { total: 1 } });
			const create = vi.fn().mockResolvedValue({ ok: true, data: makeNote({ id: "2" }) });
			setupStores({ fetchList, create });

			const { result } = renderHook(() => useNotesViewModel());
			await waitFor(() => expect(result.current.notes).toEqual(notes));
			const callsBeforeCreate = fetchList.mock.calls.length;

			let outcome;
			await act(async () => {
				outcome = await result.current.onCreateNote({ title: "New", body: "", tags: [] });
			});

			expect(create).toHaveBeenCalledWith({ title: "New", body: "", tags: [] });
			expect(outcome).toEqual({ success: true });
			expect(fetchList.mock.calls.length).toBeGreaterThan(callsBeforeCreate);
		});

		it("sets errorMessage on a non-401 failure without logging out", async () => {
			const fetchList = vi.fn().mockResolvedValue({ ok: true, data: [], links: { total: 0 } });
			const create = vi.fn().mockResolvedValue({ ok: false, error: "Title is required", status: 422 });
			const { logout } = setupStores({ fetchList, create });

			const { result } = renderHook(() => useNotesViewModel());
			await waitFor(() => expect(fetchList).toHaveBeenCalled());

			await act(async () => {
				await result.current.onCreateNote({ title: "", body: "", tags: [] });
			});

			expect(result.current.errorMessage).toBe("Title is required");
			expect(logout).not.toHaveBeenCalled();
		});

		it("logs out and redirects on a 401 without setting errorMessage", async () => {
			const fetchList = vi.fn().mockResolvedValue({ ok: true, data: [], links: { total: 0 } });
			const create = vi.fn().mockResolvedValue({ ok: false, error: "Expired", status: 401 });
			const { logout } = setupStores({ fetchList, create });

			const { result } = renderHook(() => useNotesViewModel());
			await waitFor(() => expect(fetchList).toHaveBeenCalled());

			await act(async () => {
				await result.current.onCreateNote({ title: "New", body: "", tags: [] });
			});

			expect(logout).toHaveBeenCalled();
			expect(replace).toHaveBeenCalledWith("/login?reason=expired");
			expect(result.current.errorMessage).toBeNull();
		});
	});

	describe("onDeleteNote", () => {
		it("reloads the list and returns true on success", async () => {
			const notes = [makeNote({ id: "1" })];
			const fetchList = vi.fn().mockResolvedValue({ ok: true, data: notes, links: { total: 1 } });
			const remove = vi.fn().mockResolvedValue({ ok: true, data: undefined });
			setupStores({ fetchList, remove });

			const { result } = renderHook(() => useNotesViewModel());
			await waitFor(() => expect(result.current.notes).toEqual(notes));

			let outcome;
			await act(async () => {
				outcome = await result.current.onDeleteNote("1");
			});

			expect(remove).toHaveBeenCalledWith("1");
			expect(outcome).toBe(true);
		});

		it("returns false and sets errorMessage on failure", async () => {
			const fetchList = vi.fn().mockResolvedValue({ ok: true, data: [], links: { total: 0 } });
			const remove = vi.fn().mockResolvedValue({ ok: false, error: "Not found", status: 404 });
			setupStores({ fetchList, remove });

			const { result } = renderHook(() => useNotesViewModel());
			await waitFor(() => expect(fetchList).toHaveBeenCalled());

			let outcome;
			await act(async () => {
				outcome = await result.current.onDeleteNote("1");
			});

			expect(outcome).toBe(false);
			expect(result.current.errorMessage).toBe("Not found");
		});
	});
});
