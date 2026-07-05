import{r as b}from"./index-OvYsTaGM.js";import{c as p}from"./_commonjsHelpers-CZnAS8i4.js";import w from"@qimenjs/registry";import y from"@/pipeline";import"@qimenjs/error";import"@/registry/registrars/DomainRegistrar";var c={},u={},m={};Object.defineProperty(m,"__esModule",{value:!0});m.ValidatorRegistrarName=void 0;m.ValidatorRegistrarName="validator";Object.defineProperty(u,"__esModule",{value:!0});u.ValidatorRegistrar=void 0;const _=w,x=m;class d extends _.RegistrarBase{constructor(){super(...arguments),this.name=x.ValidatorRegistrarName,this.storage=[]}register(e){this.checkLock(),this.storage.push(e),d.chainCache.clear()}unregister(e){this.checkLock(),this.storage=this.storage.filter(a=>a.name!==e),d.chainCache.clear()}get(e){const a=e||"any";if(d.chainCache.has(a))return d.chainCache.get(a);const t=this.storage.filter(i=>i.tags.includes(a)||i.tags.includes("any")).sort((i,r)=>i.weight+i.offset-(r.weight+r.offset));return d.chainCache.set(a,t),t}lock(){this.checkLock(),this.isLocked=!0,console.log("🔒 [ValidatorRegistrar] Pipeline is now immutable.")}doInspect(){console.log("%c === Validation Engine Blueprint === ","color: white; background: #222; font-weight: bold;");const e=new Set;this.storage.forEach(a=>a.tags.forEach(t=>e.add(t))),e.forEach(a=>{const t=this.get(a);t.length>0&&(console.log(`
%c [Pipeline: ${a.toUpperCase()}] `,"color: #2196F3; font-weight: bold;"),console.table(t.map(i=>({Priority:i.weight+i.offset,"Station Name":i.name,Stage:this.getStageName(i.weight),Offset:i.offset}))))})}getStageName(e){return e<100?"PREPARATION":e<200?"PRESENCE":e<300?"SEMANTIC":e<400?"QUANTITY":e<500?"RELATION":"STRUCTURAL"}}u.ValidatorRegistrar=d;d.chainCache=new Map;var v={},n={};Object.defineProperty(n,"__esModule",{value:!0});n.validationExecutor=n.ValidationExecutor=void 0;const V=y;class f{constructor(){this.pipeline=new V.Pipeline}async execute(e,a,t){const i=a.map(r=>({name:r.name,weight:r.weight,offset:r.offset,description:r.description,execute:async l=>{await r.execute(l)}}));return await this.pipeline.execute(e,i,{enableTracking:!0,enableTiming:!0,breakOnError:!1,pipelineName:t?`Validation:${t}`:"Validation"})}getStats(){return this.pipeline.getStats()}resetStats(){this.pipeline.resetStats()}printReport(e){this.pipeline.printReport(e)}}n.ValidationExecutor=f;n.validationExecutor=new f;Object.defineProperty(v,"__esModule",{value:!0});v.doValidate=void 0;v.createContext=h;const E=u,N=n;function h(s,e,a={}){return{value:s,rawValue:s,rule:e,path:a.path||"root",terminate:!1,errors:[],steps:[],status:{isUndefined:!1,isNull:!1,isNaN:!1,isEmpty:!1,isModified:!1},metadata:{},...a}}const P=async(s,e,a={})=>{const t=h(s,e,a),r=E.ValidatorRegistrar.getInstance().get(e.type),l=await N.validationExecutor.execute(t,r,e.type);return t.steps=l.steps,{isValid:l.isSuccess&&t.errors.length===0,errors:t.errors,value:t.value,context:l.context}};v.doValidate=P;(function(s){var e=p&&p.__createBinding||(Object.create?function(t,i,r,l){l===void 0&&(l=r);var o=Object.getOwnPropertyDescriptor(i,r);(!o||("get"in o?!i.__esModule:o.writable||o.configurable))&&(o={enumerable:!0,get:function(){return i[r]}}),Object.defineProperty(t,l,o)}:function(t,i,r,l){l===void 0&&(l=r),t[l]=i[r]}),a=p&&p.__exportStar||function(t,i){for(var r in t)r!=="default"&&!Object.prototype.hasOwnProperty.call(i,r)&&e(i,t,r)};Object.defineProperty(s,"__esModule",{value:!0}),a(u,s),a(v,s),a(n,s)})(c);function T(){b(`
        <div class="page-header">
            <h2>表单验证</h2>
            <p>@qimenjs/validation — 11 类处理器 + 自定义规则 + 错误收集</p>
        </div>

        <div class="section">
            <div class="section-title">字符串验证</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>必填 + 长度限制</div>
                    <div class="form-group">
                        <label>用户名（3-20 字符）</label>
                        <input id="v-username" class="input" placeholder="输入用户名" oninput="window.__validateString()">
                    </div>
                    <div id="v-username-result" class="text-sm"></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>邮箱格式</div>
                    <div class="form-group">
                        <label>邮箱地址</label>
                        <input id="v-email" class="input" placeholder="输入邮箱" oninput="window.__validateEmail()">
                    </div>
                    <div id="v-email-result" class="text-sm"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">数字验证</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>范围约束</div>
                <div class="form-group">
                    <label>年龄（18-120）</label>
                    <input id="v-age" class="input" type="number" placeholder="输入年龄" oninput="window.__validateNumber()">
                </div>
                <div id="v-age-result" class="text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">密码验证</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#EF5350;"></span>强度规则</div>
                <div class="form-group">
                    <label>密码（8-32 位，需含大小写+数字+特殊字符）</label>
                    <input id="v-password" class="input" type="password" placeholder="输入密码" oninput="window.__validatePassword()">
                </div>
                <div id="v-password-result" class="text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">批量验证</div>
            <div class="card">
                <button class="btn btn-primary btn-sm" onclick="window.__validateAll()">验证全部</button>
                <div id="v-all-result" class="mt-3"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">API 一览</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>方法</th><th>说明</th><th>返回值</th></tr></thead>
                    <tbody>
                        <tr><td><code>doValidate(value, rule)</code></td><td>核心验证函数</td><td>ValidationResult { isValid, errors, ... }</td></tr>
                        <tr><td><code>validate.validate(value, rule)</code></td><td>通用语法糖</td><td>IValidationError[] | null</td></tr>
                        <tr><td><code>validate.string(value, rule)</code></td><td>字符串验证</td><td>IValidationError[] | null</td></tr>
                        <tr><td><code>validate.number(value, rule)</code></td><td>数字验证</td><td>IValidationError[] | null</td></tr>
                        <tr><td><code>validate.email(value, rule)</code></td><td>邮箱验证</td><td>IValidationError[] | null</td></tr>
                        <tr><td><code>validate.password(value, rule)</code></td><td>密码验证</td><td>IValidationError[] | null</td></tr>
                        <tr><td><code>assert.string(value, rule)</code></td><td>断言式验证（失败抛异常）</td><td>void</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `)}function g(s,e){const a=document.getElementById(s);a&&(e.isValid?a.innerHTML='<span class="badge badge-success">✓ 通过</span>':a.innerHTML=e.errors.map(t=>`<span class="badge badge-danger" style="margin:2px;">${t.code}</span>`).join(" "))}window.__validateString=async()=>{const s=document.getElementById("v-username").value,e=await c.doValidate(s,{type:"string",required:!0,minLength:3,maxLength:20});g("v-username-result",e)};window.__validateEmail=async()=>{const s=document.getElementById("v-email").value,e=await c.doValidate(s,{type:"string",required:!0,format:"email"});g("v-email-result",e)};window.__validateNumber=async()=>{const s=Number(document.getElementById("v-age").value),e=await c.doValidate(s,{type:"number",required:!0,min:18,max:120});g("v-age-result",e)};window.__validatePassword=async()=>{const s=document.getElementById("v-password").value,e=await c.doValidate(s,{type:"password"});g("v-password-result",e)};window.__validateAll=async()=>{const s=document.getElementById("v-all-result");if(!s)return;const e=[{label:"空字符串 required",value:"",rule:{type:"string",required:!0}},{label:"短字符串 min",value:"ab",rule:{type:"string",minLength:3}},{label:"有效邮箱",value:"test@example.com",rule:{type:"string",format:"email"}},{label:"无效邮箱",value:"not-email",rule:{type:"string",format:"email"}},{label:"数字范围 OK",value:25,rule:{type:"number",min:18,max:120}},{label:"数字范围 NG",value:5,rule:{type:"number",min:18,max:120}}];let a="";for(const t of e){const i=await c.doValidate(t.value,t.rule);a+=`<div class="flex items-center gap-2 mb-2">
            <span class="badge ${i.isValid?"badge-success":"badge-danger"}">${i.isValid?"✓":"✗"}</span>
            <span class="text-sm">${t.label}</span>
            <span class="text-muted text-xs">value: ${JSON.stringify(t.value)}</span>
        </div>`}s.innerHTML=a};export{T as renderValidation};
