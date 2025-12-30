import { ResponseParser } from './ResponseParser';
import { HttpResponse, HttpError } from '../core/types';

export class ResponseParserPipeline {
  private parsers: ResponseParser[] = [];

  // 向管道中添加解析器
  addParser(parser: ResponseParser): void {
    this.parsers.push(parser);
  }

  // 解析状态码错误
  public parseStatusCodeError(response: HttpResponse): HttpError | null {
    for (const parser of this.parsers) {
      const error = parser.parseStatusCodeError(response);
      if (error) {
        return error;  // 如果某个解析器处理了状态码错误，立即返回
      }
    }
    return null;  // 如果没有状态码错误，返回 null
  }

  // 解析响应体错误
  public parseError(response: HttpResponse): HttpError | null {
    for (const parser of this.parsers) {
      const error = parser.parseError(response);
      if (error) {
        return error;  // 如果某个解析器处理了错误，立即返回
      }
    }
    return null;  // 如果没有错误，返回 null
  }

  // 提取数据
  public extractData(response: HttpResponse): any {
    for (const parser of this.parsers) {
      const data = parser.extractData(response);
      if (data !== null) {
        return data;  // 如果某个解析器提取到了数据，立即返回
      }
    }
    return null;  // 如果没有数据，返回 null
  }

  // 判断是否是 JSON 响应
  public isJsonResponse(response: HttpResponse): boolean {
    return response.headers['Content-Type']?.includes('application/json') ?? false;
  }

  // 判断是否是 Blob 响应
  public isBlobResponse(response: HttpResponse): boolean {
    return response.headers['Content-Type']?.includes('application/octet-stream') ?? false;
  }

  // 判断是否是流数据
  public isStreamResponse(response: HttpResponse): boolean {
    return response.headers['Content-Type']?.includes('application/octet-stream') || 
           response.headers['Content-Type']?.includes('multipart/form-data');
  }
}
