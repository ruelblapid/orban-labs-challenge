'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Note } from '@App/Domains/Notes/Types';
import { useNotesViewModel } from '@App/Interfaces/ViewModels/Notes';
import { ErrorBanner } from '@App/Interfaces/Components/Shared/ErrorBanner';
import { Pagination } from '@App/Interfaces/Components/Shared/Pagination';
import { Button } from '@/components/ui/button';
import { NoteCard } from './NoteCard';
import { NoteFormModal } from './NoteFormModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { SearchFilterBar } from './SearchFilterBar';

export function NotesPageClient() {
	const {
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
	} = useNotesViewModel();

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingNote, setEditingNote] = useState<Note | null>(null);
	const [deletingNote, setDeletingNote] = useState<Note | null>(null);

	return (
		<div className="mx-auto max-w-4xl px-4 py-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h1 className="text-lg font-semibold text-gray-900">Your notes</h1>
					<p className="text-sm text-gray-500">{totalCount} note(s)</p>
				</div>
				<Button
					type="button"
					onClick={() => {
						setEditingNote(null);
						setIsFormOpen(true);
					}}
				>
					<Plus size={16} />
					New note
				</Button>
			</div>

			<div className="mb-4">
				<SearchFilterBar
					searchKeyword={searchKeyword}
					onSearchKeywordChange={setSearchKeyword}
					selectedTag={selectedTag}
					onSelectedTagChange={setSelectedTag}
					availableTags={availableTags}
				/>
			</div>

			<div className="mb-4">
				<ErrorBanner message={errorMessage} />
			</div>

			{isLoading && notes.length === 0 ? (
				<div className="flex items-center justify-center gap-2 py-16 text-gray-400">
					<Loader2 size={18} className="animate-spin" />
					Loading notes...
				</div>
			) : notes.length === 0 ? (
				<div className="rounded-lg border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
					No notes found.
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{notes.map((note) => (
						<NoteCard
							key={note.id}
							note={note}
							onEdit={(n) => {
								setEditingNote(n);
								setIsFormOpen(true);
							}}
							onDelete={(n) => setDeletingNote(n)}
						/>
					))}
				</div>
			)}

			{totalCount > 0 && (
				<div className="mt-4">
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalCount={totalCount}
						pageSize={pageSize}
						onPageChange={goToPage}
						onPageSizeChange={setPageSize}
					/>
				</div>
			)}

			{isFormOpen && (
				<NoteFormModal
					key={editingNote?.id ?? 'create'}
					note={editingNote}
					onClose={() => {
						setIsFormOpen(false);
						setEditingNote(null);
					}}
					onCreate={onCreateNote}
					onUpdate={onUpdateNote}
				/>
			)}

			{deletingNote && (
				<DeleteConfirmDialog
					key={deletingNote.id}
					note={deletingNote}
					onClose={() => setDeletingNote(null)}
					onConfirm={onDeleteNote}
				/>
			)}
		</div>
	);
}
