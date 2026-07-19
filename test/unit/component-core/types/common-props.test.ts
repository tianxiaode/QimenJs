import { DEFAULT_NODE_PROP_MAP } from '@/component-core/types/common-props';

describe('common-props', () => {
    it('DEFAULT_NODE_PROP_MAP 包含基础属性', () => {
        expect(DEFAULT_NODE_PROP_MAP.cls.domAttr).toBe('className');
        expect(DEFAULT_NODE_PROP_MAP.hidden.domAttr).toBe('hidden');
    });

    it('CSS 属性映射正确', () => {
        expect(DEFAULT_NODE_PROP_MAP.width.cssProp).toBe('width');
        expect(DEFAULT_NODE_PROP_MAP.width.autoPx).toBe(true);
    });

    it('HTML 属性映射正确', () => {
        expect(DEFAULT_NODE_PROP_MAP.role.attr).toBe('role');
        expect(DEFAULT_NODE_PROP_MAP.ariaLabel.attr).toBe('aria-label');
    });
});
