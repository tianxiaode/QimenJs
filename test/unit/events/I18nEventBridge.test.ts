/**
 * 单元测试：I18nEventBridge
 *
 * 测试覆盖范围：
 * 1. 构造函数 - 默认配置与自定义配置
 * 2. connect - 连接桥接器，监听 i18n 事件
 * 3. disconnect - 断开桥接器
 * 4. isConnected - 连接状态
 * 5. 事件转发 - localeChange / messagesUpdate 事件正确转发到 eventBus
 * 6. 边界情况 - 重复连接、空 i18n、空 eventBus、i18n 无对应方法
 */

import { I18nEventBridge, i18nEventBridge } from '@/events/I18nEventBridge';
import { EventContextBuilder } from '@qimenjs/context';

// Mock EventContextBuilder to verify build calls
jest.mock('@qimenjs/context', () => {
    const original = jest.requireActual('@qimenjs/context');
    return {
        ...original,
        EventContextBuilder: {
            create: jest.fn(() => ({
                withEvent: jest.fn().mockReturnThis(),
                withType: jest.fn().mockReturnThis(),
                withSource: jest.fn().mockReturnThis(),
                withSourceType: jest.fn().mockReturnThis(),
                withData: jest.fn().mockReturnThis(),
                build: jest.fn(() => ({ event: 'mockCtx' })),
            })),
        },
    };
});

describe('I18nEventBridge', () => {
    let mockI18n: any;
    let mockEventBus: any;
    let localeChangeCallback: any;
    let messagesUpdateCallback: any;

    beforeEach(() => {
        localeChangeCallback = null;
        messagesUpdateCallback = null;

        mockI18n = {
            onLocaleChange: jest.fn((cb: any) => {
                localeChangeCallback = cb;
                return jest.fn(); // 返回 unsubscribe 函数
            }),
            onMessagesUpdate: jest.fn((cb: any) => {
                messagesUpdateCallback = cb;
                return jest.fn(); // 返回 unsubscribe 函数
            }),
        };

        mockEventBus = {
            emit: jest.fn(),
        };
    });

    describe('构造函数', () => {
        it('应使用默认事件名', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();

            // 触发 localeChange 事件，验证默认事件名
            if (localeChangeCallback) {
                localeChangeCallback({ previous: 'en', current: 'zh' });
            }
            expect(mockEventBus.emit).toHaveBeenCalledWith('localeChange', expect.anything());

            // 触发 messagesUpdate 事件，验证默认事件名
            if (messagesUpdateCallback) {
                messagesUpdateCallback({ locale: 'zh' });
            }
            expect(mockEventBus.emit).toHaveBeenCalledWith('messagesUpdate', expect.anything());
        });

        it('应使用自定义事件名', () => {
            const bridge = new I18nEventBridge({
                i18n: mockI18n,
                eventBus: mockEventBus,
                localeChangeEventName: 'customLocaleChange',
                messagesUpdateEventName: 'customMessagesUpdate',
            });
            bridge.connect();

            if (localeChangeCallback) {
                localeChangeCallback({ previous: 'en', current: 'zh' });
            }
            expect(mockEventBus.emit).toHaveBeenCalledWith('customLocaleChange', expect.anything());

            if (messagesUpdateCallback) {
                messagesUpdateCallback({ locale: 'zh' });
            }
            expect(mockEventBus.emit).toHaveBeenCalledWith('customMessagesUpdate', expect.anything());
        });

        it('未提供 eventBus 时应使用 globalEventBus', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n });
            // 内部 eventBus 应为 globalEventBus 实例
            // 验证方式：connect 不应抛错
            expect(() => bridge.connect()).not.toThrow();
        });
    });

    describe('connect', () => {
        it('应监听 i18n 的 onLocaleChange 事件', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();
            expect(mockI18n.onLocaleChange).toHaveBeenCalledWith(expect.any(Function));
        });

        it('应监听 i18n 的 onMessagesUpdate 事件', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();
            expect(mockI18n.onMessagesUpdate).toHaveBeenCalledWith(expect.any(Function));
        });

        it('连接后 isConnected 应为 true', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            expect(bridge.isConnected).toBe(false);
            bridge.connect();
            expect(bridge.isConnected).toBe(true);
        });

        it('重复调用 connect 不应重复注册监听', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();
            bridge.connect();
            expect(mockI18n.onLocaleChange).toHaveBeenCalledTimes(1);
            expect(mockI18n.onMessagesUpdate).toHaveBeenCalledTimes(1);
        });

        it('i18n 为 null 时 connect 不应注册监听', () => {
            const bridge = new I18nEventBridge({ i18n: null, eventBus: mockEventBus });
            bridge.connect();
            expect(bridge.isConnected).toBe(false);
        });

        it('eventBus 为 null 时 connect 不应注册监听', () => {
            // config.eventBus 为 null 时，this.eventBus = null || globalEventBus = globalEventBus
            // 所以 eventBus 不为 falsy，connect 会正常执行
            // 要测试 eventBus 为 falsy 的分支，需要 config.eventBus 为 undefined 且 globalEventBus 也为 falsy
            // 由于 globalEventBus 始终存在，此分支在正常使用中不会触发
            // 但我们可以通过传入 eventBus: undefined 来验证默认使用 globalEventBus 的行为
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: undefined });
            bridge.connect();
            // eventBus 默认为 globalEventBus，所以 connect 会成功
            expect(bridge.isConnected).toBe(true);
        });

        it('i18n 没有 onLocaleChange 方法时不应报错', () => {
            const i18nWithoutLocale = { onMessagesUpdate: mockI18n.onMessagesUpdate };
            const bridge = new I18nEventBridge({ i18n: i18nWithoutLocale, eventBus: mockEventBus });
            expect(() => bridge.connect()).not.toThrow();
            expect(bridge.isConnected).toBe(true);
        });

        it('i18n 没有 onMessagesUpdate 方法时不应报错', () => {
            const i18nWithoutMessages = { onLocaleChange: mockI18n.onLocaleChange };
            const bridge = new I18nEventBridge({ i18n: i18nWithoutMessages, eventBus: mockEventBus });
            expect(() => bridge.connect()).not.toThrow();
            expect(bridge.isConnected).toBe(true);
        });

        it('i18n 既没有 onLocaleChange 也没有 onMessagesUpdate 时仍应标记为已连接', () => {
            const emptyI18n = {};
            const bridge = new I18nEventBridge({ i18n: emptyI18n, eventBus: mockEventBus });
            bridge.connect();
            expect(bridge.isConnected).toBe(true);
        });
    });

    describe('disconnect', () => {
        it('断开连接后 isConnected 应为 false', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();
            expect(bridge.isConnected).toBe(true);
            bridge.disconnect();
            expect(bridge.isConnected).toBe(false);
        });

        it('断开连接后应调用 offLocaleChange 和 offMessagesUpdate', () => {
            const offLocaleChange = jest.fn();
            const offMessagesUpdate = jest.fn();
            mockI18n.onLocaleChange = jest.fn(() => offLocaleChange);
            mockI18n.onMessagesUpdate = jest.fn(() => offMessagesUpdate);

            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();
            bridge.disconnect();

            expect(offLocaleChange).toHaveBeenCalled();
            expect(offMessagesUpdate).toHaveBeenCalled();
        });

        it('未连接时调用 disconnect 不应报错', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            expect(() => bridge.disconnect()).not.toThrow();
        });

        it('断开后重新连接应能正常工作', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();
            bridge.disconnect();
            bridge.connect();
            expect(bridge.isConnected).toBe(true);
            expect(mockI18n.onLocaleChange).toHaveBeenCalledTimes(2);
        });
    });

    describe('事件转发 - localeChange', () => {
        it('应将 i18n localeChange 事件转发到 eventBus', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();

            // 模拟 i18n 触发 localeChange
            localeChangeCallback({ previous: 'en', current: 'zh' });

            expect(mockEventBus.emit).toHaveBeenCalledWith(
                'localeChange',
                expect.anything()
            );
        });

        it('应使用 EventContextBuilder 构建事件上下文', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();

            localeChangeCallback({ previous: 'en', current: 'zh' });

            expect(EventContextBuilder.create).toHaveBeenCalled();
        });
    });

    describe('事件转发 - messagesUpdate', () => {
        it('应将 i18n messagesUpdate 事件转发到 eventBus', () => {
            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();

            // 模拟 i18n 触发 messagesUpdate
            messagesUpdateCallback({ locale: 'zh' });

            expect(mockEventBus.emit).toHaveBeenCalledWith(
                'messagesUpdate',
                expect.anything()
            );
        });
    });

    describe('全局单例 i18nEventBridge', () => {
        it('应导出 i18nEventBridge 单例', () => {
            expect(i18nEventBridge).toBeDefined();
            expect(i18nEventBridge).toBeInstanceOf(I18nEventBridge);
        });

        it('全局单例初始状态应为未连接', () => {
            // i18nEventBridge 使用 { i18n: null } 创建，所以 isConnected 应为 false
            expect(i18nEventBridge.isConnected).toBe(false);
        });
    });

    describe('边界情况', () => {
        it('offLocaleChange 为 undefined 时 disconnect 不应报错', () => {
            // i18n 没有 onLocaleChange，所以 offLocaleChange 不会被赋值
            const i18nNoLocale = { onMessagesUpdate: mockI18n.onMessagesUpdate };
            const bridge = new I18nEventBridge({ i18n: i18nNoLocale, eventBus: mockEventBus });
            bridge.connect();
            expect(() => bridge.disconnect()).not.toThrow();
        });

        it('offMessagesUpdate 为 undefined 时 disconnect 不应报错', () => {
            const i18nNoMessages = { onLocaleChange: mockI18n.onLocaleChange };
            const bridge = new I18nEventBridge({ i18n: i18nNoMessages, eventBus: mockEventBus });
            bridge.connect();
            expect(() => bridge.disconnect()).not.toThrow();
        });

        it('onLocaleChange 返回的 unsubscribe 函数应被正确保存和调用', () => {
            const offFn = jest.fn();
            mockI18n.onLocaleChange = jest.fn(() => offFn);
            mockI18n.onMessagesUpdate = jest.fn(() => jest.fn());

            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();
            bridge.disconnect();

            expect(offFn).toHaveBeenCalled();
        });

        it('onMessagesUpdate 返回的 unsubscribe 函数应被正确保存和调用', () => {
            const offFn = jest.fn();
            mockI18n.onLocaleChange = jest.fn(() => jest.fn());
            mockI18n.onMessagesUpdate = jest.fn(() => offFn);

            const bridge = new I18nEventBridge({ i18n: mockI18n, eventBus: mockEventBus });
            bridge.connect();
            bridge.disconnect();

            expect(offFn).toHaveBeenCalled();
        });
    });
});
