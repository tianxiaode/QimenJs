import { RequestProcessors } from '../../types';

/**
 * 系统级默认 REST 处理器集合
 */
export const DefaultRequestProcessors: RequestProcessors = {
    // 1. 获取列表：通常带分页和过滤，全量进入 queryParams
    list: (context, payload) => {
        context.method = 'GET';
        context.options.queryParams = { ...context.options.queryParams, ...payload };
        return context;
    },

    // 2. 获取所有：通常不带分页，或者有特定的全量标记
    all: (context, payload) => {
        context.method = 'GET';
        context.options.queryParams = { ...context.options.queryParams, ...payload };
        return context;
    },

    // 3. 创建：数据全量进入 body
    create: (context, payload) => {
        context.method = 'POST';
        context.options.body = payload;
        return context;
    },

    // 4. 更新：主键进 Path，全量数据进 Body
    update: (context, payload) => {
        context.method = 'PUT';
        const id = payload?.[context.meta.rowKey];
        if (id !== undefined) context.options?.pathParams?.push(id);
        context.options.body = payload;
        return context;
    },

    // 5. 删除：主键进 Path
    delete: (context, payload) => {
        context.method = 'DELETE';
        const id = payload?.[context.meta.rowKey];
        if (id !== undefined) context.options?.pathParams?.push(id);
        return context;
    },

    // 6. 批量删除：通常不在 URL 传参，而是把 ID 数组放进 Body
    batchDelete: (context, payload) => {
        context.method = 'DELETE';
        // 注意：这里不做 payload 的结构假设，由开发者决定传 [1,2] 还是 { ids: [1,2] }
        context.options.body = payload;
        return context;
    },

    // 7. 切换状态 (Toggle)：常见于启用/禁用，通常是 PATCH 或 POST 到一个特定路径
    // 比如: POST /users/1/toggle
    toggle: (context, payload) => {
        context.method = 'PATCH';
        const id = payload?.[context.meta.rowKey];
        if (id !== undefined) {
            context.options?.pathParams?.push(id);
        }
        // 自动追加 /toggle 后缀到 URL
        context.url = `${context.url}/toggle`;
        return context;
    },
    detail: (context, payload) => {
        // 1. 初始化容器
        context.options.pathParams = context.options.pathParams || [];
        context.options.queryParams = context.options.queryParams || {};

        // 2. 搬运工：只负责把 ID 挪到路径里
        // 如果 payload 存在且有 id 字段
        const id = payload?.[context.meta.rowKey];
        if (id !== undefined) {
            context.options?.pathParams?.push(id);
        }

        // 3. 搬运工：剩下的全塞进 Query（不做复杂的过滤决策）
        // 注意：这里我们保留了 payload 的原始状态并展开
        context.options.queryParams = {
            ...context.options.queryParams,
            ...payload,
        };

        // 4. 协议锁定
        context.method = 'GET';

        return context;
    },
};
