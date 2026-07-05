import { HashTaskProgress, TaskProgressSnapshot } from '@/task/hash-task/hash/HashTaskProgress';

describe('HashTaskProgress', () => {
    let progress: HashTaskProgress;

    beforeEach(() => {
        progress = new HashTaskProgress();
    });

    describe('init', () => {
        it('should initialize with default values when no totalBytes provided', () => {
            progress.init();

            const snapshot = progress.snapshot();
            expect(snapshot.processedBytes).toBe(0);
            expect(snapshot.processedChunks).toBe(0);
            expect(snapshot.totalBytes).toBeUndefined();
            expect(snapshot.progress).toBeUndefined();
        });

        it('should initialize with provided totalBytes', () => {
            progress.init(1000);

            const snapshot = progress.snapshot();
            expect(snapshot.processedBytes).toBe(0);
            expect(snapshot.processedChunks).toBe(0);
            expect(snapshot.totalBytes).toBe(1000);
            expect(snapshot.progress).toBe(0);
        });
    });

    describe('onChunk', () => {
        it('should update processed bytes and chunks when chunk is processed', () => {
            progress.init(100);

            const chunk = { data: { byteLength: 50 } };
            progress.onChunk(chunk);

            const snapshot = progress.snapshot();
            expect(snapshot.processedBytes).toBe(50);
            expect(snapshot.processedChunks).toBe(1);
        });

        it('should accumulate bytes and chunks with multiple chunks', () => {
            progress.init(200);

            const chunk1 = { data: { byteLength: 30 } };
            const chunk2 = { data: { byteLength: 70 } };
            progress.onChunk(chunk1);
            progress.onChunk(chunk2);

            const snapshot = progress.snapshot();
            expect(snapshot.processedBytes).toBe(100);
            expect(snapshot.processedChunks).toBe(2);
        });

        it('should calculate progress correctly when totalBytes is known', () => {
            progress.init(100);

            const chunk = { data: { byteLength: 25 } };
            progress.onChunk(chunk);

            const snapshot = progress.snapshot();
            expect(snapshot.progress).toBe(0.25); // 25/100
        });

        it('should cap progress at 1 when processed bytes exceed total', () => {
            progress.init(100);

            const chunk = { data: { byteLength: 150 } };
            progress.onChunk(chunk);

            const snapshot = progress.snapshot();
            expect(snapshot.progress).toBe(1);
        });
    });

    describe('snapshot', () => {
        it('should return correct snapshot values', () => {
            progress.init(200);

            const chunk = { data: { byteLength: 50 } };
            progress.onChunk(chunk);

            const snapshot: TaskProgressSnapshot = progress.snapshot();

            expect(snapshot).toEqual({
                progress: 0.25,
                processedBytes: 50,
                totalBytes: 200,
                processedChunks: 1,
            });
        });

        it('should return progress as undefined when totalBytes is unknown', () => {
            const chunk = { data: { byteLength: 50 } };
            progress.onChunk(chunk);

            const snapshot = progress.snapshot();

            expect(snapshot.progress).toBeUndefined();
            expect(snapshot.processedBytes).toBe(50);
            expect(snapshot.processedChunks).toBe(1);
            expect(snapshot.totalBytes).toBeUndefined();
        });
    });
});
