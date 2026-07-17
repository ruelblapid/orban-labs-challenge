'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@App/Interfaces/Store/Auth';

export function useLoginViewModel() {
	const router = useRouter();
	const login = useAuthStore((s) => s.login);
	const isLoading = useAuthStore((s) => s.isLoading);
	const errorMessage = useAuthStore((s) => s.errorMessage);

	const onLogin = useCallback(
		async (email: string, password: string) => {
			const result = await login(email, password);
			if (result.success) {
				router.push('/notes');
			}
			return result;
		},
		[login, router]
	);

	return { onLogin, isLoading, errorMessage };
}

export function useRegisterViewModel() {
	const router = useRouter();
	const register = useAuthStore((s) => s.register);
	const isLoading = useAuthStore((s) => s.isLoading);
	const errorMessage = useAuthStore((s) => s.errorMessage);

	const onRegister = useCallback(
		async (email: string, password: string) => {
			const result = await register(email, password);
			if (result.success) {
				router.push(`/login?registered=1&email=${encodeURIComponent(email)}`);
			}
			return result;
		},
		[register, router]
	);

	return { onRegister, isLoading, errorMessage };
}
