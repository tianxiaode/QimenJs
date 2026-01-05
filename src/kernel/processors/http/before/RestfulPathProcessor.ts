import { Registry } from "../../../registry";
import { FlowContext, PriorityWeight, ProcessorType } from "../../../types";
import { string } from '@orbitjs/utils'

const RestfulPathProcessor = (ctx: FlowContext) => {
    const { action, entity, params } = ctx;
    const base = string.pluralize(entity.name.toLowerCase()) || ''; // 或者是 resourceName
    
    ctx.http.segments.push(base);

    // 只有特定动作才从 params 里提取 id 填入数组
    if (['detail', 'update', 'delete'].includes(action)) {
        const id = params[entity.idKey];
        if (id) ctx.http.segments.push(id);
    }
};

Registry.registerProcessor({
    id: 'RestfulPathProcessor',
    weight: PriorityWeight.CORE,
    offset: 1,
    handler: RestfulPathProcessor,
    type: ProcessorType.HTTP_BEFORE_COMMON,
})