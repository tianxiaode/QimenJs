import { ResponseParser } from './ResponseParser';
import { HttpResponse, HttpError } from '../core/types';
import { ResponseParserPipeline } from './ResponseParserPipeline';

export class ResponseParserFactory {
  private static pipeline = new ResponseParserPipeline();

  // 注册自定义解析器
  static registerParser(parser: ResponseParser): void {
    this.pipeline.addParser(parser);
  }

  // 解析错误和数据
  static parseResponse(response: HttpResponse): { error: HttpError | null, data: any } {
    // 第一阶段：根据状态码判断错误
    const statusCodeError = this.pipeline.parseStatusCodeError(response);
    if (statusCodeError) {
      return { error: statusCodeError, data: null };
    }

    // 第二阶段：解析响应体中的错误
    const error = this.pipeline.parseError(response);
    if (error) {
      return { error, data: null };
    }

    // 判断是否为 JSON 格式并提取数据
    if (this.pipeline.isJsonResponse(response)) {
      const data = this.pipeline.extractData(response);
      return { error: null, data };  // 返回 JSON 数据
    }

    // 如果是 Blob 响应，直接返回 Blob 数据
    if (this.pipeline.isBlobResponse(response)) {
      const data = response.body;  // 假设 blob 存储在 body 中
      return { error: null, data };  // 返回 Blob 数据
    }

    // 如果是流数据，返回流
    if (this.pipeline.isStreamResponse(response)) {
      const data = response.body;  // 假设流数据存储在 body 中
      return { error: null, data };  // 返回流数据
    }

    // 如果是纯文本，尝试将其解析为 JSON
    if (response.headers['Content-Type']?.includes('text/plain')) {
      const body = response.getBody();
      try {
        const data = JSON.parse(body);  // 试图解析为 JSON
        return { error: null, data };
      } catch (e) {
        // 解析失败时，返回原始文本
        return { error: null, data: body };
      }
    }

    // 如果不属于以上类型，返回原始响应体
    return { error: null, data: response.body };
  }
}
