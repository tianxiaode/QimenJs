import { BODY_SPECIAL_KEYS } from '@/component-core/types/tpl-body-def';

describe('tpl-body-def', () => {
    it('static 类字段正确定义', () => {
        expect(BODY_SPECIAL_KEYS.type.category).toBe('static');
        expect(BODY_SPECIAL_KEYS.entityKey.category).toBe('static');
        expect(BODY_SPECIAL_KEYS.forwards.category).toBe('static');
        expect(BODY_SPECIAL_KEYS.forwards.alias).toBe('_forwards');
    });

    it('init 类字段正确定义', () => {
        expect(BODY_SPECIAL_KEYS.floats.category).toBe('init');
        expect(BODY_SPECIAL_KEYS.drags.category).toBe('init');
        expect(BODY_SPECIAL_KEYS.animation.category).toBe('init');
        expect(BODY_SPECIAL_KEYS.abilities.category).toBe('init');
    });

    it('hook 类字段正确定义', () => {
        expect(BODY_SPECIAL_KEYS.onInitState.category).toBe('hook');
    });
});
