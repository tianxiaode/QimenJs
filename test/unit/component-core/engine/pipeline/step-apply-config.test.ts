jest.mock('@qimenjs/i18n', () => ({
    resolveI18nValue: (v: string) => v.startsWith('i18n:') ? v.slice(5).toUpperCase() : v,
}));

import { applyConfig } from '@/component-core/engine/pipeline/step-apply-config';

describe('step-apply-config', () => {
    it('_rawProps 为空时提前返回', () => {
        const ctx = { instance: { _rawProps: {} } } as any;
        expect(() => applyConfig(ctx)).not.toThrow();
    });

    it('_rawProps 非对象时提前返回', () => {
        const ctx = { instance: { _rawProps: null } } as any;
        expect(() => applyConfig(ctx)).not.toThrow();
    });

    it('cls 走 addCls 追加语义', () => {
        const addClsSpy = jest.fn();
        const ctx = {
            instance: {
                _rawProps: { cls: 'my-class' },
                addCls: addClsSpy,
            },
        } as any;
        applyConfig(ctx);
        expect(addClsSpy).toHaveBeenCalledWith('my-class');
    });

    it('DEFAULT_NODE_PROP_MAP 属性走 _updateNode', () => {
        const updateNodeSpy = jest.fn();
        const ctx = {
            instance: {
                _rawProps: { hidden: true, width: 100 },
                _updateNode: updateNodeSpy,
            },
        } as any;
        applyConfig(ctx);
        expect(updateNodeSpy).toHaveBeenCalledWith('root', { hidden: true });
        expect(updateNodeSpy).toHaveBeenCalledWith('root', { width: 100 });
    });

    it('自定义属性走组件 setter', () => {
        const instance = {
            _rawProps: { customProp: 'hello' },
            customProp: '',
        };
        const ctx = { instance } as any;
        applyConfig(ctx);
        expect(instance.customProp).toBe('hello');
    });

    it('i18n: 前缀值 resolve 后赋值并记录 _i18nFields', () => {
        const updateNodeSpy = jest.fn();
        const instance = {
            _rawProps: { hint: 'i18n:button.hint' },
            _updateNode: updateNodeSpy,
        };
        const ctx = { instance } as any;
        applyConfig(ctx);
        expect(instance._i18nFields).toEqual({ hint: 'button.hint' });
        expect(updateNodeSpy).toHaveBeenCalledWith('root', { hint: 'BUTTON.HINT' });
    });

    it('i18n: 前缀值走组件 setter', () => {
        const instance = {
            _rawProps: { title: 'i18n:dialog.title' },
            title: '',
        };
        const ctx = { instance } as any;
        applyConfig(ctx);
        expect(instance._i18nFields).toEqual({ title: 'dialog.title' });
        expect(instance.title).toBe('DIALOG.TITLE');
    });

    it('undefined 值跳过', () => {
        const updateNodeSpy = jest.fn();
        const instance = {
            _rawProps: { hidden: undefined, cls: undefined },
            _updateNode: updateNodeSpy,
            addCls: jest.fn(),
        };
        const ctx = { instance } as any;
        applyConfig(ctx);
        expect(updateNodeSpy).not.toHaveBeenCalled();
    });

    it('cls 不在 DEFAULT_NODE_PROP_MAP 属性中时也不走 _updateNode', () => {
        const updateNodeSpy = jest.fn();
        const addClsSpy = jest.fn();
        const ctx = {
            instance: {
                _rawProps: { cls: 'a b', hidden: true },
                _updateNode: updateNodeSpy,
                addCls: addClsSpy,
            },
        } as any;
        applyConfig(ctx);
        expect(addClsSpy).toHaveBeenCalledWith('a b');
        expect(updateNodeSpy).toHaveBeenCalledWith('root', { hidden: true });
        expect(updateNodeSpy).not.toHaveBeenCalledWith('root', expect.objectContaining({ cls: expect.anything() }));
    });
});