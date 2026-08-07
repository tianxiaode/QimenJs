import { AnimationAbility } from '@/component-core/abilities/AnimationAbility';

describe('AnimationAbility', () => {
    describe('_animDecl getter', () => {
        it('从 constructor._animation 读取', () => {
            const decl = { enter: 'fadeIn' };
            const ctor = { _animation: decl };
            const instance = { constructor: ctor };
            const getter = Object.getOwnPropertyDescriptor(AnimationAbility, '_animDecl')!.get!;
            expect(getter.call(instance)).toBe(decl);
        });

        it('无配置时返回 undefined', () => {
            const ctor = {};
            const instance = { constructor: ctor };
            const getter = Object.getOwnPropertyDescriptor(AnimationAbility, '_animDecl')!.get!;
            expect(getter.call(instance)).toBeUndefined();
        });
    });

    describe('playEnter', () => {
        it('提供方法', () => {
            expect(typeof AnimationAbility.playEnter).toBe('function');
        });

        it('无动画配置时不报错', () => {
            const el = document.createElement('div');
            const ctor = {};
            const instance = { el, constructor: ctor };
            expect(() => AnimationAbility.playEnter.call(instance)).not.toThrow();
        });

        it('动画禁用时不播放', () => {
            const el = document.createElement('div');
            const animateSpy = jest.fn();
            (el as any).animate = animateSpy;
            const ctor = { _animation: { enter: 'fadeIn', enabled: false } };
            const instance = { el, constructor: ctor };
            AnimationAbility.playEnter.call(instance);
            expect(animateSpy).not.toHaveBeenCalled();
        });

        it('有 enter 动画配置时播放动画', () => {
            const el = document.createElement('div');
            const animateSpy = jest.fn(() => ({ finished: Promise.resolve() }));
            (el as any).animate = animateSpy;
            const ctor = { _animation: { enter: 'fadeIn', duration: 200 } };
            const instance = { el, constructor: ctor } as any;
            Object.setPrototypeOf(instance, AnimationAbility);
            instance.playEnter();
            expect(animateSpy).toHaveBeenCalled();
            expect(animateSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    duration: 200,
                    easing: 'ease',
                    fill: 'forwards',
                })
            );
        });

        it('使用自定义关键帧', () => {
            const el = document.createElement('div');
            const animateSpy = jest.fn();
            (el as any).animate = animateSpy;
            const customKeyframes = [{ opacity: 0 }, { opacity: 1 }];
            const ctor = {
                _animation: {
                    enter: 'fadeIn',
                    enterKeyframes: customKeyframes,
                    duration: 300,
                },
            };
            const instance = { el, constructor: ctor } as any;
            Object.setPrototypeOf(instance, AnimationAbility);
            instance.playEnter();
            expect(animateSpy).toHaveBeenCalledWith(customKeyframes, expect.anything());
        });

        it('使用自定义 easing', () => {
            const el = document.createElement('div');
            const animateSpy = jest.fn();
            (el as any).animate = animateSpy;
            const ctor = { _animation: { enter: 'fadeIn', easing: 'ease-in-out' } };
            const instance = { el, constructor: ctor } as any;
            Object.setPrototypeOf(instance, AnimationAbility);
            instance.playEnter();
            expect(animateSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ easing: 'ease-in-out' })
            );
        });

        it('无 el 时不报错', () => {
            const ctor = { _animation: { enter: 'fadeIn' } };
            const instance = { constructor: ctor };
            expect(() => AnimationAbility.playEnter.call(instance)).not.toThrow();
        });

        it('enter 为空时不播放', () => {
            const el = document.createElement('div');
            const animateSpy = jest.fn();
            (el as any).animate = animateSpy;
            const ctor = { _animation: {} };
            const instance = { el, constructor: ctor };
            AnimationAbility.playEnter.call(instance);
            expect(animateSpy).not.toHaveBeenCalled();
        });
    });

    describe('playLeave', () => {
        it('提供方法', () => {
            expect(typeof AnimationAbility.playLeave).toBe('function');
        });

        it('无动画配置时返回 resolved Promise', async () => {
            const el = document.createElement('div');
            const ctor = {};
            const instance = { el, constructor: ctor };
            const result = AnimationAbility.playLeave.call(instance);
            await expect(result).resolves.toBeUndefined();
        });

        it('动画禁用时返回 resolved Promise', async () => {
            const el = document.createElement('div');
            const animateSpy = jest.fn();
            (el as any).animate = animateSpy;
            const ctor = { _animation: { leave: 'fadeOut', enabled: false } };
            const instance = { el, constructor: ctor };
            const result = AnimationAbility.playLeave.call(instance);
            await expect(result).resolves.toBeUndefined();
            expect(animateSpy).not.toHaveBeenCalled();
        });

        it('有 leave 动画配置时播放动画并返回 Promise', async () => {
            const el = document.createElement('div');
            const finishedPromise = Promise.resolve();
            const animateSpy = jest.fn(() => ({ finished: finishedPromise }));
            (el as any).animate = animateSpy;
            const ctor = { _animation: { leave: 'fadeOut', duration: 250 } };
            const instance = { el, constructor: ctor } as any;
            Object.setPrototypeOf(instance, AnimationAbility);
            const result = instance.playLeave();
            expect(animateSpy).toHaveBeenCalled();
            expect(animateSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    duration: 250,
                    easing: 'ease',
                    fill: 'forwards',
                })
            );
            await expect(result).resolves.toBeUndefined();
        });

        it('使用自定义关键帧', () => {
            const el = document.createElement('div');
            const animateSpy = jest.fn(() => ({ finished: Promise.resolve() }));
            (el as any).animate = animateSpy;
            const customKeyframes = [{ opacity: 1 }, { opacity: 0 }];
            const ctor = {
                _animation: {
                    leave: 'fadeOut',
                    leaveKeyframes: customKeyframes,
                    duration: 300,
                },
            };
            const instance = { el, constructor: ctor } as any;
            Object.setPrototypeOf(instance, AnimationAbility);
            instance.playLeave();
            expect(animateSpy).toHaveBeenCalledWith(customKeyframes, expect.anything());
        });

        it('无 el 时返回 resolved Promise', async () => {
            const ctor = { _animation: { leave: 'fadeOut' } };
            const instance = { constructor: ctor };
            const result = AnimationAbility.playLeave.call(instance);
            await expect(result).resolves.toBeUndefined();
        });

        it('leave 为空时返回 resolved Promise', async () => {
            const el = document.createElement('div');
            const animateSpy = jest.fn();
            (el as any).animate = animateSpy;
            const ctor = { _animation: {} };
            const instance = { el, constructor: ctor };
            const result = AnimationAbility.playLeave.call(instance);
            await expect(result).resolves.toBeUndefined();
            expect(animateSpy).not.toHaveBeenCalled();
        });

        it('enter 预设名称不存在时不播放', () => {
            const el = document.createElement('div');
            const animateSpy = jest.fn();
            (el as any).animate = animateSpy;
            const ctor = { _animation: { enter: 'nonExistentAnimation' } };
            const instance = { el, constructor: ctor };
            AnimationAbility.playEnter.call(instance);
            expect(animateSpy).not.toHaveBeenCalled();
        });

        it('leave 预设名称不存在时返回 resolved Promise', async () => {
            const el = document.createElement('div');
            const animateSpy = jest.fn();
            (el as any).animate = animateSpy;
            const ctor = { _animation: { leave: 'nonExistentAnimation' } };
            const instance = { el, constructor: ctor };
            const result = AnimationAbility.playLeave.call(instance);
            await expect(result).resolves.toBeUndefined();
            expect(animateSpy).not.toHaveBeenCalled();
        });
    });
});
