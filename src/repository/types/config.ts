import { HttpClient } from "@orbitjs/http";

export interface RepositoryConfig {
    httpClient: HttpClient;
    defaultPageSize: number;
    pageSizeOptions: number[];
    // 两个接口数组
    requestProcessors: RepoRequestProcessor[];
    responseProcessors: RepoResponseProcessor[];
}

