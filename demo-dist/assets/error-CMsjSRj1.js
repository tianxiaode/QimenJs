import{r as T}from"./index-OvYsTaGM.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";var i={};Object.defineProperty(i,"__esModule",{value:!0});i.ErrorBase=void 0;class N extends Error{constructor(e,r,s){super(e),this.name=this.constructor.name,this.code=r,this.context=s,this.timestamp=new Date,Object.setPrototypeOf(this,new.target.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)}toJSON(){return{name:this.name,message:this.message,code:this.code,stack:this.stack,timestamp:this.timestamp.toISOString(),context:this.context}}toString(){const e=[`[${this.name}]`];return this.code&&e.push(`(${this.code})`),e.push(this.message),this.context&&e.push(JSON.stringify(this.context)),e.join(" ")}}i.ErrorBase=N;var n={};Object.defineProperty(n,"__esModule",{value:!0});var o=n.KernelError=void 0;const I=i;class c extends I.ErrorBase{constructor(e,r,s){super(e,r,s),Object.setPrototypeOf(this,c.prototype)}}o=n.KernelError=c;var E={};Object.defineProperty(E,"__esModule",{value:!0});var _=E.GestureError=void 0;const v=n;class l extends v.KernelError{constructor(e,r,s){super(e,r,s),Object.setPrototypeOf(this,l.prototype)}}_=E.GestureError=l;var u={};Object.defineProperty(u,"__esModule",{value:!0});var a=u.KernelErrorCode=void 0,p;(function(t){t.ENTITY_OPERATION_IN_PROGRESS="ENTITY_OPERATION_IN_PROGRESS",t.ENTITY_FETCH_FAILED="ENTITY_FETCH_FAILED",t.ENTITY_NOT_FOUND="ENTITY_NOT_FOUND",t.ENTITY_FETCH_TIMEOUT="ENTITY_FETCH_TIMEOUT",t.ENTITY_FETCH_CANCELLED="ENTITY_FETCH_CANCELLED",t.INVALID_PAGE_SIZE="INVALID_PAGE_SIZE",t.COMPOSABLE_NOT_FOUND="COMPOSABLE_NOT_FOUND",t.CIRCULAR_DEPENDENCY="CIRCULAR_DEPENDENCY",t.STREAM_REQUEST_FAILED="STREAM_REQUEST_FAILED",t.GESTURE_RECOGNITION_ERROR="GESTURE_RECOGNITION_ERROR",t.GESTURE_DISTANCE_INSUFFICIENT="GESTURE_DISTANCE_INSUFFICIENT",t.UNKNOWN_GESTURE_PROCESSOR="UNKNOWN_GESTURE_PROCESSOR",t.ACTION_NOT_FOUND="ACTION_NOT_FOUND",t.SCHEMA_NOT_FOUND="SCHEMA_NOT_FOUND",t.SCHEMA_REGISTRATION_FAILED="SCHEMA_REGISTRATION_FAILED",t.ACTION_REGISTRATION_FAILED="ACTION_REGISTRATION_FAILED"})(p||(a=u.KernelErrorCode=p={}));function g(){const t=Object.entries(a);T(`
        <div class="page-header">
            <h2>错误处理</h2>
            <p>@qimenjs/error — ErrorBase / KernelError / GestureError + 错误码体系</p>
        </div>

        <div class="section">
            <div class="section-title">错误类型对比</div>
            <div class="card">
                <table class="data-table">
                    <thead>
                        <tr><th>类型</th><th>继承</th><th>用途</th><th>特有属性</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">ErrorBase</span></td><td>Error</td><td>基础错误抽象类</td><td>code, timestamp, context</td></tr>
                        <tr><td><span class="badge badge-purple">KernelError</span></td><td>ErrorBase</td><td>内核模块错误</td><td>KernelErrorCode</td></tr>
                        <tr><td><span class="badge badge-warning">GestureError</span></td><td>KernelError</td><td>手势事件错误</td><td>手势上下文</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">交互式错误创建</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>创建 KernelError</div>
                    <div class="form-group">
                        <label>错误消息</label>
                        <input id="err-kernel-msg" class="input" value="操作失败" placeholder="输入错误消息">
                    </div>
                    <div class="form-group">
                        <label>错误码</label>
                        <select id="err-kernel-code" class="input">
                            ${t.map(([e,r])=>`<option value="${r}">${e}</option>`).join("")}
                        </select>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__createKernelError()">创建错误</button>
                    <div id="err-kernel-result" class="mt-3 text-sm"></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>创建 GestureError</div>
                    <div class="form-group">
                        <label>错误消息</label>
                        <input id="err-gesture-msg" class="input" value="手势识别失败" placeholder="输入错误消息">
                    </div>
                    <div class="form-group">
                        <label>错误码</label>
                        <select id="err-gesture-code" class="input">
                            <option value="GESTURE_RECOGNITION_ERROR">GESTURE_RECOGNITION_ERROR</option>
                            <option value="GESTURE_DISTANCE_INSUFFICIENT">GESTURE_DISTANCE_INSUFFICIENT</option>
                            <option value="UNKNOWN_GESTURE_PROCESSOR">UNKNOWN_GESTURE_PROCESSOR</option>
                        </select>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__createGestureError()">创建错误</button>
                    <div id="err-gesture-result" class="mt-3 text-sm"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">错误链追踪</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#EF5350;"></span>嵌套 cause 链</div>
                <button class="btn btn-primary btn-sm" onclick="window.__createErrorChain()">创建错误链</button>
                <div id="err-chain-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">错误码一览</div>
            <div class="card">
                <div class="grid-3">
                    ${t.map(([e])=>`<div class="text-sm" style="padding:4px 8px;"><span class="badge badge-muted">${e}</span></div>`).join("")}
                </div>
            </div>
        </div>
    `)}function d(t){var r;const e={name:t.name,message:t.message};return"code"in t&&(e.code=t.code),"timestamp"in t&&(e.timestamp=(r=t.timestamp)==null?void 0:r.toISOString()),"context"in t&&t.context&&(e.context=t.context),t.cause&&(e.cause=d(t.cause)),JSON.stringify(e,null,2)}window.__createKernelError=()=>{const t=document.getElementById("err-kernel-msg").value,e=document.getElementById("err-kernel-code").value,r=new o(t,e,{source:"demo-app"}),s=document.getElementById("err-kernel-result");s&&(s.innerHTML=`<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;">${d(r)}</pre>`)};window.__createGestureError=()=>{const t=document.getElementById("err-gesture-msg").value,e=document.getElementById("err-gesture-code").value,r=new _(t,e,{gestureType:"swipe",position:{x:100,y:200}}),s=document.getElementById("err-gesture-result");s&&(s.innerHTML=`<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;">${d(r)}</pre>`)};window.__createErrorChain=()=>{const t=new o("数据库连接超时",a.ENTITY_FETCH_TIMEOUT,{host:"db.example.com",port:5432}),e=new o("实体获取失败",a.ENTITY_FETCH_FAILED,{entity:"User"});e.cause=t;const r=new o("操作失败",a.ENTITY_OPERATION_IN_PROGRESS,{action:"loadUsers"});r.cause=e;const s=document.getElementById("err-chain-result");s&&(s.innerHTML=`<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;">${d(r)}</pre>`)};export{g as renderError};
