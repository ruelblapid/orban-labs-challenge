'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@App/Interfaces/Components/Auth/LoginForm';

function LoginPageContent() {
	const searchParams = useSearchParams();
	const registeredEmail = searchParams.get('email') ?? '';
	const infoMessage = searchParams.get('registered')
		? 'Account created. Sign in to continue.'
		: searchParams.get('reason') === 'expired'
			? 'Your session expired. Please sign in again.'
			: null;

	return <LoginForm initialEmail={registeredEmail} infoMessage={infoMessage} />;
}

export default function LoginPage() {
	return (
		<div className="flex flex-1 items-center justify-center px-4 py-12">
			<Suspense fallback={<LoginForm />}>
				<LoginPageContent />
			</Suspense>
		</div>
	);
}
