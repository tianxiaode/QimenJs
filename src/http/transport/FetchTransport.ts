import { HttpTransport } from "./HttpTransport";

export class FetchTransport implements HttpTransport {
    async request(req: HttpRequest) {
        const res = await fetch(req.url, {
            method: req.method,
            headers: req.headers,
            body: req.body,
        });

        return {
            status: res.status,
            headers: res.headers,
            body: await res.json(),
        };
    }
}
