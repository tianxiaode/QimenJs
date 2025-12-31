export interface HashAlgorithmContext {
  readonly index: number        // chunk index
  readonly total?: number       // total chunks（可选）
}

export interface HashAlgorithm {
  init?(): void | Promise<void>

  update(
    chunk: Uint8Array,
    ctx: HashAlgorithmContext
  ): void | Promise<void>

  digest(): Uint8Array | Promise<Uint8Array>
}
