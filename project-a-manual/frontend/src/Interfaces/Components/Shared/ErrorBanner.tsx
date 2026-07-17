import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
	message: string | null | undefined;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
	if (!message) return null;

	return (
		<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
			<AlertCircle size={16} className="mt-0.5 shrink-0" />
			<span>{message}</span>
		</div>
	);
}
