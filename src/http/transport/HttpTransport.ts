import { HttpRequest } from "../core/types";

export interface HttpTransport {
    request(req: HttpRequest): Promise<{
        status: number;
        headers: Headers;
        body: any;
    }>;
}
