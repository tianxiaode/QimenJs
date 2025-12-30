class ChunkedDownloader {
  private chunkSize: number;
  private totalSize: number;
  private downloadedSize: number;
  private downloadUrl: string;

  constructor(downloadUrl: string, chunkSize: number = 1024 * 1024) {
    this.downloadUrl = downloadUrl;
    this.chunkSize = chunkSize;
    this.totalSize = 0;
    this.downloadedSize = 0;
  }

  // 获取文件大小
  private async getFileSize(): Promise<number> {
    const response = await fetch(this.downloadUrl, {
      method: 'HEAD',
    });
    const contentLength = response.headers.get('Content-Length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  // 下载文件分块
  private async downloadChunk(start: number, end: number): Promise<Blob> {
    const response = await fetch(this.downloadUrl, {
      headers: {
        'Range': `bytes=${start}-${end}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch chunk: ${start} - ${end}`);
    }
    return response.blob();
  }

  // 下载文件
  public async download(): Promise<Blob> {
    this.totalSize = await this.getFileSize();
    let fileData = [];

    while (this.downloadedSize < this.totalSize) {
      const start = this.downloadedSize;
      const end = Math.min(this.downloadedSize + this.chunkSize - 1, this.totalSize - 1);
      const chunk = await this.downloadChunk(start, end);
      fileData.push(chunk);
      this.downloadedSize = end + 1;

      // 可选：进度回调
      console.log(`Downloaded: ${this.downloadedSize}/${this.totalSize}`);
    }

    return new Blob(fileData);  // 返回完整文件
  }
}
