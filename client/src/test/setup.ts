import { afterEach, vi } from "vitest"

const createLocalStorageMock = () => {
	const store = new Map<string, string>()

	return {
		getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
		setItem: (key: string, value: string) => {
			store.set(key, value)
		},
		removeItem: (key: string) => {
			store.delete(key)
		},
		clear: () => {
			store.clear()
		},
		key: (index: number) => Array.from(store.keys())[index] ?? null,
		get length() {
			return store.size
		},
	}
}

if (!globalThis.localStorage) {
	Object.defineProperty(globalThis, "localStorage", {
		value: createLocalStorageMock(),
		configurable: true,
	})
}

if (!globalThis.ResizeObserver) {
	class ResizeObserverMock {
		observe() {}
		unobserve() {}
		disconnect() {}
	}

	Object.defineProperty(globalThis, "ResizeObserver", {
		value: ResizeObserverMock,
		configurable: true,
	})
}

if (!globalThis.matchMedia) {
	Object.defineProperty(globalThis, "matchMedia", {
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}),
		configurable: true,
	})
}

afterEach(() => {
	globalThis.localStorage.clear()
	vi.restoreAllMocks()
})
