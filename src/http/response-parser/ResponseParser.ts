import { HttpResponse, HttpError } from '../core/types';

export interface ResponseParser {
  // 根据状态码解析错误
  parseStatusCodeError(response: HttpResponse): HttpError | null;

  // 解析响应体中的错误
  parseError(response: HttpResponse): HttpError | null;

  // 提取数据
  extractData(response: HttpResponse): any | null;

  // 判断是否是 JSON 响应
  isJsonResponse(response: HttpResponse): boolean;

  // 判断是否是 Blob 响应
  isBlobResponse(response: HttpResponse): boolean;

  // 判断是否是流数据
  isStreamResponse(response: HttpResponse): boolean;
}
