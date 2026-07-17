import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface SearchFilterBarProps {
	searchKeyword: string;
	onSearchKeywordChange: (value: string) => void;
	selectedTag: string;
	onSelectedTagChange: (value: string) => void;
	availableTags: string[];
}

const ALL_TAGS_VALUE = '__all__';

export function SearchFilterBar({
	searchKeyword,
	onSearchKeywordChange,
	selectedTag,
	onSelectedTagChange,
	availableTags,
}: SearchFilterBarProps) {
	const hasActiveFilters = !!searchKeyword || !!selectedTag;

	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
			<div className="relative flex-1">
				<Search
					size={16}
					className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
				/>
				<Input
					type="text"
					value={searchKeyword}
					onChange={(e) => onSearchKeywordChange(e.target.value)}
					placeholder="Search by keyword..."
					className="h-9 pl-9"
				/>
			</div>

			<Select
				value={selectedTag || ALL_TAGS_VALUE}
				onValueChange={(value) => onSelectedTagChange(value === ALL_TAGS_VALUE ? '' : value)}
			>
				<SelectTrigger className="w-full sm:w-40">
					<SelectValue placeholder="All tags" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_TAGS_VALUE}>All tags</SelectItem>
					{availableTags.map((tag) => (
						<SelectItem key={tag} value={tag}>
							{tag}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{hasActiveFilters && (
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						onSearchKeywordChange('');
						onSelectedTagChange('');
					}}
					className="whitespace-nowrap"
				>
					<X size={14} />
					Clear
				</Button>
			)}
		</div>
	);
}
