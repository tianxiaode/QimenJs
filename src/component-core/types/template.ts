import { ComponentState, NodeMeta } from './component';

export interface SplitOptionsResult extends Omit<
    NodeMeta,
    'tag' | 'type' | 'i18n' | 'permission' | 'isComponent'
> {}

export interface TemplateCache extends Omit<
    ComponentState,
    'states' | 'dirty' | 'instances' | 'elements'
> {
    /** 生成的 HTML 字符串 */
    html?: string;
    /** 模板缓存 */
    templateCache?: HTMLTemplateElement;
}
