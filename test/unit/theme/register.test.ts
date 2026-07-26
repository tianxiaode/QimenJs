/**
 * 单元测试：register.ts - 自动注册预设主题
 *
 * 测试覆盖范围：
 * 1. registerPresetThemes - 注册预设主题（light, dark）
 * 2. registerPresetThemes - 注册额外主题
 * 3. registerChineseThemes - 注册中国传统色主题
 * 4. 模块加载时的自动注册行为
 */

// Mock ThemeRegistrar - must mock the actual module path
const mockRegister = jest.fn();
const mockInitEventBus = jest.fn();
const mockGetInstance = jest.fn(() => ({
    register: mockRegister,
    initEventBus: mockInitEventBus,
    name: 'theme',
}));

jest.mock('@/theme/ThemeRegistrar', () => {
    return {
        ThemeRegistrar: {
            getInstance: mockGetInstance,
        },
    };
});

// Mock RegistryHub
const mockRegistryHubUse = jest.fn();
jest.mock('@/registry/RegistryHub', () => ({
    RegistryHub: {
        use: mockRegistryHubUse,
    },
}));

// Mock globalEventBus
jest.mock('@/events/GlobalEventBus', () => ({
    globalEventBus: {
        emit: jest.fn(),
        on: jest.fn(() => jest.fn()),
        createEventScope: jest.fn(() => ({
            on: jest.fn(() => jest.fn()),
            once: jest.fn(),
            emit: jest.fn(),
            dispose: jest.fn(),
            getScopeId: jest.fn(() => 'mock-scope'),
            addCleanup: jest.fn(),
        })),
    },
}));

// Mock presets to track which themes are registered
jest.mock('@/theme/presets', () => ({
    lightTheme: { name: 'light', tokens: {} },
    darkTheme: { name: 'dark', tokens: {} },
    chineseThemes: [
        { name: 'celadon', tokens: {} },
        { name: 'cinnabar', tokens: {} },
        { name: 'indigo', tokens: {} },
        { name: 'yellow', tokens: {} },
        { name: 'rosewood', tokens: {} },
        { name: 'ink', tokens: {} },
        { name: 'dai', tokens: {} },
    ],
}));

// Track calls that happen during module load
let autoRegisteredCalls: any[] = [];
let autoInitEventBusCalled = false;
let autoRegistryHubUseCalled = false;

// Capture auto-registration calls by requiring the module once
const registerModule = require('@/theme/register');
autoRegisteredCalls = mockRegister.mock.calls.map((call: any[]) => call[0]);
autoInitEventBusCalled = mockInitEventBus.mock.calls.length > 0;
autoRegistryHubUseCalled = mockRegistryHubUse.mock.calls.length > 0;

describe('register', () => {
    beforeEach(() => {
        mockRegister.mockClear();
        mockInitEventBus.mockClear();
        mockRegistryHubUse.mockClear();
    });

    describe('registerPresetThemes', () => {
        it('应注册 light 和 dark 预设主题', () => {
            registerModule.registerPresetThemes();

            expect(mockRegister).toHaveBeenCalledWith({ name: 'light', tokens: {} });
            expect(mockRegister).toHaveBeenCalledWith({ name: 'dark', tokens: {} });
        });

        it('应注册额外的主题', () => {
            const extraTheme = { name: 'custom', tokens: {} } as any;
            registerModule.registerPresetThemes([extraTheme]);

            expect(mockRegister).toHaveBeenCalledWith(extraTheme);
        });

        it('不传 extra 参数时不应注册额外主题', () => {
            const callsBefore = mockRegister.mock.calls.length;
            registerModule.registerPresetThemes();

            // 只增加了 light + dark 的注册
            expect(mockRegister.mock.calls.length).toBe(callsBefore + 2);
        });

        it('传入空数组时不应注册额外主题', () => {
            const callsBefore = mockRegister.mock.calls.length;
            registerModule.registerPresetThemes([]);

            // 只增加了 light + dark 的注册
            expect(mockRegister.mock.calls.length).toBe(callsBefore + 2);
        });

        it('应注册多个额外主题', () => {
            const extra1 = { name: 'extra1', tokens: {} } as any;
            const extra2 = { name: 'extra2', tokens: {} } as any;
            const callsBefore = mockRegister.mock.calls.length;
            registerModule.registerPresetThemes([extra1, extra2]);

            // 2 个预设 + 2 个额外
            expect(mockRegister.mock.calls.length).toBe(callsBefore + 4);
            expect(mockRegister).toHaveBeenCalledWith(extra1);
            expect(mockRegister).toHaveBeenCalledWith(extra2);
        });
    });

    describe('registerChineseThemes', () => {
        it('应注册所有 7 个中国传统色主题', () => {
            registerModule.registerChineseThemes();

            expect(mockRegister).toHaveBeenCalledTimes(7);
        });

        it('应注册正确的主题名称', () => {
            registerModule.registerChineseThemes();

            const registeredNames = mockRegister.mock.calls.map((call: any[]) => call[0].name);
            expect(registeredNames).toContain('celadon');
            expect(registeredNames).toContain('cinnabar');
            expect(registeredNames).toContain('indigo');
            expect(registeredNames).toContain('yellow');
            expect(registeredNames).toContain('rosewood');
            expect(registeredNames).toContain('ink');
            expect(registeredNames).toContain('dai');
        });
    });

    describe('模块自动注册行为', () => {
        it('模块加载时应调用 initEventBus', () => {
            expect(autoInitEventBusCalled).toBe(true);
        });

        it('模块加载时应将 ThemeRegistrar 注册到 RegistryHub', () => {
            expect(autoRegistryHubUseCalled).toBe(true);
        });

        it('模块加载时应自动注册预设主题', () => {
            // Auto-registration of light + dark should have happened during module load
            const autoNames = autoRegisteredCalls.map((c: any) => c.name);
            expect(autoNames).toContain('light');
            expect(autoNames).toContain('dark');
        });
    });
});
