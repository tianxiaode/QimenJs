import { copyPrototypeMethods } from '@/component-core/utils/class-copy';

describe('class-copy', () => {
    it('复制方法到目标类原型', () => {
        class Source {
            greet() {
                return 'hello';
            }
        }
        class Target {}
        copyPrototypeMethods(Source, Target);
        const instance = new (Target as any)();
        expect(instance.greet()).toBe('hello');
    });

    it('不复制数据属性', () => {
        class Source {
            greet() {
                return 'hello';
            }
        }
        (Source.prototype as any).count = 42;
        class Target {}
        copyPrototypeMethods(Source, Target);
        const instance = new (Target as any)();
        expect(instance.count).toBeUndefined();
    });

    it('不覆盖已有方法', () => {
        class Source {
            greet() {
                return 'source';
            }
        }
        class Target {
            greet() {
                return 'target';
            }
        }
        copyPrototypeMethods(Source, Target);
        const instance = new Target();
        expect(instance.greet()).toBe('target');
    });
});
