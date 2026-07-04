/**
 * 组合能力页 - @orbitjs/composable
 */
import { ComposableBase, DescriptorFactory } from '@orbitjs/composable';
import type { AbilityDefinition } from '@orbitjs/composable';
import { renderPageContent } from '../layout';

// 定义一个计数器能力
const CounterAbility: AbilityDefinition = {
    count: {
        get() { return this.abilityState('CounterAbility:count', () => 0); }
    },
    increment() {
        this.setAbilityState('CounterAbility:count', this.count + 1);
    },
    reset() {
        this.setAbilityState('CounterAbility:count', 0);
    },
};

// 定义一个标签能力
const TagAbility: AbilityDefinition = {
    tags: {
        get() { return this.abilityState('TagAbility:tags', () => [] as string[]); }
    },
    addTag(tag: string) {
        this.setAbilityState('TagAbility:tags', [...this.tags, tag]);
    },
    removeTag(tag: string) {
        this.setAbilityState('TagAbility:tags', this.tags.filter((t: string) => t !== tag));
    },
};

class DemoHost extends ComposableBase {
    static readonly abilities = [CounterAbility, TagAbility] as const;
}

let demoHost: DemoHost | null = null;

export function renderComposable(): void {
    demoHost = new DemoHost();

    renderPageContent(`
        <div class="page-header">
            <h2>组合能力</h2>
            <p>@orbitjs/composable — ComposableBase + AbilityDefinition + DescriptorFactory</p>
        </div>

        <div class="section">
            <div class="section-title">能力组合架构</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    OrbitJS 的能力组合系统采用纯对象模式。Ability 是普通对象（不是类），
                    通过 <code>Object.defineProperty</code> 复制到宿主。宿主类继承 <code>ComposableBase</code>，
                    在 <code>static abilities</code> 数组中声明所需能力，构造时自动装配。
                </p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">CounterAbility 演示</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>计数器能力</div>
                <div class="mt-2 mb-3">
                    <span class="text-sm">当前计数: </span>
                    <span id="comp-count" style="font-size:24px;font-weight:bold;color:#6366F1;">0</span>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__compIncrement()">increment()</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__compReset()">reset()</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">TagAbility 演示</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>标签能力</div>
                <div class="form-group">
                    <input id="comp-tag-input" class="input" value="OrbitJS" placeholder="输入标签名">
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__compAddTag()">addTag()</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__compRemoveTag()">removeTag()</button>
                </div>
                <div id="comp-tags" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">DescriptorFactory 工厂方法</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>描述符工厂</div>
                <p class="text-sm text-muted mb-3">DescriptorFactory 提供便捷的属性描述符创建方法</p>
                <table class="data-table">
                    <thead><tr><th>方法</th><th>用途</th><th>示例</th></tr></thead>
                    <tbody>
                        <tr><td><code>getter()</code></td><td>只读计算属性</td><td>DescriptorFactory.getter(host => host.count * 2)</td></tr>
                        <tr><td><code>setter()</code></td><td>只写属性</td><td>DescriptorFactory.setter((host, v) => host.setValue(v))</td></tr>
                        <tr><td><code>accessor()</code></td><td>读写属性</td><td>DescriptorFactory.accessor(getter, setter)</td></tr>
                        <tr><td><code>method()</code></td><td>方法</td><td>DescriptorFactory.method((host, ...args) => {})</td></tr>
                        <tr><td><code>value()</code></td><td>固定值</td><td>DescriptorFactory.value(42)</td></tr>
                        <tr><td><code>computed()</code></td><td>计算属性</td><td>DescriptorFactory.computed(host => host.a + host.b)</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">能力状态管理</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    <code>abilityState(key, creator)</code> 获取或创建能力私有状态，每个能力通过唯一的 key 前缀隔离状态。
                    <code>setAbilityState(key, value)</code> 设置能力状态。状态存储在宿主实例上，不同实例互不干扰。
                </p>
            </div>
        </div>
    `);
}

function updateCount(): void {
    const el = document.getElementById('comp-count');
    if (el && demoHost) el.textContent = String(demoHost.count);
}

function updateTags(): void {
    const el = document.getElementById('comp-tags');
    if (!el || !demoHost) return;
    const tags = demoHost.tags as string[];
    if (tags.length === 0) {
        el.innerHTML = '<span class="text-muted">暂无标签</span>';
    } else {
        el.innerHTML = tags.map(t =>
            `<span class="badge badge-info" style="margin:2px;">${t}</span>`
        ).join('');
    }
}

(window as any).__compIncrement = () => {
    if (demoHost) {
        demoHost.increment();
        updateCount();
    }
};

(window as any).__compReset = () => {
    if (demoHost) {
        demoHost.reset();
        updateCount();
    }
};

(window as any).__compAddTag = () => {
    const tag = (document.getElementById('comp-tag-input') as HTMLInputElement).value;
    if (demoHost && tag) {
        demoHost.addTag(tag);
        updateTags();
    }
};

(window as any).__compRemoveTag = () => {
    const tag = (document.getElementById('comp-tag-input') as HTMLInputElement).value;
    if (demoHost && tag) {
        demoHost.removeTag(tag);
        updateTags();
    }
};
