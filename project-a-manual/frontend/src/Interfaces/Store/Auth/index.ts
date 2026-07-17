import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { LoginResult, RegisteredUser } from '@App/Domains/Auth/Types';
import { apiFetch, ApiResult, isApiOk } from '../Types';

const sessionStorageAdapter = {
	getItem: (name: string) =>
		typeof window === 'undefined'
			? null
			: window.sessionStorage.getItem(name),
	setItem: (name: string, value: string) => {
		if (typeof window !== 'undefined')
			window.sessionStorage.setItem(name, value);
	},
	removeItem: (name: string) => {
		if (typeof window !== 'undefined')
			window.sessionStorage.removeItem(name);
	},
};

interface AuthState {
	accessToken: string | null;
	tokenType: string | null;
	expiresAt: number | null;
	email: string | null;
	isLoading: boolean;
	errorMessage: string | null;
	hasHydrated: boolean;
	setHasHydrated(value: boolean): void;
	login(
		email: string,
		password: string
	): Promise<{ success: boolean; error?: string }>;
	register(
		email: string,
		password: string
	): Promise<{ success: boolean; error?: string; data?: RegisteredUser }>;
	logout(): void;
	isSessionValid(): boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			accessToken: null,
			tokenType: null,
			expiresAt: null,
			email: null,
			isLoading: false,
			errorMessage: null,
			hasHydrated: false,

			setHasHydrated(value) {
				set({ hasHydrated: value });
			},

			async login(email, password) {
				set({ isLoading: true, errorMessage: null });
				const body = new URLSearchParams({
					username: email,
					password,
				}).toString();
				const result: ApiResult<LoginResult> = await apiFetch(
					'/auth/login',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
						},
						body,
					}
				);

				if (!isApiOk(result)) {
					set({ isLoading: false, errorMessage: result.error });
					return { success: false, error: result.error };
				}

				set({
					accessToken: result.data.access_token,
					tokenType: result.data.token_type,
					expiresAt: Date.now() + result.data.expires_in * 1000,
					email,
					isLoading: false,
					errorMessage: null,
				});
				return { success: true };
			},

			async register(email, password) {
				set({ isLoading: true, errorMessage: null });
				const result: ApiResult<RegisteredUser> = await apiFetch(
					'/auth/register',
					{
						method: 'POST',
						body: JSON.stringify({ email, password }),
					}
				);

				set({
					isLoading: false,
					errorMessage: isApiOk(result) ? null : result.error,
				});

				if (!isApiOk(result)) {
					return { success: false, error: result.error };
				}
				return { success: true, data: result.data };
			},

			logout() {
				set({
					accessToken: null,
					tokenType: null,
					expiresAt: null,
					email: null,
					errorMessage: null,
				});
			},

			isSessionValid() {
				const { accessToken, expiresAt } = get();
				return !!accessToken && !!expiresAt && Date.now() < expiresAt;
			},
		}),
		{
			name: 'notes-auth-session',
			storage: createJSONStorage(() => sessionStorageAdapter),
			partialize: (state) => ({
				accessToken: state.accessToken,
				tokenType: state.tokenType,
				expiresAt: state.expiresAt,
				email: state.email,
			}),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		}
	)
);
