import { md5 } from '@orbitjs/crypto';  // 使用本地MD5实现

export class ChunkedUploader {
  private chunkSize: number = 1024 * 1024; // 1MB

  /**
   * 上传文件
   * @param file 要上传的文件
   * @param endpoint 上传的端点URL
   * @returns 返回文件的MD5哈希值
   */
  async upload(file: File, endpoint: string): Promise<string> {
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    const chunkPromises: Promise<any>[] = [];

    // 计算整个文件的MD5
    const fileArrayBuffer = await this.readFileAsArrayBuffer(file);
    const fileHash = md5(String.fromCharCode(...new Uint8Array(fileArrayBuffer)));

    // 检查已上传的分块
    const uploadedChunks = await this.checkUploadedChunks(file.name, fileHash, endpoint);
    
    // 上传每个分片
    for (let i = 0; i < totalChunks; i++) {
      // 跳过已经上传的分块
      if (uploadedChunks.has(i)) {
        continue;
      }

      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);

      chunkPromises.push(
        this.uploadChunk(chunk, i, totalChunks, fileHash, file.name, endpoint)
      );
    }

    // 等待所有分块上传完成
    await Promise.all(chunkPromises);
    
    // 合并分块
    await this.mergeChunks(fileHash, file.name, totalChunks, endpoint);
    
    console.log('File upload complete');
    return fileHash;
  }

  /**
   * 上传单个分块
   * @param chunk 文件分块
   * @param index 分块索引
   * @param total 总分块数
   * @param fileHash 文件哈希
   * @param fileName 文件名
   * @param endpoint 上传端点
   */
  private async uploadChunk(
    chunk: Blob,
    index: number,
    total: number,
    fileHash: string,
    fileName: string,
    endpoint: string
  ): Promise<void> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('index', index.toString());
    formData.append('total', total.toString());
    formData.append('fileHash', fileHash);
    formData.append('fileName', fileName);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk ${index}: ${response.statusText}`);
    }
  }

  /**
   * 检查已上传的分块
   * @param fileName 文件名
   * @param fileHash 文件哈希
   * @param endpoint 检查端点
   * @returns 已上传的分块索引集合
   */
  private async checkUploadedChunks(
    fileName: string, 
    fileHash: string, 
    endpoint: string
  ): Promise<Set<number>> {
    const response = await fetch(`${endpoint}/checkUploadedChunks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        fileName, 
        fileHash 
      }),
    });

    if (!response.ok) {
      return new Set();
    }

    const result = await response.json();
    return new Set(result.uploadedChunks);
  }

  /**
   * 合并分块
   * @param fileHash 文件哈希
   * @param fileName 文件名
   * @param totalChunks 总分块数
   * @param endpoint 合并端点
   */
  private async mergeChunks(
    fileHash: string,
    fileName: string,
    totalChunks: number,
    endpoint: string
  ): Promise<void> {
    const response = await fetch(`${endpoint}/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileHash,
        fileName,
        totalChunks
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to merge chunks');
    }
  }

  /**
   * 将文件读取为文本
   * @param file 文件对象
   * @returns Promise<string>
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * 将文件读取为ArrayBuffer
   * @param file 文件对象
   * @returns Promise<ArrayBuffer>
   */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 将Blob读取为ArrayBuffer
   * @param blob Blob对象
   * @returns Promise<ArrayBuffer>
   */
  private readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsArrayBuffer(blob);
    });
  }
}
