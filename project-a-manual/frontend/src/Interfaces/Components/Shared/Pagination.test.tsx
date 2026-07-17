import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "@App/Interfaces/Components/Shared/Pagination";

describe("Pagination", () => {
	it("renders the total count and current/total pages", () => {
		render(
			<Pagination
				currentPage={2}
				totalPages={5}
				totalCount={42}
				pageSize={10}
				onPageChange={vi.fn()}
				onPageSizeChange={vi.fn()}
			/>
		);

		expect(screen.getByText("42 total")).toBeInTheDocument();
		expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
	});

	it("disables Previous on the first page and Next on the last page", () => {
		const { rerender } = render(
			<Pagination
				currentPage={1}
				totalPages={3}
				totalCount={30}
				pageSize={10}
				onPageChange={vi.fn()}
				onPageSizeChange={vi.fn()}
			/>
		);

		expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();

		rerender(
			<Pagination
				currentPage={3}
				totalPages={3}
				totalCount={30}
				pageSize={10}
				onPageChange={vi.fn()}
				onPageSizeChange={vi.fn()}
			/>
		);

		expect(screen.getByRole("button", { name: /previous/i })).toBeEnabled();
		expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
	});

	it("calls onPageChange with the adjacent page when clicking Previous/Next", async () => {
		const onPageChange = vi.fn();
		const user = userEvent.setup();
		render(
			<Pagination
				currentPage={2}
				totalPages={5}
				totalCount={50}
				pageSize={10}
				onPageChange={onPageChange}
				onPageSizeChange={vi.fn()}
			/>
		);

		await user.click(screen.getByRole("button", { name: /previous/i }));
		expect(onPageChange).toHaveBeenLastCalledWith(1);

		await user.click(screen.getByRole("button", { name: /next/i }));
		expect(onPageChange).toHaveBeenLastCalledWith(3);
	});

	it("calls onPageSizeChange with a number when the page size selection changes", async () => {
		const onPageSizeChange = vi.fn();
		const user = userEvent.setup();
		render(
			<Pagination
				currentPage={1}
				totalPages={1}
				totalCount={10}
				pageSize={10}
				onPageChange={vi.fn()}
				onPageSizeChange={onPageSizeChange}
			/>
		);

		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByRole("option", { name: "25 / page" }));

		expect(onPageSizeChange).toHaveBeenCalledWith(25);
	});
});
