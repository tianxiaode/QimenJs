import{i as l,o,_ as c}from"./index-OvYsTaGM.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";async function u(){var i;l();const s=document.getElementById("app");s.innerHTML=`
        <div class="login-page">
            <div class="login-card">
                <h2>授权回调中...</h2>
                <p class="subtitle">正在处理 OAuth2 授权码</p>
                <div class="loading-skeleton" style="height:16px;width:200px;margin:16px auto;"></div>
            </div>
        </div>
    `;try{const t=await o.handleCallback();if(t.success){const{showApp:a}=await c(async()=>{const{showApp:n}=await import("./index-OvYsTaGM.js").then(e=>e.m);return{showApp:n}},[]);a()}else s.innerHTML=`
                <div class="login-page">
                    <div class="login-card">
                        <h2>授权失败</h2>
                        <p class="subtitle">${((i=t.error)==null?void 0:i.message)||"未知错误"}</p>
                        <button class="btn btn-primary" style="justify-content:center;" onclick="location.href='/'">返回登录</button>
                    </div>
                </div>
            `}catch(t){s.innerHTML=`
            <div class="login-page">
                <div class="login-card">
                    <h2>授权异常</h2>
                    <p class="subtitle">${t.message}</p>
                    <button class="btn btn-primary" style="justify-content:center;" onclick="location.href='/'">返回登录</button>
                </div>
            </div>
        `}}export{u as handleCallback};
