/**
 * IndicatorAbility 单元测试
 */

jest.mock('@/context', () => ({
    EventContextBuilder: {
        create: jest.fn(() => ({
            withEvent: jest.fn(function (this: any) {
                return this;
            }),
            withType: jest.fn(function (this: any) {
                return this;
            }),
            withSource: jest.fn(function (this: any) {
                return this;
            }),
            withSourceType: jest.fn(function (this: any) {
                return this;
            }),
            withData: jest.fn(function (this: any) {
                return this;
            }),
            withBusId: jest.fn(function (this: any) {
                return this;
            }),
            build: jest.fn(() => ({})),
        })),
    },
}));

jest.mock('@/events', () => ({
    OVERLAY_ACTIONS: {
        CHANGE: 'change',
    },
}));

import { IndicatorAbility } from '@/component-abilities/indicator/IndicatorAbility';

const activeIndexDesc = Object.getOwnPropertyDescriptor(IndicatorAbility, 'activeIndex')!;
const indicatorConfigDesc = Object.getOwnPropertyDescriptor(IndicatorAbility, 'indicatorConfig')!;
const indicatorFloatDesc = Object.getOwnPropertyDescriptor(IndicatorAbility, 'indicatorFloat')!;

describe('IndicatorAbility', () => {
    function createInstance() {
        const stateMap = new Map();
        const inst: any = {
            id: 'comp-1',
            setAbilityState: jest.fn((key: string, val: any) => stateMap.set(key, val)),
            abilityState: jest.fn((key: string) => stateMap.get(key)),
            overlayEmit: jest.fn(),
            count: 5,
            updateIndicator: jest.fn(),
        };
        Object.defineProperty(inst, 'activeIndex', activeIndexDesc);
        Object.defineProperty(inst, 'indicatorConfig', indicatorConfigDesc);
        Object.defineProperty(inst, 'indicatorFloat', indicatorFloatDesc);
        return inst;
    }

    describe('initIndicator', () => {
        it('默认配置初始化', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot' });
            expect(inst.setAbilityState).toHaveBeenCalled();
        });

        it('自定义 activeIndex', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot', activeIndex: 2 });
            expect(inst.activeIndex).toBe(2);
        });
    });

    describe('activeIndex getter/setter', () => {
        it('getter 返回当前索引', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot' });
            expect(inst.activeIndex).toBe(0);
        });

        it('setter 更新索引并通知浮层', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot' });
            inst.activeIndex = 3;
            expect(inst.updateIndicator).toHaveBeenCalledWith({ activeIndex: 3 });
        });

        it('无状态时 getter 返回 0', () => {
            const inst = { abilityState: jest.fn(() => undefined) };
            expect(activeIndexDesc.get!.call(inst)).toBe(0);
        });
    });

    describe('indicatorConfig', () => {
        it('返回配置', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot', placement: 'top' });
            expect(inst.indicatorConfig?.type).toBe('dot');
        });

        it('无状态返回 undefined', () => {
            const inst = { abilityState: jest.fn(() => undefined) };
            expect(indicatorConfigDesc.get!.call(inst)).toBeUndefined();
        });
    });

    describe('indicatorFloat', () => {
        it('生成浮层声明', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot' });
            const floatDecl = inst.indicatorFloat;
            expect(floatDecl).toBeDefined();
            expect(floatDecl?.indicator.type).toBe('Indicator');
        });

        it('无配置返回 undefined', () => {
            const inst = createInstance();
            expect(inst.indicatorFloat).toBeUndefined();
        });

        it('button 类型映射为 Button', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'button' });
            const floatDecl = inst.indicatorFloat;
            expect(floatDecl?.indicator.defaultItemType).toBe('Button');
        });
    });

    describe('prevIndicator / nextIndicator', () => {
        it('prevIndicator 减少索引', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot', activeIndex: 2 });
            IndicatorAbility.prevIndicator.call(inst);
            expect(inst.activeIndex).toBe(1);
        });

        it('prevIndicator 索引为 0 不变', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot', activeIndex: 0 });
            IndicatorAbility.prevIndicator.call(inst);
            expect(inst.activeIndex).toBe(0);
        });

        it('nextIndicator 增加索引', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot', activeIndex: 1 });
            IndicatorAbility.nextIndicator.call(inst);
            expect(inst.activeIndex).toBe(2);
        });

        it('nextIndicator 到最大索引不变', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot', activeIndex: 4 });
            inst.count = 5;
            IndicatorAbility.nextIndicator.call(inst);
            expect(inst.activeIndex).toBe(4);
        });
    });

    describe('updateIndicator', () => {
        it('发送 overlay 事件', () => {
            const inst = createInstance();
            IndicatorAbility.initIndicator.call(inst, { type: 'dot' });
            IndicatorAbility.updateIndicator.call(inst, { activeIndex: 1 });
            expect(inst.overlayEmit).toHaveBeenCalled();
        });
    });
});
