import{r as c}from"./index-OvYsTaGM.js";import{C as l}from"./ComposableBase-B596R9at.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";import"@/logger";import"@qimenjs/async";const r={count:{get(){return this.abilityState("CounterAbility:count",()=>0)}},increment(){this.setAbilityState("CounterAbility:count",this.count+1)},reset(){this.setAbilityState("CounterAbility:count",0)}},m={tags:{get(){return this.abilityState("TagAbility:tags",()=>[])}},addTag(t){this.setAbilityState("TagAbility:tags",[...this.tags,t])},removeTag(t){this.setAbilityState("TagAbility:tags",this.tags.filter(e=>e!==t))}},a=class a extends l{};a.abilities=[r,m];let s=a,i=null;function A(){i=new s,c(`
        <div class="page-header">
            <h2>组合能力</h2>
            <p>@qimenjs/composable — ComposableBase + AbilityDefinition</p>
        </div>

        <div class="section">
            <div class="section-title">能力组合架构</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    QimenJS 的能力组合系统采用纯对象模式。Ability 是普通对象（不是类），
                    通过 <code>Object.defineProperty</code> 复制到宿主。宿主类继承 <code>ComposableBase</code>，
                    在 <code>static abilities</code> 数组中声明所需能力，构造时自动装配。
                </p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">CounterAbility 演示</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>计数器能力</div>
                <div class="mt-2 mb-3">
                    <span class="text-sm">当前计数: </span>
                    <span id="comp-count" style="font-size:24px;font-weight:bold;color:#6366F1;">0</span>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__compIncrement()">increment()</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__compReset()">reset()</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">TagAbility 演示</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>标签能力</div>
                <div class="form-group">
                    <input id="comp-tag-input" class="input" value="QimenJS" placeholder="输入标签名">
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__compAddTag()">addTag()</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__compRemoveTag()">removeTag()</button>
                </div>
                <div id="comp-tags" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">AbilityDefinition 结构</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>能力定义格式</div>
                <p class="text-sm text-muted mb-3">AbilityDefinition 是普通对象，属性可以是 getter 描述符或方法</p>
                <table class="data-table">
                    <thead><tr><th>类型</th><th>定义方式</th><th>说明</th></tr></thead>
                    <tbody>
                        <tr><td>计算属性</td><td><code>get() { return this.abilityState(key, init) }</code></td><td>通过 getter + abilityState 实现惰性初始化</td></tr>
                        <tr><td>方法</td><td><code>methodName() { this.setAbilityState(key, val) }</code></td><td>通过 setAbilityState 修改状态</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">能力状态管理</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    <code>abilityState(key, creator)</code> 获取或创建能力私有状态，每个能力通过唯一的 key 前缀隔离状态。
                    <code>setAbilityState(key, value)</code> 设置能力状态。状态存储在宿主实例上，不同实例互不干扰。
                </p>
            </div>
        </div>
    `)}function n(){const t=document.getElementById("comp-count");t&&i&&(t.textContent=String(i.count))}function o(){const t=document.getElementById("comp-tags");if(!t||!i)return;const e=i.tags;e.length===0?t.innerHTML='<span class="text-muted">暂无标签</span>':t.innerHTML=e.map(d=>`<span class="badge badge-info" style="margin:2px;">${d}</span>`).join("")}window.__compIncrement=()=>{i&&(i.increment(),n())};window.__compReset=()=>{i&&(i.reset(),n())};window.__compAddTag=()=>{const t=document.getElementById("comp-tag-input").value;i&&t&&(i.addTag(t),o())};window.__compRemoveTag=()=>{const t=document.getElementById("comp-tag-input").value;i&&t&&(i.removeTag(t),o())};export{A as renderComposable};
