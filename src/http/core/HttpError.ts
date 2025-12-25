import { BaseError } from "@/error";

export class HttpError extends BaseError {
    status?: number;
    detail?: any;
    retryable?: boolean;

    constructor(code: string | number, message: string, options: Partial<HttpError> = {}) {
        super( message, code);
        Object.assign(this, options);
    }
}
