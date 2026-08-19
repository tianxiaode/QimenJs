import { NodeMeta } from './component';
import { NodeIndexPathMap } from './index-path';

export interface SplitOptionsResult extends Omit<
    NodeMeta,
    'tag' | 'type' | 'i18n' | 'permission' | 'isComponent'
> {
    coreOptions?: Record<string, any>;
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
