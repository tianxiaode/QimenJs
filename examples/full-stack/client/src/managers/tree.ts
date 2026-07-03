/**
 * 树形域 EntityManager 定义
 *
 * 演示 RemoteTreeEntityManager 的树形数据管理
 * 连接 ABP 后端的部门树 API
 */
import { RemoteTreeEntityManager } from '@orbitjs/entity';
import { TreeManagerAbility } from '@orbitjs/entity';
import { DepartmentSchema } from '../domains';

/**
 * 部门树管理器
 *
 * 能力：list / get / expand / collapse / move / refresh / create / update / delete
 * 接口：GET /api/departments
 * 特性：懒加载子节点、展开/折叠、拖拽移动
 */
export class DepartmentManager extends RemoteTreeEntityManager {
    static readonly abilities = [
        ...RemoteTreeEntityManager.abilities,
        TreeManagerAbility,
    ];

    domain = 'abp';
    entityName = 'Department';
    url = '/api/departments';
    schema = DepartmentSchema;

    // TreePathAbility 和 TreeLifecycleAbility 依赖 nodes/hierarchy
    nodes: Map<string | number, any> = new Map();
    hierarchy: Map<string | number | null, (string | number)[]> = new Map();

    // TreeManagerAbility 依赖 isLoaded/setLoaded
    private _loadedNodes = new Set<string | number>();

    isLoaded(id: string | number): boolean {
        return this._loadedNodes.has(id);
    }

    setLoaded(id: string | number, loaded: boolean): void {
        if (loaded) {
            this._loadedNodes.add(id);
        } else {
            this._loadedNodes.delete(id);
        }
    }
}
