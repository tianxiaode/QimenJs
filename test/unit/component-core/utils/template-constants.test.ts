import {
    VOID_TAGS,
    ALIGN_MAP,
    PACK_MAP,
    CONTENT_MODE_MAP,
    COMMON_NODE_PROPS,
    RESERVED_KEYS,
    ANIMATION_PRESETS,
} from '@/component-core/utils/template-constants';

describe('template-constants', () => {
    it('VOID_TAGS 包含自闭合标签', () => {
        expect(VOID_TAGS.has('input')).toBe(true);
        expect(VOID_TAGS.has('img')).toBe(true);
        expect(VOID_TAGS.has('br')).toBe(true);
        expect(VOID_TAGS.has('div')).toBe(false);
    });

    it('ALIGN_MAP 映射正确', () => {
        expect(ALIGN_MAP.start).toBe('flex-start');
        expect(ALIGN_MAP.center).toBe('center');
        expect(ALIGN_MAP.end).toBe('flex-end');
        expect(ALIGN_MAP.stretch).toBe('stretch');
    });

    it('PACK_MAP 映射正确', () => {
        expect(PACK_MAP.start).toBe('flex-start');
        expect(PACK_MAP.between).toBe('space-between');
        expect(PACK_MAP.around).toBe('space-around');
    });

    it('CONTENT_MODE_MAP 包含四种模式', () => {
        expect(CONTENT_MODE_MAP.html).toEqual([{ nodeProp: 'text' }]);
        expect(CONTENT_MODE_MAP.value).toEqual([{ nodeProp: 'value' }]);
        expect(CONTENT_MODE_MAP.src).toEqual([{ nodeProp: 'src' }]);
        expect(CONTENT_MODE_MAP.link).toEqual([{ nodeProp: 'text' }, { nodeProp: 'href' }]);
    });

    it('COMMON_NODE_PROPS 包含通用属性', () => {
        expect(COMMON_NODE_PROPS).toContain('cls');
        expect(COMMON_NODE_PROPS).toContain('style');
        expect(COMMON_NODE_PROPS).toContain('hidden');
        expect(COMMON_NODE_PROPS).toContain('disabled');
    });

    it('RESERVED_KEYS 包含保留名', () => {
        expect(RESERVED_KEYS.has('constructor')).toBe(true);
        expect(RESERVED_KEYS.has('dispose')).toBe(true);
        expect(RESERVED_KEYS.has('el')).toBe(true);
        expect(RESERVED_KEYS.has('props')).toBe(true);
    });

    it('ANIMATION_PRESETS 包含预设动画', () => {
        expect(ANIMATION_PRESETS.fadeIn).toBeDefined();
        expect(ANIMATION_PRESETS.fadeOut).toBeDefined();
        expect(ANIMATION_PRESETS.slideInUp).toBeDefined();
        expect(ANIMATION_PRESETS.slideOutDown).toBeDefined();
        expect(ANIMATION_PRESETS.scaleIn).toBeDefined();
        expect(ANIMATION_PRESETS.scaleOut).toBeDefined();
        expect(ANIMATION_PRESETS.fadeIn!.length).toBe(2);
    });
});
