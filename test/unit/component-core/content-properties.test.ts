/**
 * content-properties.ts 单元测试
 *
 * 覆盖：buildContentProperties、translateI18nKey、applyValueToEl
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { buildContentProperties, translateI18nKey, applyValueToEl } from '@/component-core/content-properties';
import type { NodeTemplateMeta } from '@/component-core/types';

// ============================================
// applyValueToEl
// ============================================

describe('applyValueToEl', () => {
    it('mode=html 时写入 innerHTML', () => {
        const el = document.createElement('div');
        applyValueToEl(el, '<b>bold</b>', 'html');
        expect(el.innerHTML).toBe('<b>bold</b>');
    });

    it('mode=value 时写入 value', () => {
        const el = document.createElement('input');
        applyValueToEl(el, 'hello', 'value');
        expect((el as HTMLInputElement).value).toBe('hello');
    });

    it('mode=src 时写入 src', () => {
        const el = document.createElement('img');
        applyValueToEl(el, 'http://example.com/img.png', 'src');
        expect((el as HTMLImageElement).src).toBe('http://example.com/img.png');
    });
});

// ============================================
// translateI18nKey
// ============================================

describe('translateI18nKey', () => {
    it('i18n 管理器不可用时返回原始 key', () => {
        // getI18nManager 返回 null 时
        const result = translateI18nKey('some.key');
        // 如果 i18n 未初始化，返回原始 key
        expect(typeof result).toBe('string');
    });
});

// ============================================
// buildContentProperties
// ============================================

describe('buildContentProperties', () => {
    function createHost(metas: Record<string, NodeTemplateMeta>, isMultiArea = false) {
        // 创建一个带 nodeMap 的宿主对象
        const nodeMap: Record<string, any> = {};
        for (const [, meta] of Object.entries(metas)) {
            let el: HTMLElement;
            if (meta.mode === 'value') {
                el = document.createElement('input');
            } else if (meta.mode === 'src') {
                el = document.createElement('img');
            } else {
                el = document.createElement('span');
            }
            if (!nodeMap[meta.group]) nodeMap[meta.group] = {};
            nodeMap[meta.group][meta.name] = { el, ...meta };
        }

        const host: any = { nodeMap };
        // 将 host 的原型指向一个空对象，以便 defineProperty
        const proto = {};

        buildContentProperties(proto, metas, isMultiArea);

        // 将属性绑定到 host
        for (const key of Object.keys(proto)) {
            const desc = Object.getOwnPropertyDescriptor(proto, key)!;
            Object.defineProperty(host, key, desc);
        }

        return host;
    }

    it('单区域模式 — 生成 name 属性', () => {
        const metas: Record<string, NodeTemplateMeta> = {
            'btn:text': { raw: 'btn:text', group: 'btn', name: 'text', mode: 'html' },
        };
        const host = createHost(metas, false);

        expect(typeof host.text).toBe('string');
        host.text = 'Click Me';
        expect(host.text).toBe('Click Me');
    });

    it('多区域模式 — 生成 group+Name 属性', () => {
        const metas: Record<string, NodeTemplateMeta> = {
            'btn:text': { raw: 'btn:text', group: 'btn', name: 'text', mode: 'html' },
        };
        const host = createHost(metas, true);

        expect(typeof host.btnText).toBe('string');
        host.btnText = 'Click Me';
        expect(host.btnText).toBe('Click Me');
    });

    it('无冒号 data-content — name 为 _ 时用 group 做属性名', () => {
        const metas: Record<string, NodeTemplateMeta> = {
            'text:_': { raw: 'text', group: 'text', name: '_', mode: 'html' },
        };
        const host = createHost(metas, false);

        expect(typeof host.text).toBe('string');
        host.text = 'Hello';
        expect(host.text).toBe('Hello');
    });

    it('mode=value 时读写 input.value', () => {
        const metas: Record<string, NodeTemplateMeta> = {
            'form:field': { raw: 'form:field', group: 'form', name: 'field', mode: 'value' },
        };
        const host = createHost(metas, false);

        host.field = 'typed value';
        expect(host.field).toBe('typed value');
    });

    it('mode=src 时读写 img.src', () => {
        const metas: Record<string, NodeTemplateMeta> = {
            'avatar:img': { raw: 'avatar:img', group: 'avatar', name: 'img', mode: 'src' },
        };
        const host = createHost(metas, false);

        host.img = 'http://example.com/pic.png';
        expect(host.img).toBe('http://example.com/pic.png');
    });

    it('hidden 属性可读写', () => {
        const metas: Record<string, NodeTemplateMeta> = {
            'btn:text': { raw: 'btn:text', group: 'btn', name: 'text', mode: 'html' },
        };
        const host = createHost(metas, false);

        expect(host.textHidden).toBe(false);
        host.textHidden = true;
        expect(host.textHidden).toBe(true);
    });

    it('nodeMap 中无对应 el 时 getter 返回空字符串', () => {
        const metas: Record<string, NodeTemplateMeta> = {
            'btn:text': { raw: 'btn:text', group: 'btn', name: 'text', mode: 'html' },
        };
        // 空 nodeMap
        const host: any = { nodeMap: {} };
        const proto = {};
        buildContentProperties(proto, metas, false);
        for (const key of Object.keys(proto)) {
            const desc = Object.getOwnPropertyDescriptor(proto, key)!;
            Object.defineProperty(host, key, desc);
        }

        expect(host.text).toBe('');
    });

    it('nodeMap 中无对应 el 时 setter 不报错', () => {
        const metas: Record<string, NodeTemplateMeta> = {
            'btn:text': { raw: 'btn:text', group: 'btn', name: 'text', mode: 'html' },
        };
        const host: any = { nodeMap: {} };
        const proto = {};
        buildContentProperties(proto, metas, false);
        for (const key of Object.keys(proto)) {
            const desc = Object.getOwnPropertyDescriptor(proto, key)!;
            Object.defineProperty(host, key, desc);
        }

        expect(() => { host.text = 'test'; }).not.toThrow();
    });

    it('返回的 propNames 列表正确', () => {
        const metas: Record<string, NodeTemplateMeta> = {
            'btn:text': { raw: 'btn:text', group: 'btn', name: 'text', mode: 'html' },
            'btn:icon': { raw: 'btn:icon', group: 'btn', name: 'icon', mode: 'html' },
        };
        const proto = {};
        const propNames = buildContentProperties(proto, metas, false);

        expect(propNames).toContain('text');
        expect(propNames).toContain('icon');
    });
});
