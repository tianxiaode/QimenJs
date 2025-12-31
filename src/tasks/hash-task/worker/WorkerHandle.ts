export interface WorkerHandle {
  readonly id: string;
  post<T = any>(message: T, transfer?: Transferable[]): void;

  /** * 注册消息监听，并返回一个取消监听的函数 (Unsubscribe pattern)
   * 这种模式比手动 add/remove 更不容易出错
   */
  onMessage(handler: (msg: any) => void): () => void; // ✨ 修改点：返回取消函数
  
  onError(handler: (err: Error) => void): () => void;
  
  terminate(): Promise<void>;
  isAlive(): boolean;
}