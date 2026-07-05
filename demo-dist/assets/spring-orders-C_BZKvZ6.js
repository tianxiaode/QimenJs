import{S as d}from"./spring-ChL9TfTS.js";import"./tree-CYmgy4ES.js";import{r}from"./index-OvYsTaGM.js";import"@/composable";import"@/error";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";const t=new d;async function u(){r(`
        <div class="page-header">
            <h2>Spring 订单</h2>
            <p>RemoteCrudEntityManager — Spring Page&lt;T&gt; 分页格式 + 分页导航</p>
        </div>
        <div class="section">
            <div class="card">
                <div id="order-table"><div class="loading-skeleton" style="height:200px;"></div></div>
            </div>
            <div class="pagination" id="order-pagination"></div>
        </div>
    `),await e()}async function e(){const a=document.getElementById("order-table"),s=document.getElementById("order-pagination");if(a)try{const i=await t.list(),o={COMPLETED:"badge-success",PENDING:"badge-warning",SHIPPED:"badge-info",CANCELLED:"badge-danger"};a.innerHTML=`
            <table class="data-table">
                <thead><tr><th>ID</th><th>订单号</th><th>客户</th><th>金额</th><th>状态</th></tr></thead>
                <tbody>${i.map(n=>`
                    <tr>
                        <td>${n.id}</td>
                        <td>${n.orderNo}</td>
                        <td>${n.customer}</td>
                        <td>¥${n.amount}</td>
                        <td><span class="badge ${o[n.status]||"badge-muted"}">${n.status}</span></td>
                    </tr>
                `).join("")}</tbody>
            </table>
        `,s&&(s.innerHTML=`
                <button class="btn btn-ghost btn-sm" onclick="window.__prevPage()">上一页</button>
                <span class="page-info">第 ${t.page} / ${t.pages} 页（每页 ${t.pageSize} 条，共 ${t.total} 条）</span>
                <button class="btn btn-ghost btn-sm" onclick="window.__nextPage()">下一页</button>
                <span style="margin-left:12px;" class="text-muted text-xs">每页条数：</span>
                <button class="btn btn-ghost btn-sm" onclick="window.__changeSize(5)">5</button>
                <button class="btn btn-ghost btn-sm" onclick="window.__changeSize(10)">10</button>
                <button class="btn btn-ghost btn-sm" onclick="window.__changeSize(20)">20</button>
                <button class="btn btn-ghost btn-sm" onclick="window.__changeSize(50)">50</button>
            `)}catch(i){a.innerHTML=`<div class="error-msg">${i.message}</div>`}}window.__prevPage=async()=>{await t.prev(),await e()};window.__nextPage=async()=>{await t.next(),await e()};window.__changeSize=async a=>{await t.changeSize(a),await e()};export{u as renderSpringOrders};
