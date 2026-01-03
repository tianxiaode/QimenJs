import { HttpClient } from "@orbitjs/http";
import { RequestProcessors } from "./request";

export interface RepositoryConfig {
    httpClient: HttpClient;
    defaultPageSize: number;
    pageSizeOptions: number[];
    // 两个接口数组

    requestProcessors: RequestProcessors;
    
}

export interface StandardListResponse<T = any> {
  list: T[];
  total: number;
}