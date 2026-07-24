/**
 * BodyMerger — Body 引擎
 *
 * 纯函数引擎：合并父 body 和子 body
 * 输入：parentBody, childBody, nodeOverrides
 * 输出：{ body, nodeOverrides }
 *
 * 所有输出都是新对象，不修改输入
 */

export interface MergeResult {
    body: Record<string, any>;
    nodeOverrides: Record<string, Record<string, any>>;
}

export class BodyMerger {
    static merge(
        parentBody: Record<string, any> | undefined,
        childBody: Record<string, any>
    ): Record<string, any> {
        if (!parentBody) return { ...childBody };

        const merged: Record<string, any> = { ...parentBody, ...childBody };

        if (parentBody.nodes && childBody.nodes) {
            merged.nodes = BodyMerger._mergeNodeConfigs(parentBody.nodes, childBody.nodes);
        }

        return merged;
    }

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
