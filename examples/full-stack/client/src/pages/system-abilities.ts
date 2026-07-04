/**
 * 系统能力页 - @orbitjs/system-abilities
 */
import { ComposableBase } from '@orbitjs/composable';
import { EventAbility, DomEventsAbility, DomainAbility, SystemAbility } from '@orbitjs/system-abilities';
import { renderPageContent } from '../layout';

// 创建包含 EventAbility 的组件
class EventComponent extends ComposableBase {
    static readonly abilities = [EventAbility] as const;
}

// 创建包含 DomainAbility 的组件
class DomainComponent extends ComposableBase {
    static readonly abilities = [DomainAbility] as const;
}

let eventComp: EventComponent | null = null;
const sysEventLog: Array<{ time: string; event: string; data: string }> = [];

export function renderSystemAbilities(): void {
    eventComp = new EventComponent();
    sysEventLog.length = 0;

    renderPageContent(`
        <div class="page-header">
            <h2>系统能力</h2>
            <p>@orbitjs/system-abilities — EventAbility / DomEventsAbility / DomainAbility / SystemAbility</p>
        </div>

        <div class="section">
            <div class="section-title">能力体系</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>能力</th><th>提供方法</th><th>用途</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">EventAbility</span></td><td>on / once / emit</td><td>事件订阅与发布</td></tr>
                        <tr><td><span class="badge badge-purple">DomEventsAbility</span></td><td>bind</td><td>DOM 事件与手势绑定</td></tr>
                        <tr><td><span class="badge badge-success">DomainAbility</span></td><td>domainConfig</td><td>获取域配置</td></tr>
                        <tr><td><span class="badge badge-warning">SystemAbility</span></td><td>systemConfig</td><td>获取系统配置</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">EventAbility 演示</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>事件能力</div>
                <p class="text-sm text-muted mb-3">通过 EventAbility，组件获得 on/once/emit 方法</p>
                <div class="grid-2">
                    <div class="form-group">
                        <label>事件名</label>
                        <input id="sys-evt-name" class="input" value="data:change" placeholder="事件名">
                    </div>
                    <div class="form-group">
                        <label>数据 (JSON)</label>
                        <input id="sys-evt-data" class="input" value='{"value":42}' placeholder="JSON 数据">
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__sysSubscribe()">订阅 (on)</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__sysEmit()">发布 (emit)</button>
                </div>
                <div id="sys-evt-log" class="mt-3 text-sm" style="max-height:150px;overflow-y:auto;"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">DomainAbility 演示</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>域能力</div>
                <p class="text-sm text-muted mb-3">通过 DomainAbility，组件可获取所属域的配置信息</p>
                <div class="form-group">
                    <label>选择域</label>
                    <select id="sys-domain" class="input">
                        <option value="abp">abp</option>
                        <option value="spring">spring</option>
                        <option value="local">local</option>
                    </select>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__sysDomainConfig()">获取域配置</button>
                <div id="sys-domain-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">组合使用</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    系统能力可以自由组合。例如一个完整的组件可以同时拥有 EventAbility + DomEventsAbility + DomainAbility + SystemAbility，
                    通过 <code>static readonly abilities = [EventAbility, DomEventsAbility, DomainAbility, SystemAbility]</code> 声明。
                    这就是 OrbitJS 的能力组合模式。
                </p>
            </div>
        </div>
    `);
}

(window as any).__sysSubscribe = () => {
    if (!eventComp) return;
    const name = (document.getElementById('sys-evt-name') as HTMLInputElement).value;
    eventComp.on(name, (ctx: any) => {
        const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        sysEventLog.push({ time, event: name, data: JSON.stringify(ctx.data) });
        const el = document.getElementById('sys-evt-log');
        if (el) {
            el.innerHTML = sysEventLog.map(e =>
                `<div style="color:#4CAF50;">[${e.time}] 收到 ${e.event}: ${e.data}</div>`
            ).join('');
            el.scrollTop = el.scrollHeight;
        }
    });
    const el = document.getElementById('sys-evt-log');
    if (el) el.innerHTML += `<div style="color:#6366F1;">已订阅: ${name}</div>`;
};

(window as any).__sysEmit = () => {
    if (!eventComp) return;
    const name = (document.getElementById('sys-evt-name') as HTMLInputElement).value;
    const dataStr = (document.getElementById('sys-evt-data') as HTMLInputElement).value;
    let data: any;
    try { data = JSON.parse(dataStr); } catch { data = dataStr; }
    eventComp.emit(name, data);
};

(window as any).__sysDomainConfig = () => {
    const domain = (document.getElementById('sys-domain') as HTMLSelectElement).value;
    const el = document.getElementById('sys-domain-result');
    if (!el) return;
    try {
        const comp = new DomainComponent();
        // DomainAbility 需要域注册才能工作
        el.innerHTML = `<div class="text-sm"><span class="badge badge-info">DomainAbility</span> 已创建组件</div>
        <div class="text-muted text-xs mt-1">domainConfig 属性需要组件在域上下文中使用时才能获取配置</div>`;
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">失败: ${err}</span>`;
    }
};
