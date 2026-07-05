import{L as s}from"./local-DemgwnIB.js";import"./tree-CYmgy4ES.js";import{r as d}from"./index-OvYsTaGM.js";import"@/composable";import"@/error";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";const e=new s;function i(){const a=[{id:1,title:"系统维护通知",message:"系统将于今晚 22:00 进行维护",type:"system",read:!1,createdAt:"2026-07-03 09:00"},{id:2,title:"新功能上线",message:"树形管理器已上线，支持懒加载",type:"feature",read:!1,createdAt:"2026-07-02 14:30"},{id:3,title:"安全提醒",message:"请定期修改密码",type:"security",read:!0,createdAt:"2026-07-01 10:00"},{id:4,title:"版本更新",message:"v2.0 已发布，新增 5 种 Manager 类型",type:"feature",read:!0,createdAt:"2026-06-30 16:00"}];e.sourceData.clear(),a.forEach(t=>e.sourceData.set(t.id,t)),e.items=[...a]}function y(){i();const a={system:"badge-danger",feature:"badge-success",security:"badge-warning"};d(`
        <div class="page-header">
            <h2>本地通知</h2>
            <p>LocalReadonlyEntityManager — 纯前端数据，无后端依赖</p>
        </div>
        <div class="section">
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>标题</th><th>类型</th><th>状态</th><th>时间</th></tr></thead>
                    <tbody>${e.items.map(t=>`
                        <tr>
                            <td>${t.id}</td>
                            <td>${t.title}</td>
                            <td><span class="badge ${a[t.type]||"badge-muted"}">${t.type}</span></td>
                            <td>${t.read?'<span class="badge badge-muted">已读</span>':'<span class="badge badge-info">未读</span>'}</td>
                            <td class="text-muted">${t.createdAt}</td>
                        </tr>
                    `).join("")}</tbody>
                </table>
                <div class="pagination" style="margin-top:12px;">
                    <span class="text-muted text-sm">共 ${e.items.length} 条 · LocalReadonlyEntityManager（只读）</span>
                </div>
            </div>
        </div>
    `)}export{y as renderNotifications};
