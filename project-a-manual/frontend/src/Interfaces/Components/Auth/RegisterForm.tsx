'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';
import { useRegisterViewModel } from '@App/Interfaces/ViewModels/Auth';
import { ErrorBanner } from '@App/Interfaces/Components/Shared/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm() {
	const { onRegister, isLoading, errorMessage } = useRegisterViewModel();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [validationError, setValidationError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setValidationError(null);

		if (password.length < 8) {
			setValidationError('Password must be at least 8 characters.');
			return;
		}
		if (password !== confirmPassword) {
			setValidationError('Passwords do not match.');
			return;
		}

		await onRegister(email, password);
	};

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
			<div className="text-center">
				<h1 className="text-xl font-semibold text-gray-900">Create an account</h1>
				<p className="mt-1 text-sm text-gray-500">Start capturing your notes</p>
			</div>

			<ErrorBanner message={validationError ?? errorMessage} />

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
					minLength={8}
					autoComplete="new-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<p className="text-xs text-gray-400">At least 8 characters.</p>
			</div>

			<div className="space-y-1">
				<Label htmlFor="confirmPassword">Confirm password</Label>
				<Input
					id="confirmPassword"
					type="password"
					required
					autoComplete="new-password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
			</div>

			<Button type="submit" disabled={isLoading} className="w-full">
				{isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
				Create account
			</Button>

			<p className="text-center text-sm text-gray-500">
				Already have an account?{' '}
				<Link href="/login" className="font-medium text-blue-600 hover:underline">
					Sign in
				</Link>
			</p>
		</form>
	);
}
