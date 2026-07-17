'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModalProps {
	title: string;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
}

export function Modal({ title, onClose, children, footer }: ModalProps) {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKeyDown);
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = '';
		};
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
				<div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
					<h2 className="text-base font-semibold text-gray-900">
						{title}
					</h2>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={onClose}
						aria-label="Close"
						className="text-gray-400 hover:text-gray-600"
					>
						<X size={18} />
					</Button>
				</div>
				<div className="max-h-[70vh] overflow-y-auto px-5 py-4">
					{children}
				</div>
				{footer && (
					<div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}
