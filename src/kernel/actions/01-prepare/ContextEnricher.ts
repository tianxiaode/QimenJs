import { FlowContext,ActionHandler } from '../../types';
import { Registry } from '@orbitjs/registry';


export const ContextEnricherHandler: ActionHandler = async(context: FlowContext)=>{
        // 1. 获取当前域的配置对象
        const { domain, config } = context;

        const cfg = Registry.domain.get(domain);
        
        context.http.timeout = cfg.timeout ?? 10000; // 默认10s

        context.config = cfg;

}
