import { HttpRequest, HttpResponse } from "../core/types";

export interface HttpTransport {
    send(req: HttpRequest): Promise<HttpResponse>;
}