import{i as p,o as a,_ as r}from"./index-OvYsTaGM.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";var l;const s=(l=window.qimenI18n)==null?void 0:l.i18n;function u(){p();const e=s.locale||"zh-CN";document.getElementById("app").innerHTML=`
        <div class="login-page">
            <div class="login-card">
                <div style="position:absolute;top:16px;right:16px;">
                    <select id="login-lang" class="input" style="width:auto;padding:4px 8px;font-size:12px;" onchange="window.__changeLoginLang(this.value)">
                        <option value="zh-CN" ${e==="zh-CN"?"selected":""}>中文简体</option>
                        <option value="en-US" ${e==="en-US"?"selected":""}>English</option>
                        <option value="ja-JP" ${e==="ja-JP"?"selected":""}>日本語</option>
                    </select>
                </div>
                <h2>QimenJS</h2>
                <p class="subtitle">Enterprise Entity Framework</p>

                <div class="form-group">
                    <label>用户名</label>
                    <input id="username" class="input" type="text" value="admin" placeholder="输入用户名">
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input id="password" class="input" type="password" value="123456" placeholder="输入密码">
                </div>
                <div id="login-error" style="margin-bottom: 12px;"></div>
                <button class="btn btn-primary w-full" onclick="window.__login()" style="justify-content: center; padding: 10px;">密码模式登录</button>

                <div class="login-divider">其他方式</div>

                <div class="flex gap-2">
                    <button class="btn btn-ghost" style="flex:1; justify-content:center;" onclick="window.__authorize()">授权码模式</button>
                    <button class="btn btn-ghost" style="flex:1; justify-content:center;" onclick="window.__clientCredentials()">客户端凭证</button>
                </div>

                <div class="login-footer">
                    测试账号：admin / 123456
                </div>
            </div>
        </div>
    `}window.__changeLoginLang=async e=>{await s.loadScript(`/locales/${e}.js`),s.locale=e,u()};window.__login=async()=>{var i;const e=document.getElementById("username").value,t=document.getElementById("password").value,n=await a.loginWithPassword({username:e,password:t});if(n.success){const{showApp:o}=await r(async()=>{const{showApp:d}=await import("./index-OvYsTaGM.js").then(c=>c.m);return{showApp:d}},[]);o()}else document.getElementById("login-error").innerHTML=`<div class="error-msg">${((i=n.error)==null?void 0:i.message)||"登录失败"}</div>`};window.__authorize=()=>{a.authorize()};window.__clientCredentials=async()=>{var t;const e=await a.loginWithClientCredentials();if(e.success){const{showApp:n}=await r(async()=>{const{showApp:i}=await import("./index-OvYsTaGM.js").then(o=>o.m);return{showApp:i}},[]);n()}else document.getElementById("login-error").innerHTML=`<div class="error-msg">${((t=e.error)==null?void 0:t.message)||"登录失败"}</div>`};export{u as showLoginPage};
