import { afterEach, describe, expect, it, vi } from "vitest";

import { useNotesStore } from "@App/Interfaces/Store/Notes";
import { isApiOk } from "@App/Interfaces/Store/Types";

function jsonResponse(status: number, body: unknown) {
	return {
		status,
		ok: status >= 200 && status < 300,
		json: async () => body,
	} as Response;
}

const note = {
	id: "1",
	title: "Title",
	body: "Body",
	tags: ["work"],
	created_at: "2026-01-01T00:00:00Z",
	updated_at: "2026-01-01T00:00:00Z",
};

describe("useNotesStore", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		useNotesStore.setState({ isLoading: false });
	});

	it("fetchList requests the given limit/offset and toggles isLoading", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: [note], links: { total: 1 } }));
		vi.stubGlobal("fetch", fetchMock);

		const promise = useNotesStore.getState().fetchList(25, 50);
		expect(useNotesStore.getState().isLoading).toBe(true);

		const result = await promise;

		expect(useNotesStore.getState().isLoading).toBe(false);
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("/notes?limit=25&offset=50"),
			expect.anything()
		);
		expect(isApiOk(result) && result.data).toEqual([note]);
	});

	it("fetchList defaults to limit=100 offset=0", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: [] }));
		vi.stubGlobal("fetch", fetchMock);

		await useNotesStore.getState().fetchList();

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("/notes?limit=100&offset=0"),
			expect.anything()
		);
	});

	it("search only includes provided tag/keyword params", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: [note] }));
		vi.stubGlobal("fetch", fetchMock);

		await useNotesStore.getState().search({ tag: "work" });

		const url = fetchMock.mock.calls[0][0] as string;
		expect(url).toContain("/notes/search?tag=work");
		expect(url).not.toContain("keyword");
	});

	it("getById fetches a single note without touching isLoading", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: note }));
		vi.stubGlobal("fetch", fetchMock);

		const result = await useNotesStore.getState().getById("1");

		expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/notes/1"), expect.anything());
		expect(isApiOk(result) && result.data).toEqual(note);
	});

	it("create POSTs the payload", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { data: note }));
		vi.stubGlobal("fetch", fetchMock);

		const payload = { title: "Title", body: "Body", tags: ["work"] };
		const result = await useNotesStore.getState().create(payload);

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toContain("/notes");
		expect(init.method).toBe("POST");
		expect(JSON.parse(init.body)).toEqual(payload);
		expect(isApiOk(result) && result.data).toEqual(note);
	});

	it("update PUTs the payload to the note id", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { data: note }));
		vi.stubGlobal("fetch", fetchMock);

		await useNotesStore.getState().update("1", { title: "New title" });

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toContain("/notes/1");
		expect(init.method).toBe("PUT");
		expect(JSON.parse(init.body)).toEqual({ title: "New title" });
	});

	it("remove DELETEs the note id", async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse(204, {}));
		vi.stubGlobal("fetch", fetchMock);

		const result = await useNotesStore.getState().remove("1");

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toContain("/notes/1");
		expect(init.method).toBe("DELETE");
		expect(isApiOk(result)).toBe(true);
	});

	it("propagates a failed request as ok:false", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			jsonResponse(500, { error: { message: "Server error" } })
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await useNotesStore.getState().fetchList();

		expect(useNotesStore.getState().isLoading).toBe(false);
		expect(result).toEqual({ ok: false, error: "Server error", status: 500 });
	});
});
