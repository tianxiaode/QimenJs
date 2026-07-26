/**
 * BodyMerger — Body 引擎
 *
 * 纯函数引擎：合并父 body 和子 body
 * 输入：parentBody, childBody, nodeOverrides
 * 输出：{ body, nodeOverrides }
 *
 * 所有输出都是新对象，不修改输入
 */

/** 合并结果 */
export interface MergeResult {
    /** 合并后的 body 对象 */
    body: Record<string, any>;
    /** 合并后的节点覆盖配置 */
    nodeOverrides: Record<string, Record<string, any>>;
}

export class BodyMerger {
    /** 合并父和子 body，nodes 配置深度合并 */
    static merge(
        parentBody: Record<string, any> | undefined,
        childBody: Record<string, any>
    ): Record<string, any> {
        if (!parentBody) {
            const result: Record<string, any> = {};
            const descs = Object.getOwnPropertyDescriptors(childBody);
            for (const [key, desc] of Object.entries(descs)) {
                Object.defineProperty(result, key, desc);
            }
            return result;
        }

        const merged: Record<string, any> = {};
        const parentDescs = Object.getOwnPropertyDescriptors(parentBody);
        for (const [key, desc] of Object.entries(parentDescs)) {
            Object.defineProperty(merged, key, desc);
        }
        const childDescs = Object.getOwnPropertyDescriptors(childBody);
        for (const [key, desc] of Object.entries(childDescs)) {
            Object.defineProperty(merged, key, desc);
        }

        if (parentBody.nodes && childBody.nodes) {
            merged.nodes = BodyMerger._mergeNodeConfigs(parentBody.nodes, childBody.nodes);
        }

        return merged;
    }

    /** 合并父和子模板事件声明，数组拼接，对象合并 */
    static mergeTplEvents(
        parentEvents: Record<string, any> | undefined,
        childEvents: Record<string, any>
    ): Record<string, any> {
        if (!parentEvents) return { ...childEvents };

        const result: Record<string, any> = { ...parentEvents };
        for (const [nodeName, childDecl] of Object.entries(childEvents)) {
            const parentDecl = result[nodeName];
            if (parentDecl && childDecl) {
                if (Array.isArray(parentDecl) && Array.isArray(childDecl)) {
                    result[nodeName] = [...parentDecl, ...childDecl];
                } else if (
                    typeof parentDecl === 'object' &&
                    typeof childDecl === 'object' &&
                    !Array.isArray(parentDecl) &&
                    !Array.isArray(childDecl)
                ) {
                    result[nodeName] = { ...parentDecl, ...childDecl };
                } else {
                    result[nodeName] = childDecl;
                }
            } else {
                result[nodeName] = childDecl;
            }
        }
        return result;
    }

    /** 合并父和子节点覆盖配置，同名节点属性合并 */
    static mergeNodeOverrides(
        parentOverrides: Record<string, Record<string, any>> | undefined,
        childOverrides: Record<string, Record<string, any>>
    ): Record<string, Record<string, any>> {
        if (!parentOverrides) return { ...childOverrides };

        const result: Record<string, Record<string, any>> = { ...parentOverrides };
        for (const [key, value] of Object.entries(childOverrides)) {
            if (result[key]) {
                result[key] = { ...result[key], ...value };
            } else {
                result[key] = { ...value };
            }
        }
        return result;
    }

    private static _mergeNodeConfigs(
        parentNodes: Record<string, any>,
        childNodes: Record<string, any>
    ): Record<string, any> {
        const result: Record<string, any> = {};
        const allKeys = new Set([...Object.keys(parentNodes), ...Object.keys(childNodes)]);

        for (const key of allKeys) {
            const parent = parentNodes[key];
            const child = childNodes[key];

            if (parent && child) {
                result[key] = { ...parent, ...child };
            } else {
                result[key] = { ...(parent || child) };
            }
        }

        return result;
    }
}
