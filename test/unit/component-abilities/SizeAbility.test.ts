/**
 * SizeAbility 单元测试
 */

import { SizeAbility } from '@/component-abilities/size/SizeAbility';

const sizeDesc = Object.getOwnPropertyDescriptor(SizeAbility, 'size')!;

describe('SizeAbility', () => {
    function createInstance(type = 'Avatar') {
        const stateMap = new Map();
        return {
            type,
            setAbilityState: jest.fn((key: string, val: any) => stateMap.set(key, val)),
            abilityState: jest.fn((key: string) => stateMap.get(key)),
            addCls: jest.fn(),
            removeCls: jest.fn(),
        };
    }

    describe('initSize', () => {
        it('默认配置初始化', () => {
            const inst = createInstance();
            SizeAbility.initSize.call(inst);
            expect(inst.setAbilityState).toHaveBeenCalled();
            expect(inst.addCls).toHaveBeenCalledWith('q-avatar--md');
        });

        it('自定义 sizes 和 defaultSize', () => {
            const inst = createInstance('Button');
            SizeAbility.initSize.call(inst, { sizes: ['sm', 'lg'], defaultSize: 'lg' });
            expect(inst.addCls).toHaveBeenCalledWith('q-button--lg');
        });

        it('无 type 时使用 q-size-- 前缀', () => {
            const stateMap = new Map();
            const inst = {
                setAbilityState: jest.fn((key: string, val: any) => stateMap.set(key, val)),
                abilityState: jest.fn((key: string) => stateMap.get(key)),
                addCls: jest.fn(),
                removeCls: jest.fn(),
            };
            SizeAbility.initSize.call(inst);
            expect(inst.addCls).toHaveBeenCalledWith('q-size--md');
        });
    });

    describe('size getter/setter', () => {
        it('getter 返回当前尺寸', () => {
            const inst = createInstance();
            SizeAbility.initSize.call(inst);
            expect(sizeDesc.get!.call(inst)).toBe('md');
        });

        it('setter 切换尺寸并更新 CSS 类', () => {
            const inst = createInstance();
            SizeAbility.initSize.call(inst);
            inst.removeCls = jest.fn();
            inst.addCls = jest.fn();
            sizeDesc.set!.call(inst, 'lg');
            expect(inst.removeCls).toHaveBeenCalledWith('q-avatar--md');
            expect(inst.addCls).toHaveBeenCalledWith('q-avatar--lg');
        });

        it('setter 相同值不操作', () => {
            const inst = createInstance();
            SizeAbility.initSize.call(inst);
            inst.removeCls = jest.fn();
            sizeDesc.set!.call(inst, 'md');
            expect(inst.removeCls).not.toHaveBeenCalled();
        });

        it('无状态时 getter 返回默认值', () => {
            const inst = { abilityState: jest.fn(() => undefined) };
            expect(sizeDesc.get!.call(inst)).toBe('md');
        });
    });
});
