import { Chunk } from "./chunk"

export type WorkerMessage =
  | {
      type: 'init'
    }
  | {
      type: 'update'
      chunk: Chunk
    }
  | {
      type: 'digest'
    }

export type WorkerResponse =
  | {
      type: 'ack'
    }
  | {
      type: 'result'
      hash: Uint8Array
    }
  | {
      type: 'error'
      error: string
    }
