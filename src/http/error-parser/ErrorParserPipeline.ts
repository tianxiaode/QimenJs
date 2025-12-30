import { ErrorParser } from './ErrorParser';
import { HttpResponse, HttpError } from '../core/types';

export class ErrorParserPipeline {
  private parsers: ErrorParser[] = [];

  // 向管道中添加解析器
  addParser(parser: ErrorParser): void {
    this.parsers.push(parser);
  }

  // 按顺序逐个解析
  public parse(response: HttpResponse): HttpError {
    for (const parser of this.parsers) {
      const error = parser.parse(response);
      if (error) {
        return error;
      }
    }
    return new HttpError(response.statusCode, "Unknown error");  // 默认错误
  }
}
