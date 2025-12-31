import { ChunkSource, HashAlgorithm } from '../../hash/types';

class SingleThreadHasher {
    constructor(
        private source: ChunkSource,
        private algo: HashAlgorithm
    ) {}

    async run() {
        await this.algo.init?.();

        while (true) {
            const chunk = await this.source.next();
            if (!chunk) break;

            await this.algo.update(chunk.data, {
                index: chunk.index,
            });
        }

        return await this.algo.digest();
    }
}
