import { ActionHandler, FlowContext } from '../../types';


export const FetchTransportHandler: ActionHandler = async (ctx: FlowContext) => {
    // 1. 自治判定：非上传任务才走 Fetch
    if (ctx.metadata.isUpload) return;

    // 2. 初始化 Abort 控制器并存入上下文，供外部或后续逻辑控制
    const internalController = new AbortController();
    ctx.http.controller = internalController; // 重点：控制权外露
    
    // 3. 处理超时逻辑 (合并你之前的 createAbortContext 逻辑)
    const timeout = ctx.config.timeout || 10000;
    const timeoutId = setTimeout(() => internalController.abort('timeout'), timeout);

    try {
        const { url, method, headers, body } = ctx.http;

        const response = await fetch(url, {
            method,
            headers,
            // 使用你提供的 serializeBody 逻辑
            body: !['GET', 'HEAD'].includes(method.toUpperCase()) 
                  ? JSON.stringify(body) 
                  : undefined,
            signal: internalController.signal,
        });

        // 4. 填充物理响应信息
        ctx.http.status = response.status;
        ctx.http.rawResponse = response;
        
        // 5. 提取响应头 (使用你提供的 extractHeaders)
        ctx.http.responseHeaders = {};
        response.headers.forEach((v, k) => { ctx.http.responseHeaders![k] = v; });

        ctx.metadata.isTransportFailure = false;
        
    } catch (error: any) {
        ctx.metadata.isTransportFailure = true;
        ctx.metadata.hasError = true;
        
        // 识别是否是超时导致
        if (error.name === 'AbortError' || internalController.signal.aborted) {
            ctx.metadata.errorReason = internalController.signal.reason === 'timeout' ? 'timeout' : 'cancelled';
        } else {
            ctx.metadata.errorReason = 'network_error';
        }
        ctx.data.source = error; 
    } finally {
        clearTimeout(timeoutId);
    }
};

