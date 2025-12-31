import { ErrorBase } from '@orbitjs/error';

export class AlgorithmNotSupportedError extends ErrorBase {
    constructor(
        algorithm: string,
        public readonly algorithmName: string
    ) {
        super(
            `AlgorithmNotSupportedError: Algorithm "${algorithm}" is not supported in this environment`,
            'ALGORITHM_NOT_SUPPORTED',
            { algorithm, algorithmName }
        );
        this.name = 'AlgorithmNotSupportedError';
    }
}
