import { CommonPropsAbility } from '@/component-core/abilities/CommonPropsAbility';

describe('CommonPropsAbility', () => {
    it('提供 hidden getter/setter', () => {
        expect(typeof CommonPropsAbility.hidden.get).toBe('function');
        expect(typeof CommonPropsAbility.hidden.set).toBe('function');
    });

    it('提供 disabled getter/setter', () => {
        expect(typeof CommonPropsAbility.disabled.get).toBe('function');
        expect(typeof CommonPropsAbility.disabled.set).toBe('function');
    });

    it('提供 cls getter/setter', () => {
        expect(typeof CommonPropsAbility.cls.get).toBe('function');
        expect(typeof CommonPropsAbility.cls.set).toBe('function');
    });

    it('提供 style getter/setter', () => {
        expect(typeof CommonPropsAbility.style.get).toBe('function');
        expect(typeof CommonPropsAbility.style.set).toBe('function');
    });

    it('hidden setter 调用 _markNodeDirty', () => {
        const markSpy = jest.fn();
        const instance = { _markNodeDirty: markSpy };
        CommonPropsAbility.hidden.set.call(instance, true);
        expect(markSpy).toHaveBeenCalledWith('root', { hidden: true });
    });

    it('hidden getter 调用 _getNodeProp', () => {
        const getSpy = jest.fn(() => false);
        const instance = { _getNodeProp: getSpy };
        const result = CommonPropsAbility.hidden.get.call(instance);
        expect(getSpy).toHaveBeenCalledWith('root', 'hidden');
        expect(result).toBe(false);
    });
});
