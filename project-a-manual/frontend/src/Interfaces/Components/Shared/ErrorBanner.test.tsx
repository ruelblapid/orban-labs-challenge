import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorBanner } from "@App/Interfaces/Components/Shared/ErrorBanner";

describe("ErrorBanner", () => {
	it("renders the message when provided", () => {
		render(<ErrorBanner message="Something went wrong" />);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});

	it("renders nothing when message is null or undefined", () => {
		const { container: withNull } = render(<ErrorBanner message={null} />);
		expect(withNull).toBeEmptyDOMElement();

		const { container: withUndefined } = render(<ErrorBanner message={undefined} />);
		expect(withUndefined).toBeEmptyDOMElement();
	});
});
