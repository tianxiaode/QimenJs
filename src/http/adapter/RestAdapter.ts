import { BackendAdapter } from "../core/types";

export class RestAdapter implements BackendAdapter {
    isSuccess(res: any) {
        return res.code === 0;
    }

    extractData(res: any) {
        return res.data;
    }

    extractError(res: any) {
        return {
            code: res.code,
            message: res.message || 'Unknown error',
        };
    }
}