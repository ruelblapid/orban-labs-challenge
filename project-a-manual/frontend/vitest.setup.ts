import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Radix UI (Select, etc.) calls these on the underlying element; jsdom's PointerEvent
// support doesn't implement them, so Select interactions throw without these stubs.
Object.assign(window.HTMLElement.prototype, {
	scrollIntoView: vi.fn(),
	hasPointerCapture: vi.fn(),
	setPointerCapture: vi.fn(),
	releasePointerCapture: vi.fn(),
});
