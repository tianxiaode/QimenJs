import{r as x}from"./index-OvYsTaGM.js";import v from"@qimenjs/registry";import{c as u}from"./_commonjsHelpers-CZnAS8i4.js";import"@qimenjs/error";import"@/registry/registrars/DomainRegistrar";var c={},l={};Object.defineProperty(l,"__esModule",{value:!0});l.createBaseContext=f;l.addStep=g;l.setError=y;l.clearError=w;l.setTerminate=_;l.isTerminated=E;function f(e={}){return{steps:e.steps||[],error:e.error,metadata:e.metadata||{}}}function g(e,t){e.steps.push(t)}function y(e,t){e.error=t,e.metadata.hasError=!0}function w(e){e.error=void 0,e.metadata.hasError=!1}function _(e,t){e.metadata.terminate=!0,t&&(e.metadata.terminateReason=t)}function E(e){return e.metadata.terminate===!0}(function(e){var t=u&&u.__createBinding||(Object.create?function(s,i,r,o){o===void 0&&(o=r);var d=Object.getOwnPropertyDescriptor(i,r);(!d||("get"in d?!i.__esModule:d.writable||d.configurable))&&(d={enumerable:!0,get:function(){return i[r]}}),Object.defineProperty(s,o,d)}:function(s,i,r,o){o===void 0&&(o=r),s[o]=i[r]}),n=u&&u.__exportStar||function(s,i){for(var r in s)r!=="default"&&!Object.prototype.hasOwnProperty.call(i,r)&&t(i,s,r)};Object.defineProperty(e,"__esModule",{value:!0}),n(l,e)})(c);var m={};Object.defineProperty(m,"__esModule",{value:!0});var h=m.RequestContextBuilder=void 0;const B=v;class p{constructor(){this.context={identity:{domain:""},request:{url:"",method:"GET",headers:{},pathParams:[],timeout:3e4,responseType:"json",controller:new AbortController},response:{status:0,isSuccess:!1,headers:{},data:null},data:{params:null,source:null,parsed:null,raw:null,list:[],item:null,total:0},isAborted:!1,error:null,steps:[],metadata:{isTransportFailure:!1,hasError:!1,contentType:"",isJson:!1,isText:!1,isBlob:!1,action:"",isUpload:!1,isDownload:!1,isErrorHandled:!1}}}static create(){return new p}withIdentity(t){return Object.assign(this.context.identity,t),this}withDomain(t){return this.context.identity.domain=t,this}withEntityName(t){return this.context.identity.entityName=t,this}withAction(t){return this.context.identity.action=t,this.context.metadata.action=t,this}withRequest(t){const n=Object.entries(t).reduce((s,[i,r])=>(r!==void 0&&(s[i]=r),s),{});return Object.assign(this.context.request,n),this}withUrl(t){return this.context.request.url=t,this}withMethod(t){return this.context.request.method=t,this}withHeaders(t){return this.context.request.headers=t,this}withBody(t){return this.context.request.body=t,this}withQueryParams(t){return this.context.request.queryParams=t,this}withResponse(t){const n=Object.entries(t).reduce((s,[i,r])=>(r!==void 0&&(s[i]=r),s),{});return Object.assign(this.context.response,n),this}withData(t){const n=Object.entries(t).reduce((s,[i,r])=>(r!==void 0&&(s[i]=r),s),{});return Object.assign(this.context.data,n),this}withParams(t){return this.context.data.params=t,this}withError(t){return this.context.error=t,this.context.metadata.hasError=!0,this}withMetadata(t,n){return this.context.metadata[t]=n,this}withMetadataMap(t){return Object.assign(this.context.metadata,t),this}withSchema(t){return this.context.schema=t,this}abort(){var t;return this.context.isAborted=!0,(t=this.context.request)===null||t===void 0||t.controller.abort(),this}addStep(t){return this.context.steps.push(t),this}addSteps(t){return this.context.steps.push(...t),this}withAlignToFrontend(t){return this.context.alignToFrontend=t,this}build(){var t,n,s;if(!(!((t=this.context.identity)===null||t===void 0)&&t.domain))throw new Error("RequestContext is missing domain");if(!(!((n=this.context.request)===null||n===void 0)&&n.url))throw new Error("RequestContext is missing URL");const i=this.context.identity.domain;if(typeof i=="string")try{const r=(s=B.Registry.domain)===null||s===void 0?void 0:s.get(i);r&&(this.context.metadata.domainConfig=r)}catch{}return this.context}clone(){var t;const n=new p;return n.context=JSON.parse(JSON.stringify(this.context)),!((t=this.context.request)===null||t===void 0)&&t.controller&&(n.context.request.controller=new AbortController),n}}h=m.RequestContextBuilder=p;function A(){x(`
        <div class="page-header">
            <h2>上下文管理</h2>
            <p>@qimenjs/context — RequestContextBuilder + BaseContext 操作</p>
        </div>

        <div class="section">
            <div class="section-title">上下文架构</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>组件</th><th>职责</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">BaseContext</span></td><td>基础执行上下文，含 steps/metadata/error</td></tr>
                        <tr><td><span class="badge badge-purple">RequestContext</span></td><td>HTTP 请求上下文，含 domain/entityName/action/request/response</td></tr>
                        <tr><td><span class="badge badge-success">RequestContextBuilder</span></td><td>链式构建 RequestContext</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">RequestContextBuilder 链式构建</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>构建请求上下文</div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Domain</label>
                        <input id="ctx-domain" class="input" value="abp" placeholder="域名">
                    </div>
                    <div class="form-group">
                        <label>EntityName</label>
                        <input id="ctx-entity" class="input" value="User" placeholder="实体名">
                    </div>
                    <div class="form-group">
                        <label>Action</label>
                        <select id="ctx-action" class="input">
                            <option value="list">list</option>
                            <option value="get">get</option>
                            <option value="create">create</option>
                            <option value="update">update</option>
                            <option value="delete">delete</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>URL</label>
                        <input id="ctx-url" class="input" value="/api/app/user" placeholder="请求 URL">
                    </div>
                    <div class="form-group">
                        <label>Method</label>
                        <select id="ctx-method" class="input">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Query Params (JSON)</label>
                        <input id="ctx-params" class="input" value='{"page":1,"size":10}' placeholder="JSON 参数">
                    </div>
                </div>
                <button class="btn btn-primary btn-sm mt-3" onclick="window.__buildRequestContext()">构建上下文</button>
                <div id="ctx-request-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">BaseContext 操作</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>基础上下文操作演示</div>
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-primary btn-sm" onclick="window.__createBaseCtx()">创建基础上下文</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__addStepCtx()">addStep()</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__setErrorCtx()">setError()</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__setTerminateCtx()">setTerminate()</button>
                </div>
                <div id="ctx-base-result" class="text-sm"></div>
            </div>
        </div>
    `)}window.__buildRequestContext=()=>{const e=document.getElementById("ctx-request-result");if(e)try{const t=document.getElementById("ctx-domain").value,n=document.getElementById("ctx-entity").value,s=document.getElementById("ctx-action").value,i=document.getElementById("ctx-url").value,r=document.getElementById("ctx-method").value,o=document.getElementById("ctx-params").value;let d={};try{d=JSON.parse(o)}catch{}const b=h.create().withDomain(t).withEntityName(n).withAction(s).withUrl(i).withMethod(r).withQueryParams(d).build();e.innerHTML=`<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(b,null,2)}</pre>`}catch(t){e.innerHTML=`<span class="badge badge-danger">构建失败: ${t}</span>`}};let a=null;window.__createBaseCtx=()=>{const e=document.getElementById("ctx-base-result");a=c.createBaseContext({metadata:{demo:!0}}),e&&(e.innerHTML=`<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(a,null,2)}</pre>`)};window.__addStepCtx=()=>{const e=document.getElementById("ctx-base-result");!a||!e||(c.addStep(a,{name:"ValidateProcessor",duration:12,status:"success"}),c.addStep(a,{name:"TransformProcessor",duration:8,status:"success"}),e.innerHTML=`<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(a,null,2)}</pre>`)};window.__setErrorCtx=()=>{const e=document.getElementById("ctx-base-result");!a||!e||(c.setError(a,new Error("验证失败")),e.innerHTML=`<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(a,(t,n)=>t==="error"?String(n):n,2)}</pre>`)};window.__setTerminateCtx=()=>{const e=document.getElementById("ctx-base-result");if(!a||!e)return;c.setTerminate(a,"验证失败，终止执行");const t=c.isTerminated(a);e.innerHTML=`<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(a,(n,s)=>n==="error"?String(s):s,2)}</pre>
    <div class="mt-2"><span class="badge ${t?"badge-danger":"badge-success"}">isTerminated: ${t}</span></div>`};export{A as renderContext};
