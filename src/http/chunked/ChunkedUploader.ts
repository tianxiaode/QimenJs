import { md5 } from 'js-md5';  // 使用外部库计算 MD5

class ChunkedUploader {
  private chunkSize: number;      // 每块的大小
  private totalSize: number;      // 文件的总大小
  private uploadedSize: number;   // 已上传的大小
  private file: File;             // 文件对象
  private uploadUrl: string;      // 上传的 URL
  private fileMD5: string;        // 文件的 MD5 校验
  private uploadedChunks: Set<number>;  // 已上传的块集合

  constructor(uploadUrl: string, file: File, chunkSize: number = 1024 * 1024) {
    this.uploadUrl = uploadUrl;
    this.file = file;
    this.chunkSize = chunkSize;
    this.totalSize = file.size;
    this.uploadedSize = 0;
    this.fileMD5 = '';  // 初始文件的 MD5 为空
    this.uploadedChunks = new Set();
  }

  // 计算分块的 MD5 校验和
  private async calculateChunkMD5(chunk: Blob): Promise<string> {
    const arrayBuffer = await chunk.arrayBuffer();
    return md5(arrayBuffer); // 使用外部库计算块的 MD5
  }

  // 上传一个文件的一个块
  private async uploadChunk(start: number, end: number): Promise<boolean> {
    const chunk = this.file.slice(start, end);
    const chunkMD5 = await this.calculateChunkMD5(chunk);  // 计算当前块的 MD5

    const formData = new FormData();
    formData.append('file', chunk, this.file.name);
    formData.append('start', start.toString());
    formData.append('end', end.toString());
    formData.append('chunkMD5', chunkMD5);  // 传递当前块的 MD5 校验

    const response = await fetch(this.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      this.uploadedSize = end;
      return true;
    }

    return false;
  }

  // 上传文件，支持断点续传
  public async upload(): Promise<void> {
    // 检查已上传的块
    this.uploadedChunks = await this.checkUploadedChunks();

    let chunkIndex = this.uploadedChunks.size;
    while (this.uploadedSize < this.totalSize) {
      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.totalSize);

      // 跳过已上传的分块
      if (!this.uploadedChunks.has(chunkIndex)) {
        const uploaded = await this.uploadChunk(start, end);
        if (!uploaded) {
          throw new Error(`Failed to upload chunk: ${start}`);
        }
        this.uploadedChunks.add(chunkIndex);
      }

      chunkIndex++;
    }

    console.log('File upload complete');
  }

  // 检查已上传的分块
  private async checkUploadedChunks(): Promise<Set<number>> {
    const response = await fetch(`${this.uploadUrl}/checkUploadedChunks`, {
      method: 'POST',
      body: JSON.stringify({ fileName: this.file.name }),
    });
    const result = await response.json();
    return new Set(result.uploadedChunks);
  }
}
