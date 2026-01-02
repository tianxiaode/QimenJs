import { HttpClient } from '@orbitjs/http';
import { RepoRequestProcessor } from '../types/config';
import { RepoResponseProcessor } from '../types/processors';


export class RepositoryGlobalConfig {
    private static instance: RepositoryConfig;

    static setup(config: RepositoryConfig) {
        this.instance = config;
    }

    static get() {
        if (!this.instance) throw new Error('RepositoryGlobalConfig must be initialized first');
        return this.instance;
    }
}
