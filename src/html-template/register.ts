/**
 * 自动注册组件 HTML 模板
 *
 * 引入 @qimenjs/html-template 时自动执行，将组件模板注册到 HtmlTemplateRegistrar。
 * 遵循 mime 包的自动注册模式。
 */

import { HtmlTemplateRegistrar } from './HtmlTemplateRegistrar';
import { COMPONENT_TEMPLATES } from './presets';

/**
 * 注册组件模板到 HtmlTemplateRegistrar
 *
 * @param extra - 额外的模板映射，与 COMPONENT_TEMPLATES 合并注册
 */
export function registerComponentTemplates(extra?: Record<string, string>): void {
    const registrar = HtmlTemplateRegistrar.getInstance();
    for (const [id, template] of Object.entries(COMPONENT_TEMPLATES)) {
        registrar.register(id, template);
    }
    if (extra) {
        for (const [id, template] of Object.entries(extra)) {
            registrar.register(id, template);
        }
    }
}

// 自动注册组件模板
registerComponentTemplates();
