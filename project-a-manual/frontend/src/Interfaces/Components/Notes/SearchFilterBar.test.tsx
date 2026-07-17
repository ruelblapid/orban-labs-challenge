import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { SearchFilterBar } from "@App/Interfaces/Components/Notes/SearchFilterBar";

function setup(overrides?: Partial<ComponentProps<typeof SearchFilterBar>>) {
	const onSearchKeywordChange = vi.fn();
	const onSelectedTagChange = vi.fn();
	const props = {
		searchKeyword: "",
		onSearchKeywordChange,
		selectedTag: "",
		onSelectedTagChange,
		availableTags: ["work", "home"],
		...overrides,
	};
	render(<SearchFilterBar {...props} />);
	return { onSearchKeywordChange, onSelectedTagChange };
}

describe("SearchFilterBar", () => {
	it("calls onSearchKeywordChange as the user types", async () => {
		const { onSearchKeywordChange } = setup();
		const user = userEvent.setup();

		await user.type(screen.getByPlaceholderText("Search by keyword..."), "abc");

		expect(onSearchKeywordChange).toHaveBeenCalledTimes(3);
		expect(onSearchKeywordChange).toHaveBeenLastCalledWith("c");
	});

	it("lists the available tags plus an 'All tags' option", async () => {
		setup();
		const user = userEvent.setup();

		await user.click(screen.getByRole("combobox"));

		expect(screen.getByRole("option", { name: "All tags" })).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "work" })).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "home" })).toBeInTheDocument();
	});

	it("calls onSelectedTagChange with the chosen tag", async () => {
		const { onSelectedTagChange } = setup();
		const user = userEvent.setup();

		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByRole("option", { name: "work" }));

		expect(onSelectedTagChange).toHaveBeenCalledWith("work");
	});

	it("calls onSelectedTagChange with an empty string when 'All tags' is chosen", async () => {
		const { onSelectedTagChange } = setup({ selectedTag: "work" });
		const user = userEvent.setup();

		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByRole("option", { name: "All tags" }));

		expect(onSelectedTagChange).toHaveBeenCalledWith("");
	});

	it("hides the Clear button when there are no active filters", () => {
		setup();
		expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
	});

	it("shows Clear when filters are active and resets both on click", async () => {
		const { onSearchKeywordChange, onSelectedTagChange } = setup({ searchKeyword: "abc" });
		const user = userEvent.setup();

		const clearButton = screen.getByRole("button", { name: /clear/i });
		await user.click(clearButton);

		expect(onSearchKeywordChange).toHaveBeenCalledWith("");
		expect(onSelectedTagChange).toHaveBeenCalledWith("");
	});
});
