import { HttpRequest } from "../core/types";

export interface HttpTransport {
    send(req: HttpRequest): Promise<{
        status: number;
        headers: Headers;
        body: any;
    }>;
}
