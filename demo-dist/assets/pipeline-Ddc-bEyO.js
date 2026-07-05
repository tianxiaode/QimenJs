import{r as y}from"./index-OvYsTaGM.js";import k from"@/logger";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";var g={};Object.defineProperty(g,"__esModule",{value:!0});g.pipeline=E=g.Pipeline=void 0;const D=k;class f{constructor(){this.logger=D.Logger.for(f),this.stats={totalExecutions:0,successCount:0,failureCount:0,averageDuration:0,maxDuration:0,minDuration:1/0}}async execute(e,s,o={}){var a;const{enableTracking:t=!0,enableTiming:i=!0,breakOnError:u=!0,pipelineName:c="Pipeline"}=o,w=i?performance.now():0,b=[];let x,v=!0;this.logger.debug(`[${c}] Execution started`);try{const p=this.sortProcessors(s);this.logger.debug(`[${c}] Processing ${p.length} processors`);for(const d of p){const n={processor:d.name,weight:d.weight,offset:d.offset,action:"executed"};if(this.isTerminated(e)){n.action="skipped",n.reason="Pipeline terminated",t&&b.push(n);continue}const _=i?performance.now():0;try{await d.execute(e),i&&(n.duration=performance.now()-_),this.isTerminated(e)&&(n.action="terminated",n.reason="Processor raised termination"),t&&b.push(n),this.logger.debug(`[${c}] Processor "${d.name}" executed in ${((a=n.duration)===null||a===void 0?void 0:a.toFixed(2))||"-"}ms`)}catch(h){if(i&&(n.duration=performance.now()-_),n.action="terminated",n.error=h,n.reason="Processor threw error",t&&b.push(n),this.logger.error(`[${c}] Processor "${d.name}" failed:`,h),this.setError(e,h),x=h,v=!1,u)break}}}catch(p){this.logger.error(`[${c}] Execution failed:`,p),x=p,v=!1}const $=i?performance.now():0,P=i?$-w:0;return this.updateStats(v,P),this.logger.debug(`[${c}] Execution finished in ${P.toFixed(2)}ms`),{context:e,steps:b,isSuccess:v,totalDuration:P,error:x}}sortProcessors(e){return[...e].sort((s,o)=>{var a,t,i,u;const c=((a=s.weight)!==null&&a!==void 0?a:100)+((t=s.offset)!==null&&t!==void 0?t:0),w=((i=o.weight)!==null&&i!==void 0?i:100)+((u=o.offset)!==null&&u!==void 0?u:0);return c-w})}isTerminated(e){var s;return((s=e.metadata)===null||s===void 0?void 0:s.terminate)===!0}setError(e,s){const o=e;o.error=s,o.metadata||(o.metadata={}),o.metadata.hasError=!0}updateStats(e,s){if(this.stats.totalExecutions++,e?this.stats.successCount++:this.stats.failureCount++,s>0){const o=this.stats.averageDuration*(this.stats.totalExecutions-1)+s;this.stats.averageDuration=o/this.stats.totalExecutions,s>this.stats.maxDuration&&(this.stats.maxDuration=s),s<this.stats.minDuration&&(this.stats.minDuration=s)}}getStats(){return{...this.stats}}resetStats(){this.stats={totalExecutions:0,successCount:0,failureCount:0,averageDuration:0,maxDuration:0,minDuration:1/0}}printReport(e){if(console.group("📊 Pipeline Execution Report"),console.log(`
✅ Status: ${e.isSuccess?"Success":"Failed"}`),console.log(`⏱️  Total Duration: ${e.totalDuration.toFixed(2)}ms`),console.log(`📝 Steps: ${e.steps.length}`),e.steps.length>0){console.log(`
📋 Execution Steps:`);const s=e.steps.map((o,a)=>{var t,i;return{"#":a+1,Processor:o.processor,Weight:(t=o.weight)!==null&&t!==void 0?t:"-",Offset:(i=o.offset)!==null&&i!==void 0?i:"-",Action:o.action,Duration:o.duration?`${o.duration.toFixed(2)}ms`:"-",Reason:o.reason||"-"}});console.table(s)}e.error&&console.log(`
❌ Error:`,e.error),console.groupEnd()}}var E=g.Pipeline=f;g.pipeline=new f;const l=[{name:"ValidateProcessor",weight:10,enabled:!0},{name:"TransformProcessor",weight:20,enabled:!0},{name:"SaveProcessor",weight:30,enabled:!0}];function I(){y(`
        <div class="page-header">
            <h2>管道处理</h2>
            <p>@qimenjs/pipeline — Processor 权重排序 + 管道执行 + 熔断机制</p>
        </div>

        <div class="section">
            <div class="section-title">管道架构</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    Pipeline 按处理器 <code>weight</code> 从小到大排序执行。
                    支持 <code>breakOnError</code> 熔断、<code>enableTiming</code> 性能计时、
                    <code>enableTracking</code> 步骤追踪。每个 Processor 实现 <code>execute(context)</code> 方法。
                </p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">处理器配置</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>当前处理器列表</div>
                <div id="pipe-processors" class="mb-3"></div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>添加处理器名称</label>
                        <input id="pipe-name" class="input" value="LogProcessor" placeholder="处理器名称">
                    </div>
                    <div class="form-group">
                        <label>权重 (weight)</label>
                        <input id="pipe-weight" class="input" type="number" value="15" min="1" max="100">
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__addProcessor()">添加处理器</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__addErrorProcessor()">添加错误处理器</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">执行管道</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>管道执行控制</div>
                <div class="form-group">
                    <label>
                        <input id="pipe-break" type="checkbox" checked> breakOnError (遇到错误中断)
                    </label>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__executePipeline()">执行管道</button>
                <div id="pipe-result" class="mt-3 text-sm"></div>
            </div>
        </div>
    `),m()}function m(){const r=document.getElementById("pipe-processors");r&&(r.innerHTML=l.map((e,s)=>`
        <div class="flex items-center gap-2 mb-2">
            <span class="badge ${e.enabled?"badge-success":"badge-muted"}">${e.enabled?"启用":"禁用"}</span>
            <span style="color:#6366F1;">${e.name}</span>
            <span class="text-muted text-xs">weight: ${e.weight}</span>
            <button class="btn btn-ghost btn-sm" style="font-size:11px;padding:2px 8px;" onclick="window.__toggleProcessor(${s})">${e.enabled?"禁用":"启用"}</button>
            <button class="btn btn-ghost btn-sm" style="font-size:11px;padding:2px 8px;color:#EF5350;" onclick="window.__removeProcessor(${s})">删除</button>
        </div>
    `).join(""))}window.__addProcessor=()=>{const r=document.getElementById("pipe-name").value,e=Number(document.getElementById("pipe-weight").value)||15;l.push({name:r,weight:e,enabled:!0}),m()};window.__addErrorProcessor=()=>{l.push({name:"ErrorProcessor",weight:25,enabled:!0}),m()};window.__toggleProcessor=r=>{l[r]&&(l[r].enabled=!l[r].enabled,m())};window.__removeProcessor=r=>{l.splice(r,1),m()};window.__executePipeline=async()=>{const r=document.getElementById("pipe-result");if(!r)return;const e=document.getElementById("pipe-break").checked,s=l.filter(t=>t.enabled).map(t=>({name:t.name,weight:t.weight,execute:async i=>{if(t.name==="ErrorProcessor")throw new Error(`${t.name} 执行失败`);i.steps=i.steps||[],i.steps.push({name:t.name,status:"success"})}})),o=new E,a={steps:[]};try{const t=await o.execute(a,s,{pipelineName:"DemoPipeline",breakOnError:e,enableTiming:!0,enableTracking:!0});r.innerHTML=`
            <div><span class="badge ${t.isSuccess?"badge-success":"badge-danger"}">${t.isSuccess?"成功":"失败"}</span></div>
            <div class="mt-2">总耗时: ${t.totalDuration.toFixed(2)}ms</div>
            <div class="mt-2"><strong>执行步骤:</strong></div>
            <pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(t.steps,null,2)}</pre>
        `}catch(t){r.innerHTML=`<span class="badge badge-danger">执行异常: ${t}</span>`}};export{I as renderPipeline};
