/**
 * @qimenjs/renderer
 *
 * 渲染引擎 - Renderer + RenderContext + RenderRegistrar + 内置处理器
 */

// 核心类型导出
export {
    RenderPhase,
    RenderWeight,
    createRenderContext,
    type RenderContext,
    type RenderProcessor,
    type IDataSource,
    type TranslationBinding,
} from './RenderContext';

// 核心类导出
export { Renderer } from './Renderer';
export { RenderRegistrar } from './RenderRegistrar';

// 处理器导出（供自定义扩展使用）
export { createProcessor } from './processors/create';
export { templateProcessor } from './processors/template';
export { injectProcessor } from './processors/inject';
export { bindSchemaProcessor } from './processors/bind-schema';
export { bindHandlerProcessor } from './processors/bind-handler';
export { bindDatasourceProcessor } from './processors/bind-datasource';
export { bindEntityHooksProcessor } from './processors/bind-entity-hooks';
export { bindChildrenProcessor } from './processors/bind-children';
export { bindSlotsProcessor } from './processors/bind-slots';
export { bindRepeatProcessor } from './processors/bind-repeat';
export { bindI18nProcessor } from './processors/bind-i18n';
export { mountProcessor } from './processors/mount';
