import{a as i}from"./abp-BjLiPpgK.js";import"./tree-CYmgy4ES.js";import{r}from"./index-OvYsTaGM.js";import"@/composable";import"@/error";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";const d=new i;async function v(){r(`
        <div class="page-header">
            <h2>ABP 产品</h2>
            <p>RemoteCrudEntityManager — 远程 CRUD + ABP 分页格式</p>
        </div>
        <div class="section">
            <div class="card">
                <div id="product-table"><div class="loading-skeleton" style="height:200px;"></div></div>
            </div>
        </div>
    `),await s()}async function s(){const a=document.getElementById("product-table");if(a)try{const e=await d.list();a.innerHTML=`
            <table class="data-table">
                <thead><tr><th>ID</th><th>名称</th><th>价格</th><th>库存</th><th>分类</th></tr></thead>
                <tbody>${e.map(t=>`
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
                <span class="text-muted text-sm">共 ${d.total} 条 · RemoteCrudEntityManager · ABP PagedResultDto</span>
            </div>
        `}catch(e){a.innerHTML=`<div class="error-msg">${e.message}</div>`}}export{v as renderAbpProducts};
