import { HttpClient } from "@orbitjs/http";
import { RequestProcessors } from "./request";
import { RepositoryResponseProcessors } from "./response";

export interface RepositoryConfig {
    httpClient: HttpClient;
    defaultPageSize: number;
    pageSizeOptions: number[];
    // 两个接口数组

    requestProcessors: RequestProcessors;
    responseProcessors: RepositoryResponseProcessors;    
}
