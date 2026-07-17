'use client';

import { useRouter } from 'next/navigation';
import { LogOut, NotebookText } from 'lucide-react';
import { useAuthStore } from '@App/Interfaces/Store/Auth';
import { Button } from '@/components/ui/button';

export function Header() {
	const router = useRouter();
	const email = useAuthStore((s) => s.email);
	const logout = useAuthStore((s) => s.logout);

	const onLogout = () => {
		logout();
		router.replace('/login');
	};

	return (
		<header className="border-b border-gray-200 bg-white">
			<div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
				<div className="flex items-center gap-2 text-gray-900">
					<NotebookText size={20} className="text-blue-600" />
					<span className="text-sm font-semibold">Notes</span>
				</div>
				<div className="flex items-center gap-3">
					{email && <span className="text-sm text-gray-500">{email}</span>}
					<Button type="button" variant="outline" size="sm" onClick={onLogout}>
						<LogOut size={14} />
						Logout
					</Button>
				</div>
			</div>
		</header>
	);
}
