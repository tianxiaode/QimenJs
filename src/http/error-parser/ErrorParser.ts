import { HttpResponse, HttpError } from '../core/types';

// 错误解析器接口
export interface ErrorParser {
  parse(response: HttpResponse): HttpError | null;
}
