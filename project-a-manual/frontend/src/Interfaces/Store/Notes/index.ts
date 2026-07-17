import { create } from 'zustand';
import { Note, NoteCreatePayload, NoteUpdatePayload } from '@App/Domains/Notes/Types';
import { apiFetch, ApiResult } from '../Types';

interface NotesState {
	isLoading: boolean;
	fetchList(limit?: number, offset?: number): Promise<ApiResult<Note[]>>;
	search(params: { tag?: string; keyword?: string }): Promise<ApiResult<Note[]>>;
	getById(noteId: string): Promise<ApiResult<Note>>;
	create(payload: NoteCreatePayload): Promise<ApiResult<Note>>;
	update(noteId: string, payload: NoteUpdatePayload): Promise<ApiResult<Note>>;
	remove(noteId: string): Promise<ApiResult<undefined>>;
}

export const useNotesStore = create<NotesState>((set) => ({
	isLoading: false,

	async fetchList(limit = 100, offset = 0) {
		set({ isLoading: true });
		const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
		const result = await apiFetch<Note[]>(`/notes?${params}`);
		set({ isLoading: false });
		return result;
	},

	async search({ tag, keyword }) {
		set({ isLoading: true });
		const params = new URLSearchParams();
		if (tag) params.set('tag', tag);
		if (keyword) params.set('keyword', keyword);
		const result = await apiFetch<Note[]>(`/notes/search?${params}`);
		set({ isLoading: false });
		return result;
	},

	async getById(noteId) {
		return apiFetch<Note>(`/notes/${noteId}`);
	},

	async create(payload) {
		return apiFetch<Note>('/notes', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	},

	async update(noteId, payload) {
		return apiFetch<Note>(`/notes/${noteId}`, {
			method: 'PUT',
			body: JSON.stringify(payload),
		});
	},

	async remove(noteId) {
		return apiFetch<undefined>(`/notes/${noteId}`, { method: 'DELETE' });
	},
}));
