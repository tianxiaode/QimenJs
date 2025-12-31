export interface Chunk {
    id: string;
    data: ArrayBuffer;
}

export interface ChunkProvider {
    next(): Promise<Chunk | null>;
    reset?(): void;
}
export interface ChunkSource {
    next(): Promise<Chunk | null>;
    pause(): void;
    resume(): void;
    close(): void;
}
