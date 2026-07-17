export interface RegisterPayload {
	email: string;
	password: string;
}

export interface RegisteredUser {
	id: string;
	email: string;
	created_at: string;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface LoginResult {
	access_token: string;
	token_type: string;
	expires_in: number;
}
