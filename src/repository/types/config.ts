import { HttpClient } from '@orbitjs/http';
import { AccessControlHandler, DataProcessorPipelines, PreProcessorPipelines } from './processor';

export interface RepositoryConfig {
    /** 核心搬运工 */
    httpClient: HttpClient;

    /** 分页配置 */
    defaultPageSize: number;
    pageSizeOptions: number[];

    /** * 访问控制闸门 (Gatekeeper)
     * 不同领域（Repo 实例）可以注入不同的校验逻辑
     */
    accessController?: AccessControlHandler;

    /** 预处理流水线：发货前的确认、拦截、构建 */
    prePipelines: PreProcessorPipelines;

    /** 数据处理流水线：到货后的清洗、槽位对齐、解释 */
    dataPipelines: DataProcessorPipelines;

    /** 调试模式开关 */
    debug?: boolean;
}
