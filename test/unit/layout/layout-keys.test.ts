/**
 * layout-keys BADGE_KEYS / COLOR_VARIANT_KEYS 单元测试
 *
 * 覆盖：BADGE_KEYS / COLOR_VARIANT_KEYS 常量、RESERVED_KEYS 包含、KNOWN_PROP_KEYS 包含
 */

import {
    BADGE_KEYS,
    COLOR_VARIANT_KEYS,
    RESERVED_KEYS,
    KNOWN_PROP_KEYS,
} from '@/layout/layout-keys';

describe('layout-keys — BADGE_KEYS', () => {
    it('BADGE_KEYS 包含所有 badge 属性', () => {
        expect(BADGE_KEYS).toEqual(['badge', 'badgeType', 'badgePlacement', 'badgeTypeOverride']);
    });

    it('BADGE_KEYS 所有 key 在 RESERVED_KEYS 中', () => {
        for (const key of BADGE_KEYS) {
            expect(RESERVED_KEYS.has(key)).toBe(true);
        }
    });

    it('BADGE_KEYS 所有 key 在 KNOWN_PROP_KEYS 中', () => {
        for (const key of BADGE_KEYS) {
            expect(KNOWN_PROP_KEYS.has(key)).toBe(true);
        }
    });

    it('badge 不被归入 props', () => {
        // RESERVED_KEYS 包含 badge，意味着渲染时不会自动归入 layout.props
        expect(RESERVED_KEYS.has('badge')).toBe(true);
        expect(RESERVED_KEYS.has('badgeType')).toBe(true);
        expect(RESERVED_KEYS.has('badgePlacement')).toBe(true);
        expect(RESERVED_KEYS.has('badgeTypeOverride')).toBe(true);
    });
});

describe('layout-keys — COLOR_VARIANT_KEYS', () => {
    it('COLOR_VARIANT_KEYS 包含所有颜色变体属性', () => {
        expect(COLOR_VARIANT_KEYS).toEqual(['colorVariant', 'colorVariantText']);
    });

    it('COLOR_VARIANT_KEYS 所有 key 在 RESERVED_KEYS 中', () => {
        for (const key of COLOR_VARIANT_KEYS) {
            expect(RESERVED_KEYS.has(key)).toBe(true);
        }
    });

    it('COLOR_VARIANT_KEYS 所有 key 在 KNOWN_PROP_KEYS 中', () => {
        for (const key of COLOR_VARIANT_KEYS) {
            expect(KNOWN_PROP_KEYS.has(key)).toBe(true);
        }
    });

    it('colorVariant 不被归入 props', () => {
        expect(RESERVED_KEYS.has('colorVariant')).toBe(true);
        expect(RESERVED_KEYS.has('colorVariantText')).toBe(true);
    });
});
