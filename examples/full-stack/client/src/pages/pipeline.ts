/**
 * 管道处理页 - @qimenjs/pipeline
 */
import { Pipeline } from '@qimen-lab/pipeline';
import type { Processor } from '@qimen-lab/pipeline';
import { renderPageContent } from '../layout';

const processors: Array<{ name: string; weight: number; enabled: boolean }> = [
    { name: 'ValidateProcessor', weight: 10, enabled: true },
    { name: 'TransformProcessor', weight: 20, enabled: true },
    { name: 'SaveProcessor', weight: 30, enabled: true },
];

export function renderPipeline(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>管道处理</h2>
            <p>@qimenjs/pipeline — Processor 权重排序 + 管道执行 + 熔断机制</p>
        </div>

        <div class="section">
            <div class="section-title">管道架构</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    Pipeline 按处理器 <code>weight</code> 从小到大排序执行。
                    支持 <code>breakOnError</code> 熔断、<code>enableTiming</code> 性能计时、
                    <code>enableTracking</code> 步骤追踪。每个 Processor 实现 <code>execute(context)</code> 方法。
                </p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">处理器配置</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>当前处理器列表</div>
                <div id="pipe-processors" class="mb-3"></div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>添加处理器名称</label>
                        <input id="pipe-name" class="input" value="LogProcessor" placeholder="处理器名称">
                    </div>
                    <div class="form-group">
                        <label>权重 (weight)</label>
                        <input id="pipe-weight" class="input" type="number" value="15" min="1" max="100">
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__addProcessor()">添加处理器</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__addErrorProcessor()">添加错误处理器</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">执行管道</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>管道执行控制</div>
                <div class="form-group">
                    <label>
                        <input id="pipe-break" type="checkbox" checked> breakOnError (遇到错误中断)
                    </label>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__executePipeline()">执行管道</button>
                <div id="pipe-result" class="mt-3 text-sm"></div>
            </div>
        </div>
    `);

    updateProcessors();
}

function updateProcessors(): void {
    const el = document.getElementById('pipe-processors');
    if (!el) return;
    el.innerHTML = processors.map((p, i) => `
        <div class="flex items-center gap-2 mb-2">
            <span class="badge ${p.enabled ? 'badge-success' : 'badge-muted'}">${p.enabled ? '启用' : '禁用'}</span>
            <span style="color:#6366F1;">${p.name}</span>
            <span class="text-muted text-xs">weight: ${p.weight}</span>
            <button class="btn btn-ghost btn-sm" style="font-size:11px;padding:2px 8px;" onclick="window.__toggleProcessor(${i})">${p.enabled ? '禁用' : '启用'}</button>
            <button class="btn btn-ghost btn-sm" style="font-size:11px;padding:2px 8px;color:#EF5350;" onclick="window.__removeProcessor(${i})">删除</button>
        </div>
    `).join('');
}

(window as any).__addProcessor = () => {
    const name = (document.getElementById('pipe-name') as HTMLInputElement).value;
    const weight = Number((document.getElementById('pipe-weight') as HTMLInputElement).value) || 15;
    processors.push({ name, weight, enabled: true });
    updateProcessors();
};

(window as any).__addErrorProcessor = () => {
    processors.push({ name: 'ErrorProcessor', weight: 25, enabled: true });
    updateProcessors();
};

(window as any).__toggleProcessor = (index: number) => {
    if (processors[index]) {
        processors[index].enabled = !processors[index].enabled;
        updateProcessors();
    }
};

(window as any).__removeProcessor = (index: number) => {
    processors.splice(index, 1);
    updateProcessors();
};

(window as any).__executePipeline = async () => {
    const el = document.getElementById('pipe-result');
    if (!el) return;
    const breakOnError = (document.getElementById('pipe-break') as HTMLInputElement).checked;

    const activeProcessors: Processor<any>[] = processors.filter(p => p.enabled).map(p => ({
        name: p.name,
        weight: p.weight,
        execute: async (ctx: any) => {
            if (p.name === 'ErrorProcessor') {
                throw new Error(`${p.name} 执行失败`);
            }
            ctx.steps = ctx.steps || [];
            ctx.steps.push({ name: p.name, status: 'success' });
        },
    }));

    const pipeline = new Pipeline();
    const context = { steps: [] as any[] };

    try {
        const result = await pipeline.execute(context, activeProcessors, {
            pipelineName: 'DemoPipeline',
            breakOnError,
            enableTiming: true,
            enableTracking: true,
        });

        el.innerHTML = `
            <div><span class="badge ${result.isSuccess ? 'badge-success' : 'badge-danger'}">${result.isSuccess ? '成功' : '失败'}</span></div>
            <div class="mt-2">总耗时: ${result.totalDuration.toFixed(2)}ms</div>
            <div class="mt-2"><strong>执行步骤:</strong></div>
            <pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(result.steps, null, 2)}</pre>
        `;
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">执行异常: ${err}</span>`;
    }
};
