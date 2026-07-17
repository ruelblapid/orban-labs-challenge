import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NoteFormModal } from '@App/Interfaces/Components/Notes/NoteFormModal';
import { Note } from '@App/Domains/Notes/Types';

const existingNote: Note = {
	id: '1',
	title: 'Grocery list',
	body: 'Milk',
	tags: ['home', 'errands'],
	created_at: '2026-01-01T00:00:00Z',
	updated_at: '2026-01-01T00:00:00Z',
};

describe('NoteFormModal', () => {
	describe('create mode', () => {
		it('renders empty fields and the create title/button', () => {
			render(
				<NoteFormModal
					note={null}
					onClose={vi.fn()}
					onCreate={vi.fn()}
					onUpdate={vi.fn()}
				/>
			);

			expect(
				screen.getByRole('heading', { name: 'New note' })
			).toBeInTheDocument();
			expect(screen.getByLabelText('Title')).toHaveValue('');
			expect(
				screen.getByRole('button', { name: /create note/i })
			).toBeInTheDocument();
		});

		it('shows a validation error and does not submit when the title is only whitespace', async () => {
			const onCreate = vi.fn();
			const user = userEvent.setup();
			render(
				<NoteFormModal
					note={null}
					onClose={vi.fn()}
					onCreate={onCreate}
					onUpdate={vi.fn()}
				/>
			);

			await user.type(screen.getByLabelText('Title'), ' ');
			await user.click(
				screen.getByRole('button', { name: /create note/i })
			);

			expect(screen.getByText('Title is required.')).toBeInTheDocument();
			expect(onCreate).not.toHaveBeenCalled();
		});

		it('parses comma-separated tags, trimming and dropping empties', async () => {
			const onCreate = vi.fn().mockResolvedValue({ success: true });
			const onClose = vi.fn();
			const user = userEvent.setup();
			render(
				<NoteFormModal
					note={null}
					onClose={onClose}
					onCreate={onCreate}
					onUpdate={vi.fn()}
				/>
			);

			await user.type(screen.getByLabelText('Title'), 'New note');
			await user.type(screen.getByLabelText('Body'), 'Some body');
			await user.type(
				screen.getByLabelText('Tags'),
				'work,  personal ,, '
			);
			await user.click(
				screen.getByRole('button', { name: /create note/i })
			);

			expect(onCreate).toHaveBeenCalledWith({
				title: 'New note',
				body: 'Some body',
				tags: ['work', 'personal'],
			});
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('shows the returned error and stays open on failure', async () => {
			const onCreate = vi.fn().mockResolvedValue({
				success: false,
				error: 'Server rejected it',
			});
			const onClose = vi.fn();
			const user = userEvent.setup();
			render(
				<NoteFormModal
					note={null}
					onClose={onClose}
					onCreate={onCreate}
					onUpdate={vi.fn()}
				/>
			);

			await user.type(screen.getByLabelText('Title'), 'New note');
			await user.click(
				screen.getByRole('button', { name: /create note/i })
			);

			expect(screen.getByText('Server rejected it')).toBeInTheDocument();
			expect(onClose).not.toHaveBeenCalled();
		});
	});

	describe('edit mode', () => {
		it('pre-fills fields from the note and shows the edit title/button', () => {
			render(
				<NoteFormModal
					note={existingNote}
					onClose={vi.fn()}
					onCreate={vi.fn()}
					onUpdate={vi.fn()}
				/>
			);

			expect(
				screen.getByRole('heading', { name: 'Edit note' })
			).toBeInTheDocument();
			expect(screen.getByLabelText('Title')).toHaveValue('Grocery list');
			expect(screen.getByLabelText('Body')).toHaveValue('Milk');
			expect(screen.getByLabelText('Tags')).toHaveValue('home, errands');
			expect(
				screen.getByRole('button', { name: /save changes/i })
			).toBeInTheDocument();
		});

		it('calls onUpdate with the note id and the edited payload', async () => {
			const onUpdate = vi.fn().mockResolvedValue({ success: true });
			const user = userEvent.setup();
			render(
				<NoteFormModal
					note={existingNote}
					onClose={vi.fn()}
					onCreate={vi.fn()}
					onUpdate={onUpdate}
				/>
			);

			await user.clear(screen.getByLabelText('Title'));
			await user.type(screen.getByLabelText('Title'), 'Updated title');
			await user.click(
				screen.getByRole('button', { name: /save changes/i })
			);

			expect(onUpdate).toHaveBeenCalledWith('1', {
				title: 'Updated title',
				body: 'Milk',
				tags: ['home', 'errands'],
			});
		});
	});

	it('calls onClose when Cancel is clicked', async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();
		render(
			<NoteFormModal
				note={null}
				onClose={onClose}
				onCreate={vi.fn()}
				onUpdate={vi.fn()}
			/>
		);

		await user.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
