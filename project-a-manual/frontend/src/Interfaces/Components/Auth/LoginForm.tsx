'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';
import { useLoginViewModel } from '@App/Interfaces/ViewModels/Auth';
import { ErrorBanner } from '@App/Interfaces/Components/Shared/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
	initialEmail?: string;
	infoMessage?: string | null;
}

export function LoginForm({ initialEmail = '', infoMessage }: LoginFormProps) {
	const { onLogin, isLoading, errorMessage } = useLoginViewModel();
	const [email, setEmail] = useState(initialEmail);
	const [password, setPassword] = useState('');

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		await onLogin(email, password);
	};

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
			<div className="text-center">
				<h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
				<p className="mt-1 text-sm text-gray-500">Access your notes</p>
			</div>

			{infoMessage && (
				<div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
					{infoMessage}
				</div>
			)}
			<ErrorBanner message={errorMessage} />

			<div className="space-y-1">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					required
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</div>

			<div className="space-y-1">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					required
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>

			<Button type="submit" disabled={isLoading} className="w-full">
				{isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
				Sign in
			</Button>

			<p className="text-center text-sm text-gray-500">
				No account?{' '}
				<Link href="/register" className="font-medium text-blue-600 hover:underline">
					Register
				</Link>
			</p>
		</form>
	);
}
