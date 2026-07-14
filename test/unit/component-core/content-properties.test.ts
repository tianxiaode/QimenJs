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
import type { ContentInfo } from '@/component-core/template-types';

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
        const result = translateI18nKey('some.key');
        expect(typeof result).toBe('string');
    });
});

// ============================================
// buildContentProperties
// ============================================

describe('buildContentProperties', () => {
    function createHost(infos: ContentInfo[]) {
        // 创建一个带 nodeMap 的宿主对象
        const nodeMap: Record<string, any> = {};
        for (const info of infos) {
            let el: HTMLElement;
            if (info.mode === 'value') {
                el = document.createElement('input');
            } else if (info.mode === 'src') {
                el = document.createElement('img');
            } else {
                el = document.createElement('span');
            }
            if (!nodeMap[info.group]) nodeMap[info.group] = {};
            nodeMap[info.group][info.name] = { el };
        }

        const host: any = { nodeMap };
        const proto = {};

        buildContentProperties(proto, infos);

        // 将属性绑定到 host
        for (const key of Object.keys(proto)) {
            const desc = Object.getOwnPropertyDescriptor(proto, key)!;
            Object.defineProperty(host, key, desc);
        }

        return host;
    }

    it('单区域模式 — 生成 name 属性', () => {
        const infos: ContentInfo[] = [
            { group: 'btn', name: 'text', mode: 'html', propName: 'text' },
        ];
        const host = createHost(infos);

        expect(typeof host.text).toBe('string');
        host.text = 'Click Me';
        expect(host.text).toBe('Click Me');
    });

    it('多区域模式 — 生成 group+Name 属性', () => {
        const infos: ContentInfo[] = [
            { group: 'btn', name: 'text', mode: 'html', propName: 'btnText' },
        ];
        const host = createHost(infos);

        expect(typeof host.btnText).toBe('string');
        host.btnText = 'Click Me';
        expect(host.btnText).toBe('Click Me');
    });

    it('无冒号 — name 为 _ 时用 group 做属性名', () => {
        const infos: ContentInfo[] = [
            { group: 'text', name: '_', mode: 'html', propName: 'text' },
        ];
        const host = createHost(infos);

        expect(typeof host.text).toBe('string');
        host.text = 'Hello';
        expect(host.text).toBe('Hello');
    });

    it('mode=value 时读写 input.value', () => {
        const infos: ContentInfo[] = [
            { group: 'form', name: 'field', mode: 'value', propName: 'field' },
        ];
        const host = createHost(infos);

        host.field = 'typed value';
        expect(host.field).toBe('typed value');
    });

    it('mode=src 时读写 img.src', () => {
        const infos: ContentInfo[] = [
            { group: 'avatar', name: 'img', mode: 'src', propName: 'img' },
        ];
        const host = createHost(infos);

        host.img = 'http://example.com/pic.png';
        expect(host.img).toBe('http://example.com/pic.png');
    });

    it('hidden 属性可读写', () => {
        const infos: ContentInfo[] = [
            { group: 'btn', name: 'text', mode: 'html', propName: 'text' },
        ];
        const host = createHost(infos);

        expect(host.textHidden).toBe(false);
        host.textHidden = true;
        expect(host.textHidden).toBe(true);
    });

    it('nodeMap 中无对应 el 时 getter 返回空字符串', () => {
        const infos: ContentInfo[] = [
            { group: 'btn', name: 'text', mode: 'html', propName: 'text' },
        ];
        const host: any = { nodeMap: {} };
        const proto = {};
        buildContentProperties(proto, infos);
        for (const key of Object.keys(proto)) {
            const desc = Object.getOwnPropertyDescriptor(proto, key)!;
            Object.defineProperty(host, key, desc);
        }

        expect(host.text).toBe('');
    });

    it('nodeMap 中无对应 el 时 setter 不报错', () => {
        const infos: ContentInfo[] = [
            { group: 'btn', name: 'text', mode: 'html', propName: 'text' },
        ];
        const host: any = { nodeMap: {} };
        const proto = {};
        buildContentProperties(proto, infos);
        for (const key of Object.keys(proto)) {
            const desc = Object.getOwnPropertyDescriptor(proto, key)!;
            Object.defineProperty(host, key, desc);
        }

        expect(() => { host.text = 'test'; }).not.toThrow();
    });

    it('返回的 propNames 列表正确', () => {
        const infos: ContentInfo[] = [
            { group: 'btn', name: 'text', mode: 'html', propName: 'text' },
            { group: 'btn', name: 'icon', mode: 'html', propName: 'icon' },
        ];
        const proto = {};
        const propNames = buildContentProperties(proto, infos);

        expect(propNames).toContain('text');
        expect(propNames).toContain('icon');
    });
});
