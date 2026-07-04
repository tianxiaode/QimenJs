/**
 * 类型系统页 - @orbitjs/types
 */
import { renderPageContent } from '../layout';

export function renderTypes(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>类型系统</h2>
            <p>@orbitjs/types — 跨包共享基础类型定义</p>
        </div>

        <div class="section">
            <div class="section-title">模块定位</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    <code>@orbitjs/types</code> 是 OrbitJS 的零依赖类型定义模块，只包含真正需要跨包共享的基础类型。
                    它被 <code>@orbitjs/context</code>、<code>@orbitjs/pipeline</code>、<code>@orbitjs/data-processor</code> 等多个模块引用，
                    确保类型定义的一致性，避免循环依赖。
                </p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">ExecutionStep - 执行步骤记录</div>
            <div class="card">
                <p class="text-sm text-muted mb-3">记录管道中每个处理器的执行信息</p>
                <pre style="background:#0A0A0B;padding:16px;border-radius:8px;overflow:auto;font-size:13px;color:#A855F7;">interface ExecutionStep {
    name: string;       // 处理器名称
    duration: number;   // 执行耗时（毫秒）
    status: 'success' | 'error' | 'skipped' | 'pending';
    error?: any;        // 错误信息（如果有）
}</pre>
                <div class="mt-3">
                    <p class="text-sm"><span class="badge badge-info">使用场景</span> 被 Pipeline、DataProcessor 等模块用于记录执行过程</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">IExecutableContext - 可执行上下文接口</div>
            <div class="card">
                <p class="text-sm text-muted mb-3">所有上下文类型的基础接口</p>
                <pre style="background:#0A0A0B;padding:16px;border-radius:8px;overflow:auto;font-size:13px;color:#A855F7;">interface IExecutableContext {
    isAborted: boolean;              // 是否已中止
    steps: ExecutionStep[];          // 执行步骤记录
    metadata: Record&lt;string, any&gt;;   // 元数据（允许扩展）
}</pre>
                <div class="mt-3">
                    <p class="text-sm"><span class="badge badge-info">使用场景</span> 被 BaseContext、RequestContext 等上下文类型继承</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">IPipelineResult - 管道结果接口</div>
            <div class="card">
                <p class="text-sm text-muted mb-3">管道执行完成后的结果类型</p>
                <pre style="background:#0A0A0B;padding:16px;border-radius:8px;overflow:auto;font-size:13px;color:#A855F7;">interface IPipelineResult&lt;T = any&gt; {
    success: boolean;       // 执行是否成功
    context: T;             // 最终上下文
    steps: ExecutionStep[]; // 执行步骤
    error?: any;            // 错误信息
}</pre>
                <div class="mt-3">
                    <p class="text-sm"><span class="badge badge-info">使用场景</span> 被 Pipeline.execute() 返回，DataProcessor 执行结果</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">依赖关系</div>
            <div class="card">
                <div class="text-sm" style="line-height:2;">
                    <code style="color:#6366F1;">@orbitjs/types</code>
                    <span style="color:#666;"> ← </span>
                    <code>@orbitjs/context</code>
                    <span style="color:#666;"> ← </span>
                    <code>@orbitjs/pipeline</code>
                    <span style="color:#666;">, </span>
                    <code>@orbitjs/http</code>
                    <span style="color:#666;">, </span>
                    <code>@orbitjs/data-processor</code>
                </div>
            </div>
        </div>
    `);
}
