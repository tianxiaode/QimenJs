import { ErrorParser } from './ErrorParser';
import { HttpResponse, HttpError } from '../core/types';
import { ErrorParserPipeline } from './ErrorParserPipeline';

export class ErrorParserFactory {
  private static pipeline = new ErrorParserPipeline();

  // 注册自定义解析器
  static registerParser(parser: ErrorParser): void {
    this.pipeline.addParser(parser);
  }

  // 解析错误，统一处理错误和成功响应
  static parseError(response: HttpResponse): HttpResponse | HttpError {
    const error = this.pipeline.parse(response);  // 尝试通过管道解析错误

    if (error instanceof HttpError) {
      return error;  // 如果解析出错误，返回错误
    }

    return response;  // 否则返回成功响应
  }
}
