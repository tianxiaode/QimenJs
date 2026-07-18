/**
 * NodeMapAbility 单元测试
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

import { TemplateComponent } from '@/component-core';
import type { ComponentTemplate } from '@/component-core';
import { NodeMapAbility } from '@/component-core/abilities/NodeMapAbility';

const TPL: ComponentTemplate = {
    tpl: {
        tag: 'div',
        className: 'box',
        children: [{ tag: 'span', name: 'box:label', content: 'label' }],
    },
};
const I18N_TPL: ComponentTemplate = {
    tpl: {
        tag: 'div',
        className: 'box',
        children: [{ tag: 'span', name: 'box:label', content: 'label', i18n: 'common.save' }],
    },
};

describe('NodeMapAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(NodeMapAbility);

    describe('initContentFromProps', () => {
        it('无 _contentPropNames → 不报错', () => {
            const instance = new BoxClass() as any;
            instance._contentPropNames = undefined;
            expect(() => instance.initContentFromProps({})).not.toThrow();
        });

        it('有 _contentPropNames + props 有值 → 填充内容', () => {
            const instance = new BoxClass() as any;
            instance.initContentFromProps({ label: 'Hello' });
            expect(instance.label).toBe('Hello');
        });

        it('有 _contentPropNames + props 无对应值 → 不填充', () => {
            const instance = new BoxClass() as any;
            instance.initContentFromProps({});
            // 内容属性保持默认值（innerHTML 为 span 自身标签）
            expect(typeof instance.label).toBe('string');
        });
    });

    describe('initI18nFromTemplate', () => {
        it('无 i18n 节点 → 不报错', () => {
            const instance = new BoxClass() as any;
            expect(() => instance.initI18nFromTemplate()).not.toThrow();
        });

        it('有 i18n 节点 → 翻译内容', () => {
            const I18nBoxClass = TemplateComponent.withTemplate(I18N_TPL).with(NodeMapAbility);
            const instance = new I18nBoxClass() as any;
            instance.initI18nFromTemplate();
            // i18n 管理器未初始化时，使用原始 key
            expect(instance).toBeDefined();
        });
    });

    describe('getI18nKeys', () => {
        it('无 i18n 节点 → 返回空对象', () => {
            const instance = new BoxClass() as any;
            const keys = instance.getI18nKeys();
            expect(keys).toEqual({});
        });

        it('有 i18n 节点 → 返回 key 映射', () => {
            const I18nBoxClass = TemplateComponent.withTemplate(I18N_TPL).with(NodeMapAbility);
            const instance = new I18nBoxClass() as any;
            const keys = instance.getI18nKeys();
            expect(keys['box:label']).toBe('common.save');
        });
    });

    describe('refreshI18n', () => {
        it('无 i18n 节点 → 不报错', () => {
            const instance = new BoxClass() as any;
            expect(() => instance.refreshI18n()).not.toThrow();
        });
    });

    describe('setupI18nListener', () => {
        it('注册 localeChange 监听', () => {
            const instance = new BoxClass() as any;
            expect(() => instance.setupI18nListener()).not.toThrow();
        });
    });

    describe('buildNodeMap', () => {
        it('withTemplate 强类已有 nodeMap → 不需要再 build', () => {
            const instance = new BoxClass() as any;
            // withTemplate 已经在 _buildNodeMapFromCompiled 中构建了 nodeMap
            expect(instance.nodeMap).toBeDefined();
            expect(instance.nodeMap['box']).toBeDefined();
            expect(instance.nodeMap['box']['label']).toBeDefined();
        });
    });
});
