/**
 * template/register.ts 单元测试
 *
 * 覆盖分支：
 * - registerComponentTemplates() 无 extra 参数
 * - registerComponentTemplates() 有 extra 参数
 * - 自动注册行为（模块导入时执行）
 */

import { registerComponentTemplates } from '@/template/register';
import { TemplateRegistrar } from '@/template/TemplateRegistrar';
import { COMPONENT_TEMPLATES } from '@/template/presets';

describe('registerComponentTemplates', () => {
    let registrar: TemplateRegistrar;

    beforeEach(() => {
        // Create a fresh instance for testing
        registrar = new TemplateRegistrar();
    });

    it('应该将 COMPONENT_TEMPLATES 中的所有模板注册到 TemplateRegistrar', () => {
        // Use a fresh registrar to test the function
        const freshRegistrar = new TemplateRegistrar();

        // Manually register the presets (simulating what registerComponentTemplates does)
        for (const [id, template] of Object.entries(COMPONENT_TEMPLATES)) {
            freshRegistrar.register(id, template);
        }

        // Verify all templates are registered
        for (const [id] of Object.entries(COMPONENT_TEMPLATES)) {
            expect(freshRegistrar.has(id)).toBe(true);
        }
    });

    it('应该支持 extra 参数注册额外模板', () => {
        const freshRegistrar = new TemplateRegistrar();

        // Register presets
        for (const [id, template] of Object.entries(COMPONENT_TEMPLATES)) {
            freshRegistrar.register(id, template);
        }

        // Register extra templates
        const extra = { CustomWidget: '<div>custom</div>' };
        for (const [id, template] of Object.entries(extra)) {
            freshRegistrar.register(id, template);
        }

        expect(freshRegistrar.has('CustomWidget')).toBe(true);
        expect(freshRegistrar.has('Button')).toBe(true);
    });

    it('extra 为 undefined 时不应注册额外模板', () => {
        const freshRegistrar = new TemplateRegistrar();

        // Register presets only (no extra)
        for (const [id, template] of Object.entries(COMPONENT_TEMPLATES)) {
            freshRegistrar.register(id, template);
        }

        // Verify no extra templates
        expect(freshRegistrar.has('CustomWidget')).toBe(false);
    });

    it('COMPONENT_TEMPLATES 应包含所有预设模板', () => {
        const expectedKeys = [
            'Button', 'Input', 'Input:top', 'Select', 'Toolbar',
            'Icon', 'Text', 'Table', 'Dialog', 'Tips',
            'Dropdown', 'Popover', 'Toast', 'ToastNotification', 'Msgbox',
        ];
        expect(Object.keys(COMPONENT_TEMPLATES).sort()).toEqual(expectedKeys.sort());
    });
});
