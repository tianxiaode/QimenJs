import{r as v}from"./index-OvYsTaGM.js";import g from"@qimenjs/registry";import"@qimenjs/error";import"@/registry/registrars/DomainRegistrar";var l={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.MimeTypeRegistrar=e.MimeTypeRegistrarName=void 0;const i=g,n=g;e.MimeTypeRegistrarName="mimeType";class r extends i.RegistrarBase{constructor(){super(...arguments),this.name=e.MimeTypeRegistrarName,this.storage=new Map,this.reverseStorage=new Map}register(t,a){if(this.checkLock(),typeof t=="object"&&t!==null)for(const[s,o]of Object.entries(t))this.doRegister(s,o);else if(typeof t=="string"){if(a===void 0)throw new n.RegistrarInvalidArgumentError(this.name,t);this.doRegister(t,a)}}doRegister(t,a){const s=t.startsWith(".")?t.slice(1):t,o=this.storage.get(s)||new Set,c=Array.isArray(a)?a:[a];c.forEach(m=>o.add(m)),this.storage.set(s,o),c.forEach(m=>{this.reverseStorage.has(m)||this.reverseStorage.set(m,new Set),this.reverseStorage.get(m).add(s)})}unregister(t){this.checkLock();const a=t.startsWith(".")?t.slice(1):t,s=this.storage.get(a);if(s)for(const o of s){const c=this.reverseStorage.get(o);c&&(c.delete(a),c.size===0&&this.reverseStorage.delete(o))}this.storage.delete(a)}get(t){if(Array.isArray(t)){const s=new Set;return t.forEach(o=>{var c;const m=o.startsWith(".")?o.slice(1):o;(c=this.storage.get(m))===null||c===void 0||c.forEach(M=>s.add(M))}),s}const a=t.startsWith(".")?t.slice(1):t;return Array.from(this.storage.get(a)||[])}getByMime(t){const a=this.reverseStorage.get(t),s=Array.from(a||[]);return s.length>0?s[0]:""}doInspect(){console.group("📁 MIME Type Registry Status");const t={};this.storage.forEach((a,s)=>{t[s]=Array.from(a).join(", ")}),console.table(t),console.groupEnd()}}e.MimeTypeRegistrar=r})(l);var d={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.COMMON_MIMES=e.FONT_MIMES=e.WEB_MIMES=e.ARCHIVE_MIMES=e.VIDEO_MIMES=e.AUDIO_MIMES=e.DOCUMENT_MIMES=e.IMAGE_MIMES=void 0,e.IMAGE_MIMES={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",gif:"image/gif",svg:"image/svg+xml",webp:"image/webp",bmp:"image/bmp",ico:"image/x-icon",tiff:"image/tiff",tif:"image/tiff",avif:"image/avif"},e.DOCUMENT_MIMES={pdf:"application/pdf",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",xls:"application/vnd.ms-excel",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",ppt:"application/vnd.ms-powerpoint",pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation",txt:"text/plain",rtf:"application/rtf",csv:"text/csv"},e.AUDIO_MIMES={mp3:"audio/mpeg",wav:"audio/wav",ogg:"audio/ogg",flac:"audio/flac",aac:"audio/aac",m4a:"audio/mp4",wma:"audio/x-ms-wma"},e.VIDEO_MIMES={mp4:"video/mp4",avi:"video/x-msvideo",mov:"video/quicktime",wmv:"video/x-ms-wmv",flv:"video/x-flv",mkv:"video/x-matroska",webm:"video/webm",m4v:"video/mp4"},e.ARCHIVE_MIMES={zip:"application/zip",rar:"application/vnd.rar","7z":"application/x-7z-compressed",tar:"application/x-tar",gz:"application/gzip",bz2:"application/x-bzip2"},e.WEB_MIMES={html:"text/html",htm:"text/html",css:"text/css",js:["text/javascript","application/javascript"],mjs:"text/javascript",json:"application/json",xml:"application/xml",ts:"text/typescript",tsx:"text/typescript",jsx:"text/jsx",vue:"text/x-vue",map:"application/json"},e.FONT_MIMES={woff:"font/woff",woff2:"font/woff2",ttf:"font/ttf",otf:"font/otf",eot:"application/vnd.ms-fontobject"},e.COMMON_MIMES={...e.IMAGE_MIMES,...e.DOCUMENT_MIMES,...e.AUDIO_MIMES,...e.VIDEO_MIMES,...e.ARCHIVE_MIMES,...e.WEB_MIMES,...e.FONT_MIMES}})(d);function y(){const e=[{name:"图片",data:d.IMAGE_MIMES,color:"#6366F1"},{name:"文档",data:d.DOCUMENT_MIMES,color:"#A855F7"},{name:"音频",data:d.AUDIO_MIMES,color:"#4CAF50"},{name:"视频",data:d.VIDEO_MIMES,color:"#EF5350"},{name:"压缩包",data:d.ARCHIVE_MIMES,color:"#FF9800"},{name:"Web/代码",data:d.WEB_MIMES,color:"#00BCD4"},{name:"字体",data:d.FONT_MIMES,color:"#9C27B0"}];v(`
        <div class="page-header">
            <h2>MIME 类型</h2>
            <p>@qimenjs/mime — MimeTypeRegistrar 扩展名/MIME 映射查询</p>
        </div>

        <div class="section">
            <div class="section-title">交互式查询</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>扩展名 → MIME</div>
                    <div class="form-group">
                        <input id="mime-ext" class="input" value="jpg" placeholder="输入扩展名 (如 jpg, pdf, mp4)">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__queryMimeByExt()">查询</button>
                    <div id="mime-ext-result" class="mt-3 text-sm"></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>MIME → 扩展名</div>
                    <div class="form-group">
                        <input id="mime-type" class="input" value="image/jpeg" placeholder="输入 MIME 类型">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__queryMimeByType()">查询</button>
                    <div id="mime-type-result" class="mt-3 text-sm"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">自定义注册</div>
            <div class="card">
                <div class="grid-2">
                    <div class="form-group">
                        <label>扩展名</label>
                        <input id="mime-custom-ext" class="input" value="custom" placeholder="扩展名">
                    </div>
                    <div class="form-group">
                        <label>MIME 类型</label>
                        <input id="mime-custom-type" class="input" value="application/custom" placeholder="MIME 类型">
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__registerCustomMime()">注册</button>
                <div id="mime-custom-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">预定义 MIME 分类</div>
            ${e.map(i=>`
                <div class="card mb-3">
                    <div class="card-title"><span class="dot" style="background:${i.color};"></span>${i.name}</div>
                    <div class="grid-3">
                        ${Object.entries(i.data).map(([n,r])=>`<div class="text-xs" style="padding:4px 8px;"><code style="color:${i.color};">.${n}</code> → <span class="text-muted">${r}</span></div>`).join("")}
                    </div>
                </div>
            `).join("")}
        </div>
    `)}window.__queryMimeByExt=()=>{const e=document.getElementById("mime-ext").value.replace(/^\./,""),i=document.getElementById("mime-ext-result");if(i)try{const r=l.MimeTypeRegistrar.getInstance().get(e);i.innerHTML=r.length>0?r.map(p=>`<div><span class="badge badge-success">${p}</span></div>`).join(""):'<span class="badge badge-warning">未找到</span>'}catch(n){i.innerHTML=`<span class="badge badge-danger">查询失败: ${n}</span>`}};window.__queryMimeByType=()=>{const e=document.getElementById("mime-type").value,i=document.getElementById("mime-type-result");if(i)try{const r=l.MimeTypeRegistrar.getInstance().getByMime(e);i.innerHTML=r?`<span class="badge badge-success">.${r}</span>`:'<span class="badge badge-warning">未找到</span>'}catch(n){i.innerHTML=`<span class="badge badge-danger">查询失败: ${n}</span>`}};window.__registerCustomMime=()=>{const e=document.getElementById("mime-custom-ext").value,i=document.getElementById("mime-custom-type").value,n=document.getElementById("mime-custom-result");if(!(!n||!e||!i))try{l.MimeTypeRegistrar.getInstance().register(e,i),n.innerHTML=`<span class="badge badge-success">注册成功: .${e} → ${i}</span>`}catch(r){n.innerHTML=`<span class="badge badge-danger">注册失败: ${r}</span>`}};export{y as renderMime};
