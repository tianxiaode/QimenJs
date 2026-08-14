import { ComponentState, NodeOptions } from './component';
import { NodeAttributes, NodeHTMLClass, NodeStyle } from './html';

export interface SplitOptionsResult {
    attributes: NodeAttributes;
    style: NodeStyle;
    options: NodeOptions;
    classname: NodeHTMLClass;
}

export interface TemplateCache extends Omit<
    ComponentState,
    'elementMap' | 'dirty' | 'instanceMap'
> {
    /** 生成的 HTML 字符串 */
    html?: string;
    /** 模板缓存 */
    templateCache?: HTMLTemplateElement;
}
