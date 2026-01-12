import { IEntity } from './schema';

export interface IEntityManager<T extends IEntity = any> {
    // --- 状态暴露 ---
    readonly domain: string;
    readonly data: T | T[] | null;
    readonly loading: boolean;
    readonly error: any;

    // --- 核心动作 ---
    /**
     * 统一调度方法，所有 CRUD 或自定义动作的入口
     * @param action 动作名称，如 'list' | 'detail' | 'save'
     * @param params 携带的参数
     */
    send<R = any>(action: string, params?: any): Promise<R>;

    // --- 数据便捷访问 ---
    refresh(): Promise<void>;
    reset(): void;

    // --- 事件能力 (如果 EM 本身支持局部监听) ---
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
}
