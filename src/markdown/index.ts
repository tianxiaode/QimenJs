/**
 * @qimenjs/markdown
 *
 * Markdown 引擎 + 编辑器组件
 *
 * - MarkdownEngine：零依赖 Markdown → HTML 解析引擎，可独立使用
 * - MarkdownEditorComponent：从 FormFieldComponent 派生的 Markdown 编辑器
 * - MarkdownEditorFieldBodyComponent：编辑器字段体子组件
 */

export { MarkdownEngine, type MarkdownEngineOptions } from './engine';
export type { BlockRule, InlineRule, BlockToken } from './engine';

export {
    MarkdownEditorComponent,
    type MarkdownEditorProps,
    type MarkdownEditMode,
    type MarkdownShortcutAction,
    type ShortcutContext,
} from './MarkdownEditorComponent';
export { MarkdownEditorFieldBodyComponent } from './MarkdownEditorFieldBodyComponent';
export { markdownEditorCSS } from './markdown-editor.css';
export { markdownViewerCSS } from './markdown-viewer.css';
