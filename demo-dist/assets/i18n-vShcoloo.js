import{r as p}from"./index-OvYsTaGM.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";var c;const e=(c=window.qimenI18n)==null?void 0:c.i18n,d=new Set;let n=null;async function l(t){d.has(t)||(await e.loadScript(`/locales/${t}.js`),d.add(t))}async function b(){await l(e.locale||"zh-CN"),n==null||n(),p(`
        <div class="page-header">
            <h2>国际化</h2>
            <p>@qimenjs/i18n — 多语言切换 + 插值变量 + loadScript 动态加载</p>
        </div>

        <div class="section">
            <div class="section-title">响应式语言切换（模拟 Vue/React）</div>
            <div class="card">
                <p class="text-sm text-muted mb-3">通过 i18n.onLocaleChange 监听语言变更，自动重渲染 UI，无需刷新页面</p>
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-ghost btn-sm" onclick="window.__switchLocale('zh-CN')">中文简体</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__switchLocale('en-US')">English</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__switchLocale('ja-JP')">日本語</button>
                </div>
                <div id="i18n-reactive" style="border:1px solid rgba(99,102,241,0.3);border-radius:8px;padding:16px;background:rgba(99,102,241,0.05);">
                    <div style="margin-bottom:8px;color:#6366F1;font-size:12px;font-weight:600;">▼ 响应式区域（语言切换时自动更新）</div>
                    <div id="i18n-reactive-content"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Vue/React 集成代码示例</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>Vue 3 Composition API</div>
                    <pre style="background:#050506;padding:12px;border-radius:6px;font-size:12px;overflow-x:auto;color:#A1A1AA;"><code>import { ref, onMounted, onUnmounted } from 'vue'
import { i18n } from '@qimen-lab/core/i18n'

export function useI18n() {
  const locale = ref(i18n.locale)

  const t = (key: string, params?: any) => {
    return i18n.t(key, params)
  }

  const setLocale = async (newLocale: string) => {
    await i18n.loadScript(\`/locales/\${newLocale}.js\`)
    i18n.locale = newLocale
  }

  onMounted(() => {
    const off = i18n.onLocaleChange((e) => {
      locale.value = e.current
    })
    onUnmounted(off)
  })

  return { locale, t, setLocale }
}</code></pre>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>React Hook</div>
                    <pre style="background:#050506;padding:12px;border-radius:6px;font-size:12px;overflow-x:auto;color:#A1A1AA;"><code>import { useState, useEffect } from 'react'
import { i18n } from '@qimen-lab/core/i18n'

export function useI18n() {
  const [locale, setLocaleState] = useState(i18n.locale)

  const t = (key: string, params?: any) => {
    return i18n.t(key, params)
  }

  const setLocale = async (newLocale: string) => {
    await i18n.loadScript(\`/locales/\${newLocale}.js\`)
    i18n.locale = newLocale
  }

  useEffect(() => {
    return i18n.onLocaleChange((e) => {
      setLocaleState(e.current)
    })
  }, [])

  return { locale, t, setLocale }
}</code></pre>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">loadScript 加载日志</div>
            <div class="card">
                <div id="i18n-load-log" style="font-family:monospace;font-size:12px;background:#050506;padding:12px;border-radius:6px;max-height:150px;overflow-y:auto;">
                    <div style="color:#888;">等待操作...</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">API 一览</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>方法</th><th>说明</th></tr></thead>
                    <tbody>
                        <tr><td><code>i18n.t(key, params?, default?)</code></td><td>翻译文本，支持 {key} 插值</td></tr>
                        <tr><td><code>i18n.locale</code></td><td>获取/设置当前语言（setter 触发 locale:change 事件）</td></tr>
                        <tr><td><code>i18n.inject(messages, locale?)</code></td><td>注入/合并消息到指定语言</td></tr>
                        <tr><td><code>registerMessages(locale, messages)</code></td><td>注册语言包（自动切换 locale）</td></tr>
                        <tr><td><code>i18n.loadScript(url)</code></td><td>动态加载 .js 语言包文件</td></tr>
                        <tr><td><code>i18n.onLocaleChange(handler)</code></td><td>监听语言变更，返回取消函数</td></tr>
                        <tr><td><code>i18n.getMessage(path)</code></td><td>获取原始翻译值（不做插值）</td></tr>
                        <tr><td><code>i18n.getMessages()</code></td><td>获取当前语言全部消息</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `),n=e.onLocaleChange(()=>{s()}),s()}function s(){const t=document.getElementById("i18n-reactive-content");if(!t)return;const o=["app.title","app.greeting","app.items","app.today","nav.dashboard","nav.users","btn.save","btn.cancel","btn.delete","status.online","status.offline"];t.innerHTML=`
        <div class="text-sm mb-2" style="color:#8A8F98;">当前语言：<span class="badge badge-info">${e.locale}</span></div>
        <table class="data-table">
            <thead><tr><th>Key</th><th>t() 翻译结果</th></tr></thead>
            <tbody>${o.map(a=>{const r=e.t(a,{name:"QimenJS",count:42,date:new Date().toLocaleDateString()});return`<tr><td class="text-muted">${a}</td><td>${r}</td></tr>`}).join("")}</tbody>
        </table>
    `}function i(t){const o=document.getElementById("i18n-load-log");if(!o)return;const a=new Date().toLocaleTimeString("zh-CN",{hour12:!1});o.innerHTML+=`<div style="padding:2px 0;"><span style="color:#666;">${a}</span> <span style="color:#4CAF50;">${t}</span></div>`,o.scrollTop=o.scrollHeight}window.__switchLocale=async t=>{i(`切换语言 → ${t}`),await l(t),e.locale=t,i(`已切换到 ${t}，消息数: ${Object.keys(e.getMessages()||{}).length}`)};export{b as renderI18n};
