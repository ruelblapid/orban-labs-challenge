import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalCount: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
	pageSizeOptions?: number[];
}

export function Pagination({
	currentPage,
	totalPages,
	totalCount,
	pageSize,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-2 text-sm text-gray-500">
				<span>{totalCount} total</span>
				<Select
					value={String(pageSize)}
					onValueChange={(v) => onPageSizeChange(Number(v))}
				>
					<SelectTrigger size="sm" className="w-27.5">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{pageSizeOptions.map((size) => (
							<SelectItem key={size} value={String(size)}>
								{size} / page
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={currentPage <= 1}
					onClick={() => onPageChange(currentPage - 1)}
				>
					<ChevronLeft size={14} />
					Previous
				</Button>
				<span className="text-sm text-gray-600">
					Page {currentPage} of {totalPages}
				</span>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={currentPage >= totalPages}
					onClick={() => onPageChange(currentPage + 1)}
				>
					Next
					<ChevronRight size={14} />
				</Button>
			</div>
		</div>
	);
}
