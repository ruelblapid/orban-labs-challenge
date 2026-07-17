'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	Note,
	NoteCreatePayload,
	NoteUpdatePayload,
} from '@App/Domains/Notes/Types';
import { useAuthStore } from '@App/Interfaces/Store/Auth';
import { useNotesStore } from '@App/Interfaces/Store/Notes';
import { isApiOk } from '@App/Interfaces/Store/Types';

type ActionResult = { success: boolean; error?: string };

const TAG_OPTIONS_SAMPLE_SIZE = 500;

export function useNotesViewModel() {
	const router = useRouter();
	const { fetchList, search, create, update, remove, isLoading } =
		useNotesStore();
	const logout = useAuthStore((s) => s.logout);

	const [notes, setNotes] = useState<Note[]>([]);
	const [availableTags, setAvailableTags] = useState<string[]>([]);
	const [searchKeyword, setSearchKeywordState] = useState('');
	const [selectedTag, setSelectedTagState] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSizeState] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

	const handleUnauthorized = useCallback(
		(status?: number) => {
			if (status !== 401) return false;
			logout();
			router.replace('/login?reason=expired');
			return true;
		},
		[logout, router]
	);

	const fetchPage = useCallback(async (): Promise<
		| { ok: true; notes: Note[]; total: number }
		| { ok: false; error: string; status?: number }
	> => {
		const isFiltering = !!(selectedTag || searchKeyword);

		if (isFiltering) {
			const result = await search({
				tag: selectedTag || undefined,
				keyword: searchKeyword || undefined,
			});
			if (!isApiOk(result))
				return {
					ok: false,
					error: result.error,
					status: result.status,
				};
			const start = (currentPage - 1) * pageSize;
			return {
				ok: true,
				notes: result.data.slice(start, start + pageSize),
				total: result.data.length,
			};
		}

		const result = await fetchList(pageSize, (currentPage - 1) * pageSize);
		if (!isApiOk(result))
			return { ok: false, error: result.error, status: result.status };
		return {
			ok: true,
			notes: result.data,
			total: result.links?.total ?? result.data.length,
		};
	}, [selectedTag, searchKeyword, currentPage, pageSize, search, fetchList]);

	const fetchTagOptions = useCallback(async (): Promise<string[]> => {
		const result = await fetchList(TAG_OPTIONS_SAMPLE_SIZE, 0);
		if (!isApiOk(result)) return [];
		const tags = new Set<string>();
		for (const note of result.data) {
			for (const tag of note.tags) tags.add(tag);
		}
		return Array.from(tags).sort();
	}, [fetchList]);

	const isFirstRun = useRef(true);
	useEffect(() => {
		let cancelled = false;

		const run = async () => {
			const result = await fetchPage();
			if (cancelled) return;
			if (result.ok) {
				setNotes(result.notes);
				setTotalCount(result.total);
				setErrorMessage(null);
				return;
			}
			if (handleUnauthorized(result.status)) return;
			setErrorMessage(result.error);
		};

		if (isFirstRun.current) {
			isFirstRun.current = false;
			run();
			return () => {
				cancelled = true;
			};
		}

		const timeoutId = window.setTimeout(run, 300);
		return () => {
			cancelled = true;
			window.clearTimeout(timeoutId);
		};
	}, [fetchPage, handleUnauthorized]);

	useEffect(() => {
		let cancelled = false;
		fetchTagOptions().then((tags) => {
			if (!cancelled) setAvailableTags(tags);
		});
		return () => {
			cancelled = true;
		};
	}, [fetchTagOptions]);

	const reload = useCallback(async () => {
		const result = await fetchPage();
		if (!result.ok) {
			if (handleUnauthorized(result.status)) return;
			setErrorMessage(result.error);
			return;
		}

		if (result.notes.length === 0 && currentPage > 1) {
			setCurrentPage((page) => Math.max(1, page - 1));
			return;
		}
		setNotes(result.notes);
		setTotalCount(result.total);
		setErrorMessage(null);
		setAvailableTags(await fetchTagOptions());
	}, [fetchPage, fetchTagOptions, handleUnauthorized, currentPage]);

	const setSearchKeyword = useCallback((value: string) => {
		setSearchKeywordState(value);
		setCurrentPage(1);
	}, []);

	const setSelectedTag = useCallback((value: string) => {
		setSelectedTagState(value);
		setCurrentPage(1);
	}, []);

	const setPageSize = useCallback((value: number) => {
		setPageSizeState(value);
		setCurrentPage(1);
	}, []);

	const goToPage = useCallback(
		(page: number) =>
			setCurrentPage(Math.min(Math.max(1, page), totalPages)),
		[totalPages]
	);

	const onCreateNote = useCallback(
		async (payload: NoteCreatePayload): Promise<ActionResult> => {
			setErrorMessage(null);
			const result = await create(payload);
			if (isApiOk(result)) {
				await reload();
				return { success: true };
			}
			if (handleUnauthorized(result.status))
				return { success: false, error: result.error };
			setErrorMessage(result.error);
			return { success: false, error: result.error };
		},
		[create, reload, handleUnauthorized]
	);

	const onUpdateNote = useCallback(
		async (
			noteId: string,
			payload: NoteUpdatePayload
		): Promise<ActionResult> => {
			setErrorMessage(null);
			const result = await update(noteId, payload);
			if (isApiOk(result)) {
				await reload();
				return { success: true };
			}
			if (handleUnauthorized(result.status))
				return { success: false, error: result.error };
			setErrorMessage(result.error);
			return { success: false, error: result.error };
		},
		[update, reload, handleUnauthorized]
	);

	const onDeleteNote = useCallback(
		async (noteId: string): Promise<boolean> => {
			setErrorMessage(null);
			const result = await remove(noteId);
			if (isApiOk(result)) {
				await reload();
				return true;
			}
			if (handleUnauthorized(result.status)) return false;
			setErrorMessage(result.error);
			return false;
		},
		[remove, reload, handleUnauthorized]
	);

	return {
		notes,
		isLoading,
		errorMessage,
		searchKeyword,
		setSearchKeyword,
		selectedTag,
		setSelectedTag,
		availableTags,
		currentPage,
		pageSize,
		totalCount,
		totalPages,
		goToPage,
		setPageSize,
		onCreateNote,
		onUpdateNote,
		onDeleteNote,
	};
}
