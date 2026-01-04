import { ReadEntityManager } from './ReadEntityManager';

/**
 * 增删改查实体管理器基类
 * 继承自 ReadEntityManager，拥有完整的列表、搜索、翻页和本地查询能力
 */
export abstract class CrudEntityManager extends ReadEntityManager {
    /**
     * 创建记录
     * @param data 实体数据
     */
    public async create(data: any) {
        // 动作名 'create'，处理器通常映射为 POST
        return this.sendRequest('create', data);
    }

    /**
     * 更新记录
     * @param data 包含主键的实体数据
     */
    public async update(data: any) {
        // 动作名 'update'，处理器通常映射为 PUT/PATCH
        // 我们的 URL 解析逻辑会自动提取 data[rowKey] 填充到 /:id 中
        return this.sendRequest('update', data);
    }

    /**
     * 删除记录
     * @param id 主键值
     */
    public async delete(id: string | number) {
        // 动作名 'delete'，处理器通常映射为 DELETE
        const payload = { [this.rowKey]: id };
        return this.sendRequest('delete', payload);
    }

    /**
     * 智能保存
     * 自动根据主键是否存在来决定调用 create 还是 update
     */
    public async save(data: any) {
        const id = data[this.rowKey];
        if (id !== undefined && id !== null && id !== '') {
            return this.update(data);
        }
        return this.create(data);
    }

    /**
     * 批量删除 (可选)
     */
    public async batchDelete(ids: (string | number)[]) {
        return this.sendRequest('batchDelete', { ids });
    }

    /**
     * 快速切换状态 (例如 启用/禁用)
     * @param id 主键
     * @param field 要切换的字段名 (默认 'status' 或 'isActive')
     * @param value 可选：直接指定值，不传则由后端逻辑取反
     */
    public async toggle(id: string | number, field: string, value?: any) {
        const payload = {
            [this.rowKey]: id,
            field,
            value,
        };

        // 动作名 'toggle'
        // 处理器建议映射为：PATCH 路径 /:id/toggle 或由后端通用逻辑处理
        return this.sendRequest('toggle', payload);
    }
}