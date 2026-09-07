import { NodeMeta } from './component';
import { NodeIndexPathMap } from './index-path';

export interface ChildComponentEntry {
    name?: string;
    indexPath: number[];
    nodeMeta: NodeMeta;
}

export interface TemplateCache {
    /** 生成的 HTML 字符串 */
    html?: string;
    /** 模板缓存 */
    templateCache?: HTMLTemplateElement;
    /** 节点名称列表 */
    names: string[];
    /** 子组件条目列表（含无名组件） */
    childComponents: ChildComponentEntry[];
    /** 节点对应元素的路径映射表 */
    indexs: NodeIndexPathMap;
    /** 节点元数据 */
    nodes: Record<string, NodeMeta>;
}
