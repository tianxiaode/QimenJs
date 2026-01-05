import { FlowContext, FieldMapping } from '../types';

export class MappingExecutor {
    /**
     * 执行映射对齐
     * @param direction 'toServer' | 'toClient'
     */
    static async run(
        ctx: FlowContext,
        schema: FieldMapping[],
        direction: 'toServer' | 'toClient'
    ): Promise<void> {
        if (!schema || schema.length === 0) {
            // 如果没有 schema，默认透传数据到 aligned/body
            if (direction === 'toClient') ctx.data.aligned = ctx.data.raw;
            return;
        }

        if (direction === 'toClient') {
            // 处理后端 -> 前端 (List 或 Item)
            const source = ctx.data.list || ctx.data.item || ctx.data.raw;
            ctx.data.aligned = this.transform(source, schema, 'toClient');
        } else {
            // 处理前端 -> 后端 (通常是修改 http.body)
            ctx.http.body = this.transform(ctx.params, schema, 'toServer');
        }
    }

    private static transform(data: any, schema: FieldMapping[], mode: string) {
        // 这里执行你定义的 FieldMapping 逻辑
        // 包含字段名转换、值类型转换（String->Number等）、默认值填充
        return MapperCore.execute(data, schema, mode);
    }
}
