/**
 * 自动注册组件模板
 *
 * 引入 @qimenjs/template 时自动执行，将组件模板注册到 TemplateRegistrar，
 * 并将 TemplateRegistrar 注册到 RegistryHub。
 */

import { TemplateRegistrar } from './TemplateRegistrar';
import { RegistryHub } from '@qimenjs/registry';
import { COMPONENT_TEMPLATES } from './presets';
import type { JsonTemplateNode } from '@/component-core/template-compiler';

/**
 * 注册组件模板到 TemplateRegistrar
 *
 * @param extra - 额外的模板映射，与 COMPONENT_TEMPLATES 合并注册
 */
export function registerComponentTemplates(extra?: Record<string, string | JsonTemplateNode[]>): void {
    const registrar = TemplateRegistrar.getInstance();
    for (const [id, template] of Object.entries(COMPONENT_TEMPLATES)) {
        registrar.register(id, template);
    }
    if (extra) {
        for (const [id, template] of Object.entries(extra)) {
            registrar.register(id, template);
        }
    }
}

// 将 TemplateRegistrar 注册到 RegistryHub
RegistryHub.use(TemplateRegistrar.getInstance());

// 自动注册组件模板
registerComponentTemplates();
