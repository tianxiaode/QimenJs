// 全局测试设置

// 设置测试环境标志
(global as any).IS_TEST = true;

// Polyfill: ResizeObserver (jsdom 不提供)
if (typeof ResizeObserver === 'undefined') {
    (global as any).ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}

// Polyfill: MutationObserver (jsdom 可能缺失)
if (typeof MutationObserver === 'undefined') {
    (global as any).MutationObserver = class MutationObserver {
        observe() {}
        disconnect() {}
        takeRecords() { return []; }
    };
}

// Polyfill: Element.scrollBy / scrollTo (jsdom 不提供)
if (typeof HTMLElement !== 'undefined') {
    if (!HTMLElement.prototype.scrollBy) {
        (HTMLElement.prototype as any).scrollBy = function() {};
    }
    if (!HTMLElement.prototype.scrollTo) {
        (HTMLElement.prototype as any).scrollTo = function() {};
    }
}

// Polyfill: TextEncoder / TextDecoder (jsdom 可能缺失)
if (typeof TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    (global as any).TextEncoder = TextEncoder;
    (global as any).TextDecoder = TextDecoder;
}

// Polyfill: ReadableStream (jsdom 可能缺失)
if (typeof ReadableStream === 'undefined') {
    // 简单的 ReadableStream polyfill，仅用于测试
    (global as any).ReadableStream = class ReadableStream {
        private source: any;
        constructor(underlyingSource: any) {
            this.source = underlyingSource;
        }
    };
}

// Mock console 方法以防止测试输出干扰
const originalConsole = { ...console };

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'trace').mockImplementation(() => {});
});

afterAll(() => {
    // 恢复原始 console
    Object.keys(originalConsole).forEach(key => {
        const consoleKey = key as keyof typeof console;
        if (console[consoleKey] && (console[consoleKey] as any).mockRestore) {
            (console[consoleKey] as any).mockRestore();
        }
    });
});

beforeEach(() => {
    jest.clearAllMocks();
});

// 全局测试超时
jest.setTimeout(10000);
