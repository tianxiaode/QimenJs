export interface BackendAdapter {
    isSuccess(response: any): boolean;
    extractData(response: any): any;
    extractError(response: any): {
        code?: string | number;
        message: string;
        detail?: any;
    };
}
export interface HttpRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
}

export type Middleware = (req: HttpRequest) => void | Promise<void>;