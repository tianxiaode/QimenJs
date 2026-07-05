import{a as s}from"./local-DemgwnIB.js";import"./tree-CYmgy4ES.js";import{r as d}from"./index-OvYsTaGM.js";import"@/composable";import"@/error";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";const t=new s;function r(){const e=[{id:1,name:"重要",color:"#f44336",count:5},{id:2,name:"待办",color:"#FF9800",count:12},{id:3,name:"已完成",color:"#4CAF50",count:28},{id:4,name:"进行中",color:"#2196F3",count:8}];t.sourceData.clear(),e.forEach(a=>t.sourceData.set(a.id,a)),t.items=[...e]}function v(){r(),o()}function o(){d(`
        <div class="page-header">
            <h2>本地标签</h2>
            <p>LocalCrudEntityManager — 纯前端 CRUD，无后端依赖</p>
        </div>
        <div class="section">
            <div class="flex gap-2 mb-3">
                <button class="btn btn-primary btn-sm" onclick="window.__addTag()">添加标签</button>
                <button class="btn btn-danger btn-sm" onclick="window.__removeTag()">删除最后一个</button>
            </div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>名称</th><th>颜色</th><th>使用次数</th></tr></thead>
                    <tbody>${t.items.map(e=>`
                        <tr>
                            <td>${e.id}</td>
                            <td><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${e.color};margin-right:6px;vertical-align:middle;"></span>${e.name}</td>
                            <td class="text-muted">${e.color}</td>
                            <td>${e.count}</td>
                        </tr>
                    `).join("")}</tbody>
                </table>
                <div class="pagination" style="margin-top:12px;">
                    <span class="text-muted text-sm">共 ${t.items.length} 条 · LocalCrudEntityManager（支持 create/update/delete）</span>
                </div>
            </div>
        </div>
    `)}window.__addTag=()=>{const e=["#f44336","#FF9800","#4CAF50","#2196F3","#9C27B0","#795548"],a=["紧急","优化","文档","测试","设计","部署"],i=t.items.length%a.length,n={id:t.items.length+1,name:a[i],color:e[i],count:0};t.sourceData.set(n.id,n),t.items=[...t.items,n],o()};window.__removeTag=()=>{if(t.items.length===0)return;const e=t.items[t.items.length-1];t.sourceData.delete(e.id),t.items=t.items.slice(0,-1),o()};export{v as renderTags};
