export interface Note {
	id: string;
	title: string;
	body: string;
	tags: string[];
	created_at: string;
	updated_at: string;
}

export interface NoteCreatePayload {
	title: string;
	body: string;
	tags: string[];
}

export interface NoteUpdatePayload {
	title?: string;
	body?: string;
	tags?: string[];
}
