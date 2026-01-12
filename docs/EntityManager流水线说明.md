
# EntityManager 通用自治流水线架构文档 (V7 - 最终归档版)

## 1. 核心设计哲学

* **容器化 (Containerization)**：生命周期内仅维护一个 `FlowContext`。
* **自治零件 (Self-Governing)**：零件内部通过 Guard Clause 自行决定执行或跳过。
* **双 Raw 机制**：`data.source` (物理原貌) 与 `data.raw` (逻辑对象) 隔离。
* **可追踪性 (Traceability)**：通过 `steps` 数组记录每一个零件的生命轨迹。

---

## 2. 核心数据结构

### 2.1 执行步骤记录 (ExecutionStep)

用于追踪管线内部的动态流转。

```typescript
export interface ExecutionStep {
    action: string; // 动作名称
    duration: number;  // 执行耗时 (ms)
}

```

### 2.2 上下文对象 (FlowContext)

```typescript
export interface FlowContext {
    domain: string;
    action: string;
    
    http: {
        url: string;
        segments: any[];
        query: Record<string, any>;
        body: any;
        headers: Record<string, string>;
        status?: number;
        rawResponse?: any;
    };

    data: {
        source: any;       // 物理原始回包
        raw: any;          // 逻辑处理对象
        list: any[];       // 对齐后的列表
        item: any;         // 对齐后的单体
        total: number;
    };

    metadata: {
        hasError: boolean;
        isErrorHandled: boolean;
        isUpload: boolean;
        preset: string;    // 'abp' | 'spring' | 'custom'
    };
    
    // 执行轨迹记录
    steps: ExecutionStep[]; 
    
    config: DomainConfig;
}


```

### 2.3 Runner 逻辑（伪代码）：
```typescript
// 调度器自动记录，零件内部无需感知
for (const action of actions) {
    const start = Date.now();
    
    await action.handler(ctx); // 零件内部自己判断 if...return
    
    // 只要 handler 结束，就记录它跑过了
    ctx.steps.push({
        processor: action.id,
        duration: Date.now() - start
    });
}
```


---

## 3. 流水线执行相位 (Stages)

### Phase 1: Request Prepare (请求预设)

1. **Enrichment**: 注入配置与全局句柄。
2. **Auth & Header (自治)**: 如 `WechatAuth` 判断域后注入 Token。
3. **Param Alignment (自治)**: 如 `AbpParam` 根据 `preset` 将分页转为 `skipCount`。
4. **URL Construction**: 物理拼接 `baseUrl` + `segments` + `query`。
5. **EM Hook (onBeforeRequest)**: 记录步骤为 `processor: 'EM_PRIVATE_HOOK'`。

### Phase 2: Exchange & Transport (物理交换)

6. **Transport Selection**: 根据 `isUpload` 选择 `Fetch` 或 `XHR`。
7. **Failure Guard**: 捕获物理崩溃，标记 `hasError`，记录 `reason: 'network_timeout'` 等。

### Phase 3: Content Processing (内容识别)

> **跳过判定**: 若 `hasError` 为真，后续零件标记为 `skipped`, `reason: 'pipeline_has_error'`。

8. **Status & Type**: 识别 2xx/4xx/5xx 及 ContentType。
9. **Data Pre-parsing**: 将 `source` (字节/字符串) 转换为 `raw` (对象)。

### Phase 4: Business Alignment & Settlement (对齐与结算)

10. **Data Extraction (自治)**: 如 `SpringExtractor` 剥离 `Result<T>` 包装。
11. **EM Hook (onAfterResponse)**: 私有拦截或数据二次加工。
12. **Error Interceptors**: 检查 `status` 或 `result.error`，设置 `isErrorHandled`。
13. **Global Settlement**: 最终判定是否调用系统 `onError`。

---

## 4. 自治零件执行逻辑 (伪代码)

```typescript
// 一个典型的自治零件内部逻辑
async function AbpParamProcessor(ctx: FlowContext) {
    const start = Date.now();
    const step: ExecutionStep = { processor: 'AbpParam', weight: 10, action: 'skipped' };

    // 1. Guard Clause 自治判定
    if (ctx.metadata.preset !== 'abp') {
        step.reason = 'preset_mismatch';
        ctx.steps.push(step);
        return;
    }

    // 2. 核心逻辑
    try {
        ctx.http.query.skipCount = ctx.http.query.page * ctx.http.query.size;
        step.action = 'executed';
    } catch (e) {
        step.action = 'terminated';
        step.reason = e.message;
    } finally {
        step.duration = Date.now() - start;
        ctx.steps.push(step); // 留下脚印
    }
}

```

---

## 5. 文档留档说明

* **如何新增功能？** 编写一个新的 Action 零件，并在内部做好 `ctx` 条件判断，然后注册进管线。
* **如何适配新后端？** 增加一套 `Preset` 相关的参数对齐和数据对齐零件。
* **报错了怎么办？** 查阅 `ctx.steps`，确认是 `Transport` 物理失败，还是 `Extractor` 没把数据解析出来。

**这份 V7 版本已经是完整的工程白皮书了。** 它涵盖了从请求发起到错误追溯的全生命周期。你现在可以放心地基于此文档进行底层编码了。需要我为你提供一个简单的 `PipelineRunner` 调度器实现来作为代码层面的参考吗？