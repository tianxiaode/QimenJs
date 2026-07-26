import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';

class MockComponent {
    constructor(public props?: Record<string, any>) {}
}

class AnotherComponent {
    constructor(public props?: Record<string, any>) {}
}

describe('ComponentRegistrar', () => {
    let registrar: ComponentRegistrar;

    beforeEach(() => {
        registrar = new ComponentRegistrar();
    });

    it('注册并获取组件类', () => {
        registrar.register('Button', MockComponent);
        expect(registrar.get('Button')).toBe(MockComponent);
    });

    it('注册带元数据的组件', () => {
        registrar.register('Button', MockComponent, { defaultEventData: ['click', 'focus'] });
        expect(registrar.getMeta('Button')).toEqual({ defaultEventData: ['click', 'focus'] });
    });

    it('has 返回是否已注册', () => {
        expect(registrar.has('Button')).toBe(false);
        registrar.register('Button', MockComponent);
        expect(registrar.has('Button')).toBe(true);
    });

    it('getAll 返回所有已注册组件', () => {
        registrar.register('Button', MockComponent);
        registrar.register('Input', AnotherComponent);
        expect(registrar.getAll()).toEqual([MockComponent, AnotherComponent]);
    });

    it('注销组件', () => {
        registrar.register('Button', MockComponent);
        registrar.unregister('Button');
        expect(registrar.has('Button')).toBe(false);
        expect(registrar.get('Button')).toBeUndefined();
    });

    it('注销组件同时清除元数据', () => {
        registrar.register('Button', MockComponent, { defaultEventData: ['click'] });
        registrar.unregister('Button');
        expect(registrar.getMeta('Button')).toBeUndefined();
    });

    it('setMeta 更新组件元数据', () => {
        registrar.register('Button', MockComponent);
        registrar.setMeta('Button', { defaultEventData: ['tap'] });
        expect(registrar.getMeta('Button')).toEqual({ defaultEventData: ['tap'] });
    });

    it('get 返回 undefined 表示未注册', () => {
        expect(registrar.get('NonExist')).toBeUndefined();
    });

    it('getMeta 返回 undefined 表示无元数据', () => {
        registrar.register('Button', MockComponent);
        expect(registrar.getMeta('Button')).toBeUndefined();
    });
});
