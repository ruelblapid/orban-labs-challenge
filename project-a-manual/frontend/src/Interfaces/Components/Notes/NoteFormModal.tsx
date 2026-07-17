'use client';

import { FormEvent, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
	Note,
	NoteCreatePayload,
	NoteUpdatePayload,
} from '@App/Domains/Notes/Types';
import { Modal } from '@App/Interfaces/Components/Shared/Modal';
import { ErrorBanner } from '@App/Interfaces/Components/Shared/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NoteFormModalProps {
	note: Note | null;
	onClose: () => void;
	onCreate: (
		payload: NoteCreatePayload
	) => Promise<{ success: boolean; error?: string }>;
	onUpdate: (
		noteId: string,
		payload: NoteUpdatePayload
	) => Promise<{ success: boolean; error?: string }>;
}

interface FormState {
	title: string;
	body: string;
	tags: string;
}

const emptyForm: FormState = { title: '', body: '', tags: '' };

export function NoteFormModal({
	note,
	onClose,
	onCreate,
	onUpdate,
}: NoteFormModalProps) {
	const isEditMode = !!note;
	const [form, setForm] = useState<FormState>(
		note
			? { title: note.title, body: note.body, tags: note.tags.join(', ') }
			: emptyForm
	);
	const [fieldError, setFieldError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setFieldError(null);

		if (!form.title.trim()) {
			setFieldError('Title is required.');
			return;
		}

		const tags = form.tags
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean);
		const payload = { title: form.title, body: form.body, tags };

		setIsSubmitting(true);
		const result = note
			? await onUpdate(note.id, payload)
			: await onCreate(payload);
		setIsSubmitting(false);

		if (result.success) {
			onClose();
			return;
		}
		setFieldError(
			result.error ?? 'Something went wrong. Please try again.'
		);
	};

	return (
		<Modal
			title={isEditMode ? 'Edit note' : 'New note'}
			onClose={onClose}
			footer={
				<>
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="note-form"
						disabled={isSubmitting}
					>
						{isSubmitting && (
							<Loader2 size={14} className="animate-spin" />
						)}
						{isEditMode ? 'Save changes' : 'Create note'}
					</Button>
				</>
			}
		>
			<form id="note-form" onSubmit={handleSubmit} className="space-y-4">
				<ErrorBanner message={fieldError} />

				<div className="space-y-1">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						required
						maxLength={255}
						value={form.title}
						onChange={(e) =>
							setForm((f) => ({ ...f, title: e.target.value }))
						}
					/>
				</div>

				<div className="space-y-1">
					<Label htmlFor="body">Body</Label>
					<Textarea
						id="body"
						rows={5}
						value={form.body}
						onChange={(e) =>
							setForm((f) => ({ ...f, body: e.target.value }))
						}
					/>
				</div>

				<div className="space-y-1">
					<Label htmlFor="tags">Tags</Label>
					<Input
						id="tags"
						value={form.tags}
						onChange={(e) =>
							setForm((f) => ({ ...f, tags: e.target.value }))
						}
						placeholder="work, personal"
					/>
					<p className="text-xs text-gray-400">Comma-separated.</p>
				</div>
			</form>
		</Modal>
	);
}
