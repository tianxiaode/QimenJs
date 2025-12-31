export interface WorkerHandle {
  readonly id: string;

  post<T = any>(message: T, transfer?: Transferable[]): void;

  onMessage(handler: (msg: any) => void): void;
  onError(handler: (err: Error) => void): void;

  terminate(): Promise<void>;

  isAlive(): boolean;
}
