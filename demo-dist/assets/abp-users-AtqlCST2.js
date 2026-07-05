import{A as i}from"./abp-BjLiPpgK.js";import"./tree-CYmgy4ES.js";import{r as d}from"./index-OvYsTaGM.js";import"@/composable";import"@/error";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";const a=new i;async function g(){d(`
        <div class="page-header">
            <h2>ABP 用户</h2>
            <p>RemoteCrudEntityManager — 远程 CRUD + ABP 分页格式</p>
        </div>
        <div class="section">
            <div class="flex items-center justify-between mb-3">
                <div class="flex gap-2">
                    <input id="user-filter" class="input" style="width:200px;" placeholder="搜索用户名/姓名/邮箱..." onkeydown="if(event.key==='Enter')window.__filterUsers(this.value)">
                    <button class="btn btn-ghost btn-sm" onclick="window.__filterUsers(document.getElementById('user-filter').value)">搜索</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__resetUsers()">重置</button>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-ghost btn-sm" onclick="window.__sortUsers('id','asc')">ID ↑</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__sortUsers('id','desc')">ID ↓</button>
                </div>
            </div>
            <div class="card">
                <div id="user-table"><div class="loading-skeleton" style="height:200px;"></div></div>
            </div>
        </div>
    `),await n()}async function n(){const t=document.getElementById("user-table");if(t)try{const s=await a.list();t.innerHTML=`
            <table class="data-table">
                <thead><tr><th>ID</th><th>用户名</th><th>姓名</th><th>邮箱</th><th>状态</th></tr></thead>
                <tbody>${s.map(e=>`
                    <tr>
                        <td>${e.id}</td>
                        <td>${e.userName}</td>
                        <td>${e.name}</td>
                        <td>${e.email}</td>
                        <td>${e.isActive?'<span class="badge badge-success">活跃</span>':'<span class="badge badge-muted">禁用</span>'}</td>
                    </tr>
                `).join("")}</tbody>
            </table>
            <div class="pagination" style="margin-top:12px;">
                <span class="text-muted text-sm">共 ${a.total} 条 · RemoteCrudEntityManager · ABP PagedResultDto</span>
            </div>
        `}catch(s){t.innerHTML=`<div class="error-msg">${s.message}</div>`}}window.__filterUsers=async t=>{await a.filter(t),await n()};window.__sortUsers=async(t,s)=>{await a.sort(t,s),await n()};window.__resetUsers=async()=>{await a.reset(),await n()};export{g as renderAbpUsers};
