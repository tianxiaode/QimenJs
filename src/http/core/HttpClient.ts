class HttpClient {
  private transport: HttpTransport;
  private middleware: Function[] = [];

  constructor(transport: HttpTransport, middleware: Function[] = []) {
    this.transport = transport;
    this.middleware = middleware;
  }

  // 基础的 HTTP 请求方法
  public async request(request: HttpRequest, options: any = {}): Promise<any> {
    const modifiedRequest = this.applyMiddleware(request);
    const response = await this.transport.send(modifiedRequest);

    // 如果需要分片下载
    if (options.chunkedDownload) {
      return this.chunkedDownload(response, options.chunkSize || 1024 * 1024);
    }

    // 如果需要分片上传
    if (options.chunkedUpload) {
      return this.chunkedUpload(request.body, options.chunkSize || 1024 * 1024, options.uploadUrl);
    }

    // 正常处理响应
    const { error, data } = ResponseParserFactory.parseResponse(response);
    if (error) {
      throw error;  // 如果有错误，抛出错误
    }

    return data;  // 返回提取的数据
  }

  // 分片上传处理
  private async chunkedUpload(file: File, chunkSize: number, uploadUrl: string): Promise<void> {
    const uploader = new ChunkedUploader(uploadUrl, chunkSize);
    await uploader.upload(file);
  }

  // 分片下载处理
  private async chunkedDownload(response: HttpResponse, chunkSize: number): Promise<Blob> {
    const downloadUrl = response.url;  // 假设 `response` 中有下载链接
    const downloader = new ChunkedDownloader(downloadUrl, chunkSize);
    return await downloader.download();
  }

  // 中间件应用
  private applyMiddleware(request: HttpRequest): HttpRequest {
    // 中间件处理逻辑
    return request;
  }
}
