import { useAuthStore } from '../Auth';

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export interface ApiListLinks {
	total?: number;
	limit?: number;
	offset?: number;
}

export type ApiResult<T = unknown> =
	| { ok: true; data: T; links?: ApiListLinks }
	| { ok: false; error: string; status?: number };

export function isApiOk<T>(r: ApiResult<T>): r is { ok: true; data: T } {
	return r.ok;
}

export async function apiFetch<T = unknown>(
	path: string,
	init?: RequestInit
): Promise<ApiResult<T>> {
	const token = useAuthStore.getState().accessToken;
	const headers = new Headers(init?.headers);
	if (token && !headers.has('Authorization')) {
		headers.set('Authorization', `Bearer ${token}`);
	}
	if (!headers.has('Content-Type') && init?.body !== undefined) {
		headers.set('Content-Type', 'application/json');
	}

	try {
		const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

		if (res.status === 204) {
			return { ok: true, data: undefined as T };
		}

		const json = await res.json().catch(() => ({}));

		if (!res.ok || json?.success === false) {
			return {
				ok: false,
				error: json?.error?.message ?? `Request failed (HTTP ${res.status})`,
				status: res.status,
			};
		}

		return { ok: true, data: json.data as T, links: json.links };
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : 'Network error. Please try again.',
		};
	}
}
