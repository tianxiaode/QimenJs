import{D as l}from"./tree-CYmgy4ES.js";import{r as p}from"./index-OvYsTaGM.js";import"@/composable";import"@/error";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";const a=new l;async function y(){p(`
        <div class="page-header">
            <h2>部门树</h2>
            <p>RemoteTreeEntityManager — 懒加载 + 展开/折叠 + 移动</p>
        </div>
        <div class="section">
            <div class="flex gap-2 mb-3">
                <button class="btn btn-ghost btn-sm" onclick="window.__loadDepartments()">刷新</button>
            </div>
            <div class="card">
                <div id="dept-tree"><div class="loading-skeleton" style="height:200px;"></div></div>
            </div>
        </div>
    `),await s()}async function s(){const n=document.getElementById("dept-tree");if(n)try{const t=await a.list();a.ingest(t),d(n)}catch(t){n.innerHTML=`<div class="error-msg">${t.message}</div>`}}function d(n){const t=a._generateFlatItems();if(t.length===0){n.innerHTML='<div class="text-muted text-sm" style="padding:16px;">暂无数据</div>';return}n.innerHTML=t.map(e=>{const r=(e._depth||0)*20,i=e.leaf?"·":e.expanded?"▾":"▸",o=e.leaf?"":`onclick="window.__toggleDept(${e.id})"`;return`
            <div class="tree-node" style="padding-left:${r+8}px;${e.leaf?"":"cursor:pointer;"}" ${o}>
                <span class="tree-toggle">${i}</span>
                <span>${e.name}</span>
                <span class="text-muted text-xs" style="margin-left:8px;">${e.employeeCount||0} 人</span>
                ${e.leaf?'<span class="badge badge-muted" style="margin-left:4px;">叶</span>':'<span class="badge badge-purple" style="margin-left:4px;">支</span>'}
            </div>
        `}).join("")+`<div class="text-muted text-xs" style="padding:8px;">共 ${t.length} 个可见节点 · RemoteTreeEntityManager</div>`}window.__loadDepartments=()=>s();window.__toggleDept=async n=>{const t=a.nodes.get(n);if(!t||t.leaf)return;t.expanded?a.collapse(n):await a.expand(n);const e=document.getElementById("dept-tree");e&&d(e)};export{y as renderDepartments};
