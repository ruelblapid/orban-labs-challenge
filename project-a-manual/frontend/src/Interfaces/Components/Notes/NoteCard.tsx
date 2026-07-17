import { Pencil, Trash2 } from 'lucide-react';
import { Note } from '@App/Domains/Notes/Types';
import { Button } from '@/components/ui/button';

interface NoteCardProps {
	note: Note;
	onEdit: (note: Note) => void;
	onDelete: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
	return (
		<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<h3 className="font-semibold text-gray-900">{note.title}</h3>
				<div className="flex shrink-0 items-center gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={() => onEdit(note)}
						aria-label={`Edit ${note.title}`}
						className="text-gray-400 hover:text-gray-600"
					>
						<Pencil size={15} />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={() => onDelete(note)}
						aria-label={`Delete ${note.title}`}
						className="text-gray-400 hover:bg-red-50 hover:text-red-600"
					>
						<Trash2 size={15} />
					</Button>
				</div>
			</div>

			<p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{note.body}</p>

			{note.tags.length > 0 && (
				<div className="mt-3 flex flex-wrap gap-1.5">
					{note.tags.map((tag) => (
						<span
							key={tag}
							className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
						>
							{tag}
						</span>
					))}
				</div>
			)}

			<p className="mt-3 text-xs text-gray-400">
				Updated {new Date(note.updated_at).toLocaleString()}
			</p>
		</div>
	);
}
