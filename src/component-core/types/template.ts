import { IComponentCore, NodeMeta, NodeStyle, TemplateDecl } from './component';
import { I18nOptions } from './options';
import { NodeIndexPathMap } from './index-path';

export interface TplNode extends TemplateDecl {
    cls?: string;
    hidden?: boolean;
    attrs?: Record<string, any>;
    children?: TplNode[];
    i18n?: I18nOptions | string;
    style?: NodeStyle | string;
    type?: IComponentCore | string | (new (...args: any[]) => any);
    [key: string]: any;
}

export interface TemplateCache {
    /** 生成的 HTML 字符串 */
    html?: string;
    /** 模板缓存 */
    templateCache?: HTMLTemplateElement;
    /** 节点名称列表 */
    names: string[];
    /** 子组件名称列表  */
    childComponents: string[];
    /** i18n节点名称列表 */
    i18ns: string[];
    /** 权限节点名称列表 */
    permissions: string[];
    /** 节点对应元素的路径映射表 */
    indexs: NodeIndexPathMap;
    /** 节点元数据 */
    nodes: Record<string, NodeMeta>;
}
