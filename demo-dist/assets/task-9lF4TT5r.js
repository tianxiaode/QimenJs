import{r as b}from"./index-OvYsTaGM.js";import{c as u}from"./_commonjsHelpers-CZnAS8i4.js";import f from"@qimenjs/logger";import y from"@qimenjs/utils";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";var m={},h={};Object.defineProperty(h,"__esModule",{value:!0});var c={};Object.defineProperty(c,"__esModule",{value:!0});c.globalTaskQueue=c.GlobalTaskQueue=void 0;const T=f,p=y;class d{constructor(t=5){this.taskQueue=[],this.isRunning=!1,this.maxConcurrentTasks=t,this.logger=T.Logger.for("GlobalTaskQueue")}static getInstance(t){return d.instance||(d.instance=new d(t)),d.instance}getSortedQueue(){const t={HIGH:1,NORMAL:2,LOW:3};return this.taskQueue.sort((e,s)=>t[e.priority]-t[s.priority])}addTask(t,e="NORMAL",s=3,a=1e3,r=!1,o=5e3){const n={id:p.string.getId("task-"),fn:t,retries:0,maxRetries:s,delay:a,priority:e,isPolling:r,interval:o};this.taskQueue.push(n),this.logger.debug(`Task added: ${n.id}, priority: ${n.priority}`),this.run()}async handleTaskRetry(t){return t.retries<t.maxRetries?(t.retries++,await p.time.after(t.delay,()=>this.addTask(t.fn,t.priority,t.maxRetries,t.delay,t.isPolling,t.interval)),!0):(this.logger.error(`Task ${t.id} exceeded max retries`),!1)}async handlePollingTask(t){return t.retries<t.maxRetries?(t.retries++,await p.time.after(t.interval,()=>this.addTask(t.fn,t.priority,t.maxRetries,t.delay,t.isPolling,t.interval)),!0):(this.logger.error(`Polling task ${t.id} exceeded max retries`),!1)}async runTask(t){try{await t.fn(),this.logger.debug(`Task executed: ${t.id}`),t.isPolling&&this.handlePollingTask(t)}catch(e){this.logger.error(`Task failed: ${t.id}`,e),t.isPolling?this.handlePollingTask(t):this.handleTaskRetry(t)}}async run(){if(this.isRunning){this.logger.debug("Task queue is already running");return}this.isRunning=!0;const e=this.getSortedQueue().splice(0,this.maxConcurrentTasks);this.logger.info(`Running ${e.length} tasks concurrently`),await Promise.all(e.map(s=>this.runTask(s))),this.isRunning=!1,this.logger.debug("Task queue execution completed")}}c.GlobalTaskQueue=d;d.instance=null;c.globalTaskQueue=d.getInstance();(function(i){var t=u&&u.__createBinding||(Object.create?function(s,a,r,o){o===void 0&&(o=r);var n=Object.getOwnPropertyDescriptor(a,r);(!n||("get"in n?!a.__esModule:n.writable||n.configurable))&&(n={enumerable:!0,get:function(){return a[r]}}),Object.defineProperty(s,o,n)}:function(s,a,r,o){o===void 0&&(o=r),s[o]=a[r]}),e=u&&u.__exportStar||function(s,a){for(var r in s)r!=="default"&&!Object.prototype.hasOwnProperty.call(a,r)&&t(a,s,r)};Object.defineProperty(i,"__esModule",{value:!0}),e(h,i),e(c,i)})(m);const g=[];function P(){g.length=0,b(`
        <div class="page-header">
            <h2>任务调度</h2>
            <p>@qimenjs/task — GlobalTaskQueue 优先级调度</p>
        </div>

        <div class="section">
            <div class="section-title">任务队列架构</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>特性</th><th>说明</th></tr></thead>
                    <tbody>
                        <tr><td>优先级</td><td>HIGH / NORMAL / LOW，高优先级先执行</td></tr>
                        <tr><td>并发控制</td><td>默认最大 5 个并发任务</td></tr>
                        <tr><td>重试机制</td><td>失败自动重试，默认 3 次</td></tr>
                        <tr><td>延迟执行</td><td>支持 delay 参数延迟启动</td></tr>
                        <tr><td>轮询任务</td><td>支持 isPolling + interval 定时执行</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">添加任务</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>添加优先级任务</div>
                    <div class="form-group">
                        <label>任务名称</label>
                        <input id="task-name" class="input" value="数据加载任务" placeholder="输入任务名">
                    </div>
                    <div class="form-group">
                        <label>优先级</label>
                        <select id="task-priority" class="input">
                            <option value="HIGH">HIGH - 高优先级</option>
                            <option value="NORMAL" selected>NORMAL - 普通</option>
                            <option value="LOW">LOW - 低优先级</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>模拟耗时 (ms)</label>
                        <input id="task-duration" class="input" type="number" value="1000" min="100" max="5000">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__addTask()">添加任务</button>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>批量添加</div>
                    <p class="text-sm text-muted mb-3">快速添加多个不同优先级的任务，观察执行顺序</p>
                    <button class="btn btn-primary btn-sm" onclick="window.__addBatchTasks()">添加 3 个任务 (LOW/NORMAL/HIGH)</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">哈希任务（Node.js 专属）</div>
            <div class="card">
                <p class="text-sm text-muted">HashTask 子模块依赖 Node.js worker_threads，仅在后端环境可用。浏览器端可使用 GlobalTaskQueue 进行任务调度。</p>
                <table class="data-table">
                    <thead><tr><th>子模块</th><th>环境</th><th>说明</th></tr></thead>
                    <tbody>
                        <tr><td>task/</td><td>浏览器 + Node.js</td><td>GlobalTaskQueue 优先级调度</td></tr>
                        <tr><td>worker/</td><td>浏览器 + Node.js</td><td>Web Worker 管理器</td></tr>
                        <tr><td>hash-task/</td><td>Node.js 专属</td><td>文件哈希计算（依赖 worker_threads）</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">任务执行日志</div>
            <div class="card">
                <button class="btn btn-ghost btn-sm mb-3" onclick="window.__clearTaskLog()">清空日志</button>
                <div id="task-log" style="max-height:300px;overflow-y:auto;font-family:monospace;font-size:12px;background:#050506;padding:12px;border-radius:6px;">
                    <div class="text-muted">等待任务...</div>
                </div>
            </div>
        </div>
    `)}function l(i,t="info"){const e=new Date().toLocaleTimeString("zh-CN",{hour12:!1});g.push({time:e,msg:i,type:t}),v()}function v(){const i=document.getElementById("task-log");if(!i)return;const t={info:"#4CAF50",high:"#EF5350",normal:"#6366F1",low:"#888",error:"#EF5350",success:"#4CAF50"};i.innerHTML=g.map(e=>{const s=t[e.type]||"#888";return`<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="color:#666;">${e.time}</span>
            <span style="color:${s};margin-left:8px;">${e.msg}</span>
        </div>`}).join(""),i.scrollTop=i.scrollHeight}window.__addTask=()=>{const i=document.getElementById("task-name").value,t=document.getElementById("task-priority").value,e=Number(document.getElementById("task-duration").value)||1e3;l(`添加任务: "${i}" [${t}] 耗时 ${e}ms`,t.toLowerCase()),m.globalTaskQueue.addTask(async()=>{l(`开始执行: "${i}"`,"info"),await new Promise(s=>setTimeout(s,e)),l(`完成: "${i}"`,"success")},t,1,0)};window.__addBatchTasks=()=>{const i=[{name:"低优先级任务",priority:"LOW",duration:800},{name:"普通优先级任务",priority:"NORMAL",duration:600},{name:"高优先级任务",priority:"HIGH",duration:400}];for(const t of i)l(`添加任务: "${t.name}" [${t.priority}]`,t.priority.toLowerCase()),m.globalTaskQueue.addTask(async()=>{l(`开始执行: "${t.name}"`,"info"),await new Promise(e=>setTimeout(e,t.duration)),l(`完成: "${t.name}"`,"success")},t.priority,1,0)};window.__clearTaskLog=()=>{g.length=0,v()};export{P as renderTask};
