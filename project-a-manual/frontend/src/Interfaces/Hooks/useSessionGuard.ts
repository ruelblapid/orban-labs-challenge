'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@App/Interfaces/Store/Auth';

export function useSessionGuard() {
	const router = useRouter();
	const hasHydrated = useAuthStore((s) => s.hasHydrated);
	const accessToken = useAuthStore((s) => s.accessToken);
	const expiresAt = useAuthStore((s) => s.expiresAt);

	useEffect(() => {
		if (!hasHydrated) return;

		if (!useAuthStore.getState().isSessionValid()) {
			useAuthStore.getState().logout();
			router.replace('/login');
			return;
		}

		const msRemaining = (expiresAt ?? 0) - Date.now();
		const timeoutId = window.setTimeout(
			() => {
				useAuthStore.getState().logout();
				router.replace('/login?reason=expired');
			},
			Math.max(msRemaining, 0)
		);

		return () => window.clearTimeout(timeoutId);
	}, [hasHydrated, accessToken, expiresAt, router]);

	return { isReady: hasHydrated && useAuthStore.getState().isSessionValid() };
}
