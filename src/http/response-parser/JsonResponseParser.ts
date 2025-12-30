import { ResponseParser } from './ResponseParser';
import { HttpResponse, HttpError } from '../core/types';

export class JsonResponseParser implements ResponseParser {
  // 解析状态码错误
  parseStatusCodeError(response: HttpResponse): HttpError | null {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      return new HttpError(response.statusCode, `HTTP Error ${response.statusCode}`, response.body);
    }
    return null;
  }

  // 解析响应体中的业务错误
  parseError(response: HttpResponse): HttpError | null {
    if (this.isJsonResponse(response)) {
      const body = response.getBody();
      if (body.errorCode || body.code || body.errorMessage || body.msg) {
        return new HttpError(response.statusCode, body.errorMessage || 'Unknown error', body);
      }
    }
    return null;
  }

  // 提取数据
  extractData(response: HttpResponse): any | null {
    if (this.isJsonResponse(response)) {
      const body = response.getBody();
      if (body && body.data) {
        return body.data;  // 提取 data 字段
      }
    }
    return null;  // 如果没有数据，返回 null
  }

  // 判断是否是 JSON 响应
  isJsonResponse(response: HttpResponse): boolean {
    return response.headers['Content-Type']?.includes('application/json') ?? false;
  }
}
