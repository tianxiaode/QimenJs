import { HttpTransport } from "./HttpTransport";

export class XhrTransport implements HttpTransport {
    request(req: HttpRequest) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(req.method, req.url);

            Object.entries(req.headers || {}).forEach(([k, v]) =>
                xhr.setRequestHeader(k, v as string)
            );

            if (req.onProgress) {
                xhr.upload.onprogress = req.onProgress;
            }

            xhr.onload = () => {
                resolve({
                    status: xhr.status,
                    headers: new Headers(),
                    body: JSON.parse(xhr.responseText),
                });
            };

            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(req.body);
        });
    }
}
