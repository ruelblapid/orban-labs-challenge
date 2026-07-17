'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@App/Interfaces/Store/Auth';

export default function HomePage() {
	const router = useRouter();
	const hasHydrated = useAuthStore((s) => s.hasHydrated);

	useEffect(() => {
		if (!hasHydrated) return;
		router.replace(useAuthStore.getState().isSessionValid() ? '/notes' : '/login');
	}, [hasHydrated, router]);

	return (
		<div className="flex flex-1 items-center justify-center">
			<Loader2 size={20} className="animate-spin text-gray-400" />
		</div>
	);
}
