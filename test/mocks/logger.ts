/**
 * 共享 Logger mock 模块
 *
 * 使用方式：
 * jest.mock('@/logger', () => require('@/test/mocks/logger').loggerMock);
 */
const actualLogger = jest.requireActual('@/logger');

export const loggerMock = {
    ...actualLogger,
    Logger: {
        ...actualLogger.Logger,
        for: jest.fn(() => ({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        })),
    },
};
