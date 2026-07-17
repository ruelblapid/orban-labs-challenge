'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Header } from '@App/Interfaces/Components/Layout/Header';
import { useSessionGuard } from '@App/Interfaces/Hooks/useSessionGuard';

export default function NotesLayout({ children }: { children: ReactNode }) {
	const { isReady } = useSessionGuard();

	if (!isReady) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<Loader2 size={20} className="animate-spin text-gray-400" />
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col bg-gray-50">
			<Header />
			<main className="flex-1">{children}</main>
		</div>
	);
}
