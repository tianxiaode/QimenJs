/**
 * 模拟 API 响应工厂
 *
 * 提供各种格式的模拟 API 响应，确保测试数据与真实 API 响应格式一致。
 */

/**
 * ABP 分页响应工厂
 * 格式：PagedResultDto { items, totalCount }
 */
export function createAbpPagedResponse<T>(items: T[], totalCount: number): object {
    return {
        items,
        totalCount,
    };
}

/**
 * Spring 分页响应工厂
 * 格式：Page<T> { content, totalElements, totalPages, number, size }
 */
export function createSpringPagedResponse<T>(
    content: T[],
    totalElements: number,
    page: number = 0,
    size: number = 10
): object {
    return {
        content,
        totalElements,
        totalPages: Math.ceil(totalElements / size),
        number: page,
        size,
    };
}

/**
 * OAuth2 Token 响应工厂
 */
export function createOAuth2TokenResponse(overrides?: {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
}): object {
    return {
        access_token: overrides?.access_token || 'test-access-token',
        token_type: overrides?.token_type || 'Bearer',
        expires_in: overrides?.expires_in || 3600,
        refresh_token: overrides?.refresh_token || 'test-refresh-token',
        scope: overrides?.scope || 'read write',
    };
}

/**
 * 错误响应工厂
 */
export function createErrorResponse(status: number, message: string): object {
    return {
        status,
        message,
        error: {
            code: status,
            details: message,
        },
    };
}

/**
 * SSE 事件流工厂
 * 构造包含 SSE 事件的 ReadableStream，用于 StreamClient 测试
 */
export function createSSEStream(
    events: object[],
    options?: { done?: boolean }
): ReadableStream<Uint8Array> {
    // 兼容 jsdom 环境（可能没有 TextEncoder）
    const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : {
        encode: (str: string) => {
            const arr = new Uint8Array(str.length);
            for (let i = 0; i < str.length; i++) {
                arr[i] = str.charCodeAt(i);
            }
            return arr;
        }
    };

    const chunks: Uint8Array[] = [];

    for (const event of events) {
        chunks.push(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    }

    if (options?.done !== false) {
        chunks.push(encoder.encode('data: [DONE]\n\n'));
    }

    let index = 0;

    return new ReadableStream<Uint8Array>({
        pull(controller) {
            if (index < chunks.length) {
                controller.enqueue(chunks[index]);
                index++;
            } else {
                controller.close();
            }
        },
    });
}

/**
 * 创建 mock fetch 成功响应
 */
export function mockFetchSuccess(data: any, status: number = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? 'OK' : 'Created',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
        clone: function () { return this; },
    } as unknown as Response;
}

/**
 * 创建 mock fetch 错误响应
 */
export function mockFetchError(status: number, message: string): Response {
    const errorData = createErrorResponse(status, message);
    return {
        ok: false,
        status,
        statusText: status === 401 ? 'Unauthorized' : status === 404 ? 'Not Found' : 'Internal Server Error',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: () => Promise.resolve(errorData),
        text: () => Promise.resolve(JSON.stringify(errorData)),
        clone: function () { return this; },
    } as unknown as Response;
}
