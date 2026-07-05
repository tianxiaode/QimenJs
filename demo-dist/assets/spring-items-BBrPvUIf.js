import{a as i}from"./spring-ChL9TfTS.js";import"./tree-CYmgy4ES.js";import{r as d}from"./index-OvYsTaGM.js";import"@/composable";import"@/error";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";const n=new i;async function v(){d(`
        <div class="page-header">
            <h2>Spring 商品</h2>
            <p>RemoteReadonlyEntityManager — 只读列表 + Spring Page&lt;T&gt; 格式</p>
        </div>
        <div class="section">
            <div class="card">
                <div id="item-table"><div class="loading-skeleton" style="height:200px;"></div></div>
            </div>
        </div>
    `),await r()}async function r(){const e=document.getElementById("item-table");if(e)try{const a=await n.list();e.innerHTML=`
            <table class="data-table">
                <thead><tr><th>ID</th><th>名称</th><th>价格</th><th>库存</th><th>分类</th></tr></thead>
                <tbody>${a.map(t=>`
                    <tr>
                        <td>${t.id}</td>
                        <td>${t.name}</td>
                        <td>¥${t.price}</td>
                        <td>${t.stock}</td>
                        <td><span class="badge badge-info">${t.category}</span></td>
                    </tr>
                `).join("")}</tbody>
            </table>
            <div class="pagination" style="margin-top:12px;">
                <span class="text-muted text-sm">共 ${n.total} 条 · RemoteReadonlyEntityManager（无 create/update/delete）</span>
            </div>
        `}catch(a){e.innerHTML=`<div class="error-msg">${a.message}</div>`}}export{v as renderSpringItems};
