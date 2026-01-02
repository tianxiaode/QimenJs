import { RetryPolicy } from './retry';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
export type HttpResponseType = 'json' | 'blob' | 'text' | 'arraybuffer';

export interface HttpOptions {
    timeout: number;
    responseType: HttpResponseType;
    withCredentials?: boolean;
}

export interface ChunkInfo {
    index: number;
    total: number;
    chunkSize: number;
    identifier: string;
}

export interface RequestOptions extends Partial<HttpOptions> {    
    body?: any;
    headers?: Record<string, string>;
    retryPolicy?: RetryPolicy | null;
    pathParams?: (string | number)[];
    queryParams?: Record<string, any>;
    stream?: boolean; 
    chunk?: ChunkInfo;
    signal?: AbortSignal; 
    onProgress?: (ev: ProgressEvent) => void;
    useXhr?: boolean;
}

export interface IHttpRequest {
    readonly url: string;
    readonly method: string;
    readonly headers: Record<string, string>;
    readonly body?: any;
    readonly options: RequestOptions;
}

/** * HttpClient.request 返回的高层对象
 */
export interface RequestTask<T> {
    promise: Promise<T>;
    cancel: () => void;
}