import { AnimationAbility } from '@/component-core/abilities/AnimationAbility';

describe('AnimationAbility', () => {
    it('提供 playEnter 方法', () => {
        expect(typeof AnimationAbility.playEnter).toBe('function');
    });

    it('提供 playLeave 方法', () => {
        expect(typeof AnimationAbility.playLeave).toBe('function');
    });

    it('无动画配置时 playEnter 不报错', () => {
        const el = document.createElement('div');
        const ctor = {};
        const instance = { el, constructor: ctor };
        expect(() => AnimationAbility.playEnter.call(instance)).not.toThrow();
    });

    it('无动画配置时 playLeave 返回 resolved Promise', async () => {
        const el = document.createElement('div');
        const ctor = {};
        const instance = { el, constructor: ctor };
        const result = AnimationAbility.playLeave.call(instance);
        await expect(result).resolves.toBeUndefined();
    });

    it('有 enter 动画配置时播放动画', () => {
        const el = document.createElement('div');
        const animateSpy = jest.fn(() => ({ finished: Promise.resolve() }));
        el.animate = animateSpy;
        const ctor = { _animation: { enter: 'fadeIn', duration: 200 } };
        const instance = Object.create(AnimationAbility);
        instance.el = el;
        instance.constructor = ctor;
        instance.playEnter();
        expect(animateSpy).toHaveBeenCalled();
    });

    it('_animDecl 从 constructor._animation 读取', () => {
        const decl = { enter: 'fadeIn' };
        const ctor = { _animation: decl };
        const instance = { constructor: ctor };
        const getter = Object.getOwnPropertyDescriptor(AnimationAbility, '_animDecl')!.get!;
        expect(getter.call(instance)).toBe(decl);
    });

    it('_animDecl 无配置时返回 undefined', () => {
        const ctor = {};
        const instance = { constructor: ctor };
        const getter = Object.getOwnPropertyDescriptor(AnimationAbility, '_animDecl')!.get!;
        expect(getter.call(instance)).toBeUndefined();
    });
});
