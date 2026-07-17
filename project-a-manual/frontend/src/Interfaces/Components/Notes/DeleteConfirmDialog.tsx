'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Note } from '@App/Domains/Notes/Types';
import { Modal } from '@App/Interfaces/Components/Shared/Modal';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
	note: Note;
	onClose: () => void;
	onConfirm: (noteId: string) => Promise<boolean>;
}

export function DeleteConfirmDialog({
	note,
	onClose,
	onConfirm,
}: DeleteConfirmDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirm = async () => {
		setIsDeleting(true);
		const success = await onConfirm(note.id);
		setIsDeleting(false);
		if (success) onClose();
	};

	return (
		<Modal
			title="Delete note"
			onClose={onClose}
			footer={
				<>
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isDeleting}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleConfirm}
						disabled={isDeleting}
					>
						{isDeleting && (
							<Loader2 size={14} className="animate-spin" />
						)}
						Delete
					</Button>
				</>
			}
		>
			<p className="text-sm text-gray-600">
				Delete{' '}
				<span className="font-semibold text-gray-900">
					{note.title}
				</span>
				? This cannot be undone.
			</p>
		</Modal>
	);
}
