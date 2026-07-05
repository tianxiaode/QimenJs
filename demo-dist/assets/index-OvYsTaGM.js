const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/dashboard-0S7WDXOJ.js","assets/abp-BjLiPpgK.js","assets/tree-CYmgy4ES.js","assets/spring-ChL9TfTS.js","assets/local-DemgwnIB.js","assets/utils-r26HbpqH.js","assets/_commonjsHelpers-CZnAS8i4.js","assets/events-CGweyZG7.js","assets/EventBus-Duu_hJnQ.js","assets/task-9lF4TT5r.js","assets/composable-B1mK-Jlv.js","assets/ComposableBase-B596R9at.js","assets/context-CchdoiAr.js","assets/validation-BroVdrj3.js","assets/event-dom-Y0QkNVdh.js","assets/system-abilities-Dy_V4c6-.js","assets/abp-users-AtqlCST2.js","assets/abp-products-BwWVRsUm.js","assets/spring-orders-C_BZKvZ6.js","assets/spring-items-BBrPvUIf.js","assets/departments-Dulh1tSD.js","assets/notifications-mfyecmsc.js","assets/tags-CbQuq1Lh.js"])))=>i.map(i=>d[i]);
import W from"@qimenjs/error";import Y from"@qimenjs/registry";import Q from"@/registry/registrars/DomainRegistrar";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const n of a.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function r(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerPolicy&&(a.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?a.credentials="include":t.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(t){if(t.ep)return;t.ep=!0;const a=r(t);fetch(t.href,a)}})();const X="modulepreload",Z=function(o){return"/Program%20Files/Git/qimenjs/"+o},F={},s=function(e,r,i){let t=Promise.resolve();if(r&&r.length>0){document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),l=(n==null?void 0:n.nonce)||(n==null?void 0:n.getAttribute("nonce"));t=Promise.allSettled(r.map(c=>{if(c=Z(c),c in F)return;F[c]=!0;const p=c.endsWith(".css"),u=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${u}`))return;const d=document.createElement("link");if(d.rel=p?"stylesheet":X,p||(d.as="script"),d.crossOrigin="",d.href=c,l&&d.setAttribute("nonce",l),document.head.appendChild(d),p)return new Promise((h,g)=>{d.addEventListener("load",h),d.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${c}`)))})}))}function a(n){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=n,window.dispatchEvent(l),!l.defaultPrevented)throw n}return t.then(n=>{for(const l of n||[])l.status==="rejected"&&a(l.reason);return e().catch(a)})};var m={};Object.defineProperty(m,"__esModule",{value:!0});m.RegistryHubConflictError=m.RegistryHubLockedError=m.RegistryHubError=m.RegistryHubErrorCode=void 0;const ee=W;var A;(function(o){o.REGISTRATION_LOCKED="REGISTRY_REGISTRATION_LOCKED",o.REGISTRATION_CONFLICT="REGISTRY_REGISTRATION_CONFLICT"})(A||(m.RegistryHubErrorCode=A={}));class I extends ee.ErrorBase{constructor(e,r,i){super(e,r,i)}}m.RegistryHubError=I;class te extends I{constructor(e){super("[RegistryHub] Registration failed: The hub is locked. Registrations must be completed during the bootstrap phase.",A.REGISTRATION_LOCKED,{...e,phase:"bootstrap"})}}m.RegistryHubLockedError=te;class re extends I{constructor(e,r){const i=`[RegistryHub] Conflict: "${e}" already exists.`;super(i,A.REGISTRATION_CONFLICT,{...r,registrarName:e})}}m.RegistryHubConflictError=re;var k={},N;Object.defineProperty(k,"__esModule",{value:!0});var V=k.Registry=k.RegistryHub=void 0;const L=m;class x{static lock(){this.isLocked=!0,this.registars.forEach(e=>{e.lock()}),Object.freeze(this.registars)}static use(e,r=!1){if(this.isLocked)throw new L.RegistryHubLockedError({registrarName:e.name});const{name:i}=e;if(this.registars.has(i)&&!r)throw new L.RegistryHubConflictError(i);return this.registars.set(i,e),e}static debug(...e){if(e.length>0){e.forEach(r=>{this.registars.get(r).inspect()});return}this.registars.forEach(r=>r.inspect())}static get(e){return this.registars.get(e)}}k.RegistryHub=x;N=x;x.registars=new Map;x.isLocked=!1;x.root=new Proxy({},{get:(o,e)=>N.registars.get(e)});V=k.Registry=x.root;var j={};(function(o){Object.defineProperty(o,"__esModule",{value:!0}),o.SchemaRegistrar=o.SchemaRegistrarName=void 0;const e=Y;o.SchemaRegistrarName="schema";class r extends e.RegistrarBase{constructor(){super(...arguments),this.name=o.SchemaRegistrarName,this.storage={schemas:new Map,fields:new Map,compiled:new Map}}register(t,a){if(this.checkLock(),typeof t=="string"){if(!a)throw new Error("[SchemaRegistrar] Field group requires a name and fields array");this.storage.fields.set(t,a)}else{const n=t;if(!n.name)throw new Error("[SchemaRegistrar] Schema must have a name property");this.storage.schemas.has(n.name)&&console.warn(`[SchemaRegistrar] Schema "${n.name}" is already registered, overwriting`),this.storage.schemas.set(n.name,n)}}unregister(t){this.checkLock(),this.storage.schemas.delete(t),this.storage.fields.delete(t)}get(t,a="schema"){if(a==="field"){const l=this.storage.fields.get(t);if(!l)throw new Error(`[SchemaRegistrar] Field group "${t}" not found`);return l}const n=this.storage.schemas.get(t);if(!n)throw new Error(`[SchemaRegistrar] Schema "${t}" not found`);return n}getField(t){return this.get(t,"field")}getCompiled(t){let a=this.storage.compiled.get(t);if(a)return a;const n=this.storage.schemas.get(t);if(!n)throw new Error(`[SchemaRegistrar] Schema "${t}" not found`);return a=this.compileSchema(t,n),this.storage.compiled.set(t,a),a}compileSchema(t,a){const n=new Map,l=new Set,c={},p=a.override||{};if(a.extends){const h=this.storage.schemas.get(a.extends);h&&this.processFieldBatch(h.fields||[],n,l,c,p)}a.mixins&&a.mixins.forEach(h=>{const g=this.storage.fields.get(h);g&&this.processFieldBatch(g,n,l,c,p)}),this.processFieldBatch(a.fields||[],n,l,c,p);const u=Array.from(n.values()),d={...a,fields:u};return d.searchFields=Array.from(l),this.ensureTreeDefaults(d),{schema:d,rules:c,idType:d.idType||"string"}}processFieldBatch(t,a,n,l,c){for(const p of t){if(!(p!=null&&p.name))continue;const u=p.name,d=a.get(u),h=c[u],g={...d,...p,...h};a.set(u,g),g.searchable?n.add(u):n.delete(u);const v=this.extractRule(g);v.length>0?l[u]=v:delete l[u]}}extractRule(t){const{name:a,label:n,seachable:l,defaultValue:c,readonly:p,mapping:u,rules:d,...h}=t;let g;const v=h.type;t.type==="string"?(g="string",t.hasOwnProperty("separator")?g="split":(t.hasOwnProperty("pattern")||t.hasOwnProperty("format"))&&(g="format")):["password","number","date","boolean"].includes(v)&&(g=v);const O=Array.isArray(d)?d:d?[d]:[];return g?[{...h,type:g,field:a},...O]:O}ensureTreeDefaults(t){t.isTree&&(t.parentIdField=t.parentIdField||"parentId",t.childrenField=t.childrenField||"children",t.root===void 0&&(t.root=null))}has(t,a="schema"){return a==="field"?this.storage.fields.has(t):this.storage.schemas.has(t)}getAllSchemaNames(){return Array.from(this.storage.schemas.keys())}getAllFieldNames(){return Array.from(this.storage.fields.keys())}clear(){this.checkLock(),this.storage.schemas.clear(),this.storage.fields.clear(),this.storage.compiled.clear()}doInspect(){console.log("📊 Schemas:",this.storage.schemas.size),console.log("📋 Field Groups:",this.storage.fields.size),console.log("⚡ Compiled:",this.storage.compiled.size),this.storage.schemas.size>0&&(console.log(`
📦 Schemas:`),this.storage.schemas.forEach((t,a)=>{var n;const l=this.storage.compiled.has(a)?"✓":" ";console.log(`  ${l} - ${a} (${((n=t.fields)===null||n===void 0?void 0:n.length)||0} fields)`)})),this.storage.fields.size>0&&(console.log(`
📋 Field Groups:`),this.storage.fields.forEach((t,a)=>{console.log(`  - ${a} (${t.length} fields)`)}))}}o.SchemaRegistrar=r})(j);var b={};Object.defineProperty(b,"__esModule",{value:!0});b.SessionStorageTokenStorage=b.LocalStorageTokenStorage=b.MemoryTokenStorage=void 0;b.createTokenStorage=oe;const _="qimenjs_oauth2_token";class B{constructor(){this.entry=null}get(){return this.entry}set(e){this.entry={...e}}clear(){this.entry=null}}b.MemoryTokenStorage=B;class U{get(){try{const e=localStorage.getItem(_);return e?JSON.parse(e):null}catch{return null}}set(e){localStorage.setItem(_,JSON.stringify(e))}clear(){localStorage.removeItem(_)}}b.LocalStorageTokenStorage=U;class q{get(){try{const e=sessionStorage.getItem(_);return e?JSON.parse(e):null}catch{return null}}set(e){sessionStorage.setItem(_,JSON.stringify(e))}clear(){sessionStorage.removeItem(_)}}b.SessionStorageTokenStorage=q;function oe(o){switch(o){case"localStorage":return new U;case"sessionStorage":return new q;default:return new B}}var w={};Object.defineProperty(w,"__esModule",{value:!0});var f=w.oauth2=w.OAuth2Manager=void 0;const D=b,z=Q;class M{constructor(){this.config=null,this.storage=(0,D.createTokenStorage)(),this.refreshPromise=null,this.listeners=new Map}configure(e){this.config=e,this.storage=(0,D.createTokenStorage)(e.storage);const r=this.storage.get();r!=null&&r.accessToken&&this.applyToken(r.accessToken)}async loginWithPassword(e){const r={grant_type:"password",username:e.username,password:e.password};return e.scope&&(r.scope=e.scope),this.requestToken(r)}async loginWithCode(e){var r;if(!(!((r=this.config)===null||r===void 0)&&r.redirectUri))return{success:!1,error:{message:"redirectUri is required for authorization_code grant"}};const i={grant_type:"authorization_code",code:e,redirect_uri:this.config.redirectUri};return this.requestToken(i)}async loginWithClientCredentials(){const e={grant_type:"client_credentials"};return this.requestToken(e)}async refreshToken(){if(this.refreshPromise)return this.refreshPromise;this.refreshPromise=this.doRefresh();try{return await this.refreshPromise}finally{this.refreshPromise=null}}async revokeToken(){var e;const r=this.storage.get();if(!(!(r!=null&&r.accessToken)||!(!((e=this.config)===null||e===void 0)&&e.revokeEndpoint)))try{const i={token:r.accessToken};r.tokenType&&(i.token_type_hint=r.tokenType),await this.sendRequest(this.config.revokeEndpoint,i)}catch{}}getToken(){const e=this.storage.get();return!(e!=null&&e.accessToken)||this.isTokenExpired(e)?null:e.accessToken}isAuthenticated(){return this.getToken()!==null}async logout(){await this.revokeToken(),this.storage.clear(),this.clearAppliedToken()}getAuthorizationUrl(e){var r,i,t,a;if(!(!((r=this.config)===null||r===void 0)&&r.authorizationEndpoint))throw new Error("authorizationEndpoint is required");if(!(!((i=this.config)===null||i===void 0)&&i.clientId))throw new Error("clientId is required");if(!(!((t=this.config)===null||t===void 0)&&t.redirectUri))throw new Error("redirectUri is required");const n=new URLSearchParams({response_type:"code",client_id:this.config.clientId,redirect_uri:this.config.redirectUri});return!((a=this.config.scopes)===null||a===void 0)&&a.length&&n.set("scope",this.config.scopes.join(" ")),e&&n.set("state",e),`${this.config.authorizationEndpoint}?${n.toString()}`}authorize(e){const r=this.getAuthorizationUrl(e);window.location.href=r}on(e,r){return this.listeners.has(e)||this.listeners.set(e,new Set),this.listeners.get(e).add(r),()=>{var i;return(i=this.listeners.get(e))===null||i===void 0?void 0:i.delete(r)}}async requestToken(e){var r;if(!this.config)return{success:!1,error:{message:"OAuth2 is not configured"}};this.config.clientId&&(e.client_id=this.config.clientId),this.config.clientSecret&&(e.client_secret=this.config.clientSecret),!((r=this.config.scopes)===null||r===void 0)&&r.length&&!e.scope&&(e.scope=this.config.scopes.join(" "));try{const i=await this.sendRequest(this.config.tokenEndpoint,e);if(!i.ok){const a=await this.parseErrorResponse(i);return{success:!1,error:{code:a.error,message:a.error_description||`Token request failed: ${i.status}`}}}const t=await i.json();return this.saveToken(t),this.applyToken(t.access_token),this.emit("oauth2:token-acquired",{accessToken:t.access_token,refreshToken:t.refresh_token,expiresIn:t.expires_in}),{success:!0,accessToken:t.access_token}}catch(i){return{success:!1,error:{message:i.message||"Network error"}}}}async doRefresh(){const e=this.storage.get();if(!(e!=null&&e.refreshToken)||!this.config)return this.emit("oauth2:refresh-failed",{error:new Error("No refresh token available")}),!1;const r={grant_type:"refresh_token",refresh_token:e.refreshToken};this.config.clientId&&(r.client_id=this.config.clientId),this.config.clientSecret&&(r.client_secret=this.config.clientSecret);try{const i=await this.sendRequest(this.config.tokenEndpoint,r);if(!i.ok)return this.emit("oauth2:refresh-failed",{error:new Error(`Refresh failed: ${i.status}`)}),!1;const t=await i.json();return this.saveToken(t),this.applyToken(t.access_token),this.emit("oauth2:token-refreshed",{accessToken:t.access_token,refreshToken:t.refresh_token,expiresIn:t.expires_in}),!0}catch(i){return this.emit("oauth2:refresh-failed",{error:i}),!1}}saveToken(e){const r={accessToken:e.access_token,refreshToken:e.refresh_token,tokenType:e.token_type,expiresIn:e.expires_in,scope:e.scope,acquiredAt:Date.now()};this.storage.set(r)}applyToken(e){if(!this.config)return;const r=Array.isArray(this.config.domain)?this.config.domain:[this.config.domain];z.DomainRegistrar.getInstance().updateToken(e,...r)}clearAppliedToken(){if(!this.config)return;const e=Array.isArray(this.config.domain)?this.config.domain:[this.config.domain];z.DomainRegistrar.getInstance().clearToken(...e)}isTokenExpired(e){var r,i;if(!e.expiresIn)return!1;const t=(i=(r=this.config)===null||r===void 0?void 0:r.refreshBuffer)!==null&&i!==void 0?i:6e4;return Date.now()>=e.acquiredAt+e.expiresIn*1e3-t}async sendRequest(e,r){return fetch(e,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(r).toString()})}async parseErrorResponse(e){try{return await e.json()}catch{return{}}}emit(e,r){const i=this.listeners.get(e);if(i)for(const t of i)try{t(r)}catch{}}}w.OAuth2Manager=M;f=w.oauth2=new M;const ie={name:"AbpUser",domain:"abp",idField:"id",idType:"number",isTree:!1,searchFields:["userName","name","email"],defaultSort:"id",defaultOrder:"desc",fields:[{name:"id",type:"number",readonly:!0},{name:"userName",type:"string",searchable:!0,label:"用户名"},{name:"name",type:"string",searchable:!0,label:"姓名"},{name:"email",type:"string",searchable:!0,label:"邮箱"},{name:"isActive",type:"boolean",label:"状态"},{name:"creationTime",type:"date",readonly:!0,label:"创建时间"}]},ae={name:"AbpProduct",domain:"abp",idField:"id",idType:"number",isTree:!1,searchFields:["name","category"],defaultSort:"id",defaultOrder:"desc",fields:[{name:"id",type:"number",readonly:!0},{name:"name",type:"string",searchable:!0,label:"名称"},{name:"price",type:"number",label:"价格"},{name:"stock",type:"number",label:"库存"},{name:"category",type:"string",searchable:!0,label:"分类"},{name:"creationTime",type:"date",readonly:!0,label:"创建时间"}]},ne={name:"SpringOrder",domain:"spring",idField:"id",idType:"number",isTree:!1,searchFields:["orderNo","customer"],defaultSort:"id",defaultOrder:"desc",fields:[{name:"id",type:"number",readonly:!0},{name:"orderNo",type:"string",searchable:!0,label:"订单号"},{name:"customer",type:"string",searchable:!0,label:"客户"},{name:"amount",type:"number",label:"金额"},{name:"status",type:"string",label:"状态"},{name:"createdAt",type:"date",readonly:!0,label:"创建时间"}]},se={name:"SpringItem",domain:"spring",idField:"id",idType:"number",isTree:!1,searchFields:["name","category"],defaultSort:"id",defaultOrder:"desc",fields:[{name:"id",type:"number",readonly:!0},{name:"name",type:"string",searchable:!0,label:"名称"},{name:"price",type:"number",label:"价格"},{name:"stock",type:"number",label:"库存"},{name:"category",type:"string",searchable:!0,label:"分类"}]},le={name:"LocalNotification",domain:"local",idField:"id",idType:"number",isTree:!1,searchFields:["title"],fields:[{name:"id",type:"number",readonly:!0},{name:"title",type:"string",searchable:!0,label:"标题"},{name:"message",type:"string",label:"内容"},{name:"type",type:"string",label:"类型"},{name:"read",type:"boolean",label:"已读"},{name:"createdAt",type:"date",readonly:!0,label:"时间"}]},de={name:"LocalTag",domain:"local",idField:"id",idType:"number",isTree:!1,searchFields:["name","color"],fields:[{name:"id",type:"number",readonly:!0},{name:"name",type:"string",searchable:!0,label:"名称"},{name:"color",type:"string",label:"颜色"},{name:"count",type:"number",label:"使用次数"}]},ce={name:"Department",domain:"abp",idField:"id",idType:"number",isTree:!0,isLazy:!0,root:null,parentIdField:"parentId",childrenField:"children",leafField:"leaf",expandedField:"expanded",useFlat:!0,searchFields:["name"],fields:[{name:"id",type:"number",readonly:!0},{name:"name",type:"string",searchable:!0,label:"部门名称"},{name:"parentId",type:"number",label:"上级部门"},{name:"leaf",type:"boolean",label:"是否叶节点"},{name:"expanded",type:"boolean",label:"是否展开"},{name:"employeeCount",type:"number",label:"人数"}]},S=V.domain;S.register("auth",{baseUrl:"http://localhost:3000",preset:"default",pageSize:10,pagesizes:[10,20,50]});S.register("abp",{baseUrl:"http://localhost:3001",preset:"abp",pageSize:10,pagesizes:[10,20,50],authInjector:"bearer"});S.register("spring",{baseUrl:"http://localhost:3002",preset:"spring",pageSize:10,pagesizes:[5,10,20,50],authInjector:"bearer"});S.register("local",{baseUrl:"",preset:"default",pageSize:100,pagesizes:[10,20,50]});const y=j.SchemaRegistrar.getInstance();y.register(ie);y.register(ae);y.register(ne);y.register(se);y.register(le);y.register(de);y.register(ce);f.configure({tokenEndpoint:"http://localhost:3000/oauth2/token",revokeEndpoint:"http://localhost:3000/oauth2/revoke",authorizationEndpoint:"http://localhost:3000/oauth2/authorize",clientId:"qimenjs-demo",redirectUri:"http://localhost:5173/callback",domain:["abp","spring"],storage:"localStorage"});f.on("oauth2:token-acquired",o=>{var e;console.log("[OAuth2] Token acquired:",((e=o.accessToken)==null?void 0:e.substring(0,20))+"...")});f.on("oauth2:token-refreshed",o=>{var e;console.log("[OAuth2] Token refreshed:",((e=o.accessToken)==null?void 0:e.substring(0,20))+"...")});f.on("oauth2:token-expired",()=>{console.log("[OAuth2] Token expired, refreshing...")});f.on("oauth2:refresh-failed",o=>{var e;console.error("[OAuth2] Refresh failed:",(e=o.error)==null?void 0:e.message)});const pe=`
/* ===== Reset & Base ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 14px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #050506;
    color: #EDEDEF;
    letter-spacing: -0.01em;
    line-height: 1.5;
    overflow: hidden;
    height: 100vh;
}
a { color: #6366F1; text-decoration: none; }
a:hover { color: #818CF8; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* ===== Layout ===== */
.app-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

/* ===== Sidebar ===== */
.sidebar {
    width: 240px;
    min-width: 240px;
    background: #0A0A0B;
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 10;
}
.sidebar::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 1px; height: 100%;
    background: linear-gradient(180deg, rgba(99,102,241,0.3), transparent 40%, transparent 60%, rgba(168,85,247,0.2));
}
.sidebar-brand {
    padding: 20px 20px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sidebar-brand h1 {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #6366F1, #A855F7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
.sidebar-brand span {
    font-size: 11px;
    color: #8A8F98;
    display: block;
    margin-top: 2px;
}
.sidebar-nav {
    flex: 1;
    padding: 12px 8px;
    overflow-y: auto;
}
.nav-group {
    margin-bottom: 8px;
}
.nav-group-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #565B66;
    padding: 8px 12px 4px;
}
.nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    color: #A1A1AA;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    border: 1px solid transparent;
}
.nav-item:hover {
    background: rgba(255,255,255,0.04);
    color: #EDEDEF;
}
.nav-item.active {
    background: rgba(99,102,241,0.1);
    color: #EDEDEF;
    border-color: rgba(99,102,241,0.2);
}
.nav-item.active::before {
    content: '';
    position: absolute;
    left: -8px; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 16px;
    border-radius: 0 2px 2px 0;
    background: #6366F1;
}
.nav-icon {
    width: 18px; height: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    opacity: 0.7;
}
.nav-item.active .nav-icon { opacity: 1; }
.nav-badge {
    margin-left: auto;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 8px;
    background: rgba(99,102,241,0.2);
    color: #818CF8;
}

/* ===== Main Content ===== */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #050506;
}

/* ===== Top Bar ===== */
.topbar {
    height: 52px;
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(5,5,6,0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    position: relative;
    z-index: 5;
}
.topbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
}
.topbar-breadcrumb {
    font-size: 13px;
    color: #8A8F98;
}
.topbar-breadcrumb span { color: #EDEDEF; }
.topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
}
.topbar-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #8A8F98;
}
.status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #4CAF50;
    box-shadow: 0 0 6px rgba(76,175,80,0.5);
}
.status-dot.offline { background: #f44336; box-shadow: 0 0 6px rgba(244,67,54,0.5); }

/* ===== Page Content ===== */
.page-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}
.page-header {
    margin-bottom: 24px;
}
.page-header h2 {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: #EDEDEF;
}
.page-header p {
    font-size: 13px;
    color: #8A8F98;
    margin-top: 4px;
}

/* ===== Cards ===== */
.card {
    background: #0A0A0B;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s ease;
}
.card:hover {
    border-color: rgba(255,255,255,0.1);
}
.card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}
.card:hover::before { opacity: 1; }
.card-title {
    font-size: 13px;
    font-weight: 500;
    color: #8A8F98;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.card-title .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
}

/* ===== Stat Cards ===== */
.stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}
.stat-card {
    background: #0A0A0B;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 16px 20px;
    position: relative;
    overflow: hidden;
}
.stat-card .stat-value {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.03em;
    color: #EDEDEF;
}
.stat-card .stat-label {
    font-size: 12px;
    color: #8A8F98;
    margin-top: 2px;
}
.stat-card .stat-change {
    font-size: 11px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
}
.stat-change.up { color: #4CAF50; }
.stat-change.down { color: #f44336; }

/* ===== Tables ===== */
.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}
.data-table thead th {
    text-align: left;
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #565B66;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.data-table tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: #A1A1AA;
}
.data-table tbody tr:hover {
    background: rgba(255,255,255,0.02);
}
.data-table tbody tr:hover td { color: #EDEDEF; }

/* ===== Badges ===== */
.badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.01em;
}
.badge-success { background: rgba(76,175,80,0.15); color: #66BB6A; }
.badge-warning { background: rgba(255,152,0,0.15); color: #FFA726; }
.badge-danger  { background: rgba(244,67,54,0.15); color: #EF5350; }
.badge-info    { background: rgba(33,150,243,0.15); color: #42A5F5; }
.badge-purple  { background: rgba(168,85,247,0.15); color: #BA68C8; }
.badge-muted   { background: rgba(255,255,255,0.06); color: #8A8F98; }

/* ===== Buttons ===== */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;
    outline: none;
    font-family: inherit;
}
.btn-primary {
    background: #6366F1;
    color: #fff;
    box-shadow: 0 0 12px rgba(99,102,241,0.3);
}
.btn-primary:hover {
    background: #4F46E5;
    box-shadow: 0 0 20px rgba(99,102,241,0.4);
}
.btn-ghost {
    background: transparent;
    color: #A1A1AA;
    border-color: rgba(255,255,255,0.1);
}
.btn-ghost:hover {
    background: rgba(255,255,255,0.04);
    color: #EDEDEF;
    border-color: rgba(255,255,255,0.15);
}
.btn-danger {
    background: rgba(244,67,54,0.15);
    color: #EF5350;
    border-color: rgba(244,67,54,0.2);
}
.btn-danger:hover {
    background: rgba(244,67,54,0.25);
}
.btn-sm { padding: 4px 10px; font-size: 11px; }

/* ===== Inputs ===== */
.input {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #EDEDEF;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s ease;
    width: 100%;
}
.input:focus {
    border-color: rgba(99,102,241,0.5);
    box-shadow: 0 0 0 2px rgba(99,102,241,0.1);
}
.input::placeholder { color: #565B66; }

/* ===== Grid ===== */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

/* ===== Section ===== */
.section { margin-bottom: 24px; }
.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #EDEDEF;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.section-title::before {
    content: '';
    width: 3px; height: 14px;
    border-radius: 2px;
    background: linear-gradient(180deg, #6366F1, #A855F7);
}

/* ===== Pagination ===== */
.pagination {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    font-size: 12px;
    color: #8A8F98;
}
.pagination .page-info {
    padding: 0 8px;
}

/* ===== Tree ===== */
.tree-node {
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #A1A1AA;
    transition: all 0.1s ease;
}
.tree-node:hover { background: rgba(255,255,255,0.04); color: #EDEDEF; }
.tree-toggle { font-size: 10px; color: #565B66; width: 14px; text-align: center; }
.tree-leaf { width: 14px; }

/* ===== Loading ===== */
.loading-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
    height: 16px;
    margin: 4px 0;
}
@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* ===== Error ===== */
.error-msg {
    padding: 10px 14px;
    background: rgba(244,67,54,0.1);
    border: 1px solid rgba(244,67,54,0.2);
    border-radius: 6px;
    color: #EF5350;
    font-size: 13px;
}

/* ===== Login Page ===== */
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #050506;
    position: relative;
    overflow: hidden;
}
.login-page::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background: radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.06) 0%, transparent 50%);
}
.login-card {
    width: 380px;
    background: #0A0A0B;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 32px;
    position: relative;
    z-index: 1;
}
.login-card h2 {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
}
.login-card .subtitle {
    font-size: 13px;
    color: #8A8F98;
    margin-bottom: 24px;
}
.form-group {
    margin-bottom: 16px;
}
.form-group label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #8A8F98;
    margin-bottom: 6px;
}
.login-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    color: #565B66;
    font-size: 11px;
}
.login-divider::before, .login-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.06);
}
.login-footer {
    text-align: center;
    margin-top: 20px;
    font-size: 11px;
    color: #565B66;
}

/* ===== Flex helpers ===== */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.text-sm { font-size: 12px; }
.text-muted { color: #8A8F98; }
.text-xs { font-size: 11px; }
.w-full { width: 100%; }
`;var $;const E=($=window.qimenI18n)==null?void 0:$.i18n;let C=!1;function ge(){if(C)return;const o=document.createElement("style");o.textContent=pe,document.head.appendChild(o),C=!0}const H=[{title:"概览",items:[{id:"dashboard",label:"仪表盘",icon:"◉"}]},{title:"核心基础",items:[{id:"error",label:"错误处理",icon:"⊘"},{id:"logger",label:"日志系统",icon:"📋"},{id:"utils",label:"工具函数",icon:"🔧"},{id:"async",label:"异步工具",icon:"⏱"},{id:"runtime",label:"运行时检测",icon:"🖥"},{id:"crypto",label:"加密工具",icon:"🔐"},{id:"types",label:"类型系统",icon:"📐"},{id:"i18n",label:"国际化",icon:"🌐"}]},{title:"基础设施",items:[{id:"registry",label:"注册器",icon:"📑"},{id:"cache",label:"缓存系统",icon:"💾"},{id:"events",label:"事件总线",icon:"📡"},{id:"task",label:"任务调度",icon:"⚙"},{id:"composable",label:"组合能力",icon:"🧩"},{id:"context",label:"上下文管理",icon:"📦"}]},{title:"功能工具",items:[{id:"schema",label:"Schema",icon:"📝"},{id:"validation",label:"表单验证",icon:"✓"},{id:"pipeline",label:"管道处理",icon:"🔀"},{id:"mime",label:"MIME类型",icon:"📄"},{id:"pattern",label:"模式匹配",icon:"🔍"},{id:"event-dom",label:"DOM事件",icon:"👆"}]},{title:"高级功能",items:[{id:"data-processor",label:"数据处理器",icon:"🔄"},{id:"http",label:"HTTP客户端",icon:"🌍"},{id:"system-abilities",label:"系统能力",icon:"⚡"}]},{title:"数据管理",items:[{id:"abp-users",label:"ABP用户",icon:"👤",badge:"CRUD"},{id:"abp-products",label:"ABP产品",icon:"📦",badge:"CRUD"},{id:"spring-orders",label:"Spring订单",icon:"🛒",badge:"CRUD"},{id:"spring-items",label:"Spring商品",icon:"🏷",badge:"只读"},{id:"departments",label:"部门树",icon:"🌳",badge:"Tree"},{id:"notifications",label:"本地通知",icon:"🔔",badge:"只读"},{id:"tags",label:"本地标签",icon:"🏷",badge:"CRUD"}]}];let P="dashboard",T=null;function G(o){P=o,document.querySelectorAll(".nav-item").forEach(r=>{r.classList.toggle("active",r.getAttribute("data-page")===o)});const e=document.getElementById("breadcrumb-current");if(e){const r=H.flatMap(i=>i.items).find(i=>i.id===o);e.textContent=(r==null?void 0:r.label)||o}T==null||T(o)}function ue(o){T=o}function he(o){ge();const e=H.map(r=>`
        <div class="nav-group">
            <div class="nav-group-title">${r.title}</div>
            ${r.items.map(i=>`
                <div class="nav-item ${i.id===P?"active":""}" data-page="${i.id}" onclick="window.__navigate('${i.id}')">
                    <span class="nav-icon">${i.icon}</span>
                    <span>${i.label}</span>
                    ${i.badge?`<span class="nav-badge">${i.badge}</span>`:""}
                </div>
            `).join("")}
        </div>
    `).join("");document.getElementById("app").innerHTML=`
        <div class="app-layout">
            <aside class="sidebar">
                <div class="sidebar-brand">
                    <h1>QimenJS</h1>
                    <span>Enterprise Entity Framework</span>
                </div>
                <nav class="sidebar-nav">
                    ${e}
                </nav>
            </aside>
            <div class="main-content">
                <header class="topbar">
                    <div class="topbar-left">
                        <div class="topbar-breadcrumb">
                            QimenJS / <span id="breadcrumb-current">仪表盘</span>
                        </div>
                    </div>
                    <div class="topbar-right">
                        <select id="topbar-lang" class="input" style="width:auto;padding:4px 8px;font-size:12px;margin-right:8px;" onchange="window.__changeLang(this.value)">
                            <option value="zh-CN" ${(E.locale||"zh-CN")==="zh-CN"?"selected":""}>中文简体</option>
                            <option value="en-US" ${E.locale==="en-US"?"selected":""}>English</option>
                            <option value="ja-JP" ${E.locale==="ja-JP"?"selected":""}>日本語</option>
                        </select>
                        <div class="topbar-status">
                            <span class="status-dot "></span>
                            <span>已认证</span>
                        </div>
                        <button class="btn btn-ghost btn-sm" onclick="window.__logout()">登出</button>
                    </div>
                </header>
                <main class="page-content" id="page-content">
                    <div class="loading-skeleton" style="height:24px;width:200px;margin-bottom:16px;"></div>
                    <div class="loading-skeleton" style="height:16px;width:300px;margin-bottom:8px;"></div>
                    <div class="loading-skeleton" style="height:16px;width:250px;"></div>
                </main>
            </div>
        </div>
    `}function R(o){const e=document.getElementById("page-content");e&&(e.innerHTML=o)}window.__navigate=o=>{G(o)};window.__changeLang=async o=>{await E.loadScript(`/locales/${o}.js`),E.locale=o,G(P)};const me={dashboard:()=>s(()=>import("./dashboard-0S7WDXOJ.js"),__vite__mapDeps([0,1,2,3,4])),error:()=>s(()=>import("./error-CMsjSRj1.js"),[]),logger:()=>s(()=>import("./logger-DTlnMtGN.js"),[]),utils:()=>s(()=>import("./utils-r26HbpqH.js"),__vite__mapDeps([5,6])),async:()=>s(()=>import("./async-CplwfuAl.js"),[]),runtime:()=>s(()=>import("./runtime-aljAcT1F.js"),[]),crypto:()=>s(()=>import("./crypto-DaSs-o2K.js"),[]),types:()=>s(()=>import("./types-CD6LFMvW.js"),[]),i18n:()=>s(()=>import("./i18n-vShcoloo.js"),[]),registry:()=>s(()=>import("./registry-mwTTH2Xa.js"),[]),cache:()=>s(()=>import("./cache-A4HqL8Fl.js"),[]),events:()=>s(()=>import("./events-CGweyZG7.js"),__vite__mapDeps([7,8])),task:()=>s(()=>import("./task-9lF4TT5r.js"),__vite__mapDeps([9,6])),composable:()=>s(()=>import("./composable-B1mK-Jlv.js"),__vite__mapDeps([10,11])),context:()=>s(()=>import("./context-CchdoiAr.js"),__vite__mapDeps([12,6])),schema:()=>s(()=>import("./schema-bicK1Xcw.js"),[]),validation:()=>s(()=>import("./validation-BroVdrj3.js"),__vite__mapDeps([13,6])),pipeline:()=>s(()=>import("./pipeline-Ddc-bEyO.js"),[]),mime:()=>s(()=>import("./mime-DqmxY91K.js"),[]),pattern:()=>s(()=>import("./pattern-CQ9q2mRB.js"),[]),"event-dom":()=>s(()=>import("./event-dom-Y0QkNVdh.js"),__vite__mapDeps([14,8,6])),"data-processor":()=>s(()=>import("./data-processor-C1GIdCup.js"),[]),http:()=>s(()=>import("./http-DZTaNJG9.js"),[]),"system-abilities":()=>s(()=>import("./system-abilities-Dy_V4c6-.js"),__vite__mapDeps([15,11])),"abp-users":()=>s(()=>import("./abp-users-AtqlCST2.js"),__vite__mapDeps([16,1,2])),"abp-products":()=>s(()=>import("./abp-products-BwWVRsUm.js"),__vite__mapDeps([17,1,2])),"spring-orders":()=>s(()=>import("./spring-orders-C_BZKvZ6.js"),__vite__mapDeps([18,3,2])),"spring-items":()=>s(()=>import("./spring-items-BBrPvUIf.js"),__vite__mapDeps([19,3,2])),departments:()=>s(()=>import("./departments-Dulh1tSD.js"),__vite__mapDeps([20,2])),notifications:()=>s(()=>import("./notifications-mfyecmsc.js"),__vite__mapDeps([21,4,2])),tags:()=>s(()=>import("./tags-CbQuq1Lh.js"),__vite__mapDeps([22,4,2]))},be={dashboard:"renderDashboard",error:"renderError",logger:"renderLogger",utils:"renderUtils",async:"renderAsync",runtime:"renderRuntime",crypto:"renderCrypto",types:"renderTypes",i18n:"renderI18n",registry:"renderRegistry",cache:"renderCache",events:"renderEvents",task:"renderTask",composable:"renderComposable",context:"renderContext",schema:"renderSchema",validation:"renderValidation",pipeline:"renderPipeline",mime:"renderMime",pattern:"renderPattern","event-dom":"renderEventDom","data-processor":"renderDataProcessor",http:"renderHttp","system-abilities":"renderSystemAbilities","abp-users":"renderAbpUsers","abp-products":"renderAbpProducts","spring-orders":"renderSpringOrders","spring-items":"renderSpringItems",departments:"renderDepartments",notifications:"renderNotifications",tags:"renderTags"};function J(){ue(async o=>{const e=me[o];if(!e){R(`<div class="card"><p>页面 "${o}" 未找到</p></div>`);return}try{const r=await e(),i=be[o],t=r[i];t?t():R(`<div class="card"><p>页面 "${o}" 渲染函数未找到</p></div>`)}catch(r){console.error(`加载页面 ${o} 失败:`,r),R(`<div class="card"><p>加载失败，请刷新重试</p><p class="text-sm text-muted">${r}</p></div>`)}})}function fe(){if(window.location.pathname==="/callback"||new URLSearchParams(window.location.search).has("code")){s(async()=>{const{handleCallback:e}=await import("./callback-CAoFUh7w.js");return{handleCallback:e}},[]).then(({handleCallback:e})=>e());return}f.isAuthenticated()?K():s(async()=>{const{showLoginPage:e}=await import("./login-eW3wh-Pc.js");return{showLoginPage:e}},[]).then(({showLoginPage:e})=>e())}function K(){he(),J(),s(async()=>{const{renderDashboard:o}=await import("./dashboard-0S7WDXOJ.js");return{renderDashboard:o}},__vite__mapDeps([0,1,2,3,4])).then(({renderDashboard:o})=>o())}window.__logout=async()=>{await f.logout();const{showLoginPage:o}=await s(async()=>{const{showLoginPage:e}=await import("./login-eW3wh-Pc.js");return{showLoginPage:e}},[]);o()};fe();const Ee=Object.freeze(Object.defineProperty({__proto__:null,setupPageRouter:J,showApp:K},Symbol.toStringTag,{value:"Module"}));export{ce as D,se as I,le as N,ne as O,ae as P,V as R,de as T,ie as U,s as _,ge as i,Ee as m,f as o,R as r};
