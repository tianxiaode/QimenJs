import { array } from '@orbitjs/utils';
import { PageResult, PaginationParams, EntityManagerConfig } from '../types';
import { CoreEntityManager } from './CoreEntityManager';
import { DataProcessContext } from '../types';
import { EntityManagerInvalidPageError } from '../errors';

export abstract class ReadEntityManager extends CoreEntityManager {
    // 1. 内部状态机：存储当前的查询上下文
    protected _queryState: PaginationParams;

    // 存储最后一次理好的结果，供 nextPage/prePage 逻辑判断
    protected _lastResult: PageResult | null = null;

    protected _userPageSize: number;
    protected _rawItems: any[] = [];
    protected _isLocal: boolean = false;
    /**
     * [配置] 本地模式参与模糊搜索的字段清单
     * 子类覆写示例: protected localSearchFields = ['name', 'code', 'phone'];
     */
    protected localSearchFields: string[] = [];

    constructor(config: EntityManagerConfig) {
        super(config); // 确保 CoreEntityManager 已经把 config 挂载到了 this 上

        this._userPageSize = this.defaultPageSize;

        // 在这里初始化，万无一失
        this._queryState = {
            page: 1,
            pageSize: this._userPageSize,
        };
    }

    /**
     * 开启本地模式
     * 调用此方法后，后续的 search, filter, sort 都将在本地执行
     * @param data 可选：直接注入全量数据
     */
    public async useLocalMode(data?: any[]) {
        this._isLocal = true;
        if (data) {
            this._rawItems = data;
            this._lastResult = this.mapPageResult({ list: data, total: data.length } as any, {
                page: 1,
            });
        }
    }

    /**
     * [核心方法] 读取列表
     * 所有的搜索、翻页、过滤最终都会汇聚到这里
     */
    public async list(params: PaginationParams = {}): Promise<PageResult> {
        const nextQuery = { ...this._queryState, ...params };
        this.validateQueryState(nextQuery);

        // 合并状态：保留之前的搜索条件，覆盖新的分页/过滤参数
        this._queryState = nextQuery;

        if (this._isLocal) {
            // 如果还没缓存，先去同步全量数据
            if (this._rawItems.length === 0) {
                await this.syncLocalData();
            }
            // 执行本地计算（切片、过滤）
            return this.executeLocalQuery();
        }

        // 调度搬运工执行请求
        const raw = await this.sendRequest('list', this._queryState);
        this._rawItems = raw?.list || [];
        // 将后端返回的"生料"加工成标准"熟食"
        this._lastResult = this.mapPageResult(raw || ({} as any), this._queryState);
        return this._lastResult;
    }

    protected validateQueryState(nextQuery: PaginationParams): void {
        if (!this._lastResult) return;

        const { page = 1 } = nextQuery;
        const { totalPages } = this._lastResult;

        if (page < 1 || page > totalPages) {
            // 直接通过"抛异常"的方式宣告：此路不通
            throw new EntityManagerInvalidPageError(page, totalPages, { nextQuery });
        }
    }

    /**
     * 获取详情
     */
    public async detail(id: string | number) {
        return this.sendRequest('detail', { [this.rowKey]: id });
    }

    /**
     * 获取全量数据 (屏蔽分页参数)
     * 确保无论 UI 传了什么，发往后端的都只有过滤条件和排序
     */
    public async all(params: any = {}) {
        // 强制剔除分页相关的 key
        const { page, pageSize, ...pureParams } = params;

        // 调度 sendRequest，此时 payload 已经是干净的了
        return this.sendRequest('all', pureParams);
    }

    // --- 扁平化的友好 API ---

    /**
     * 简单搜索：通常重置页码并更新关键词
     */
    public async search(keyword: string) {
        return this.list({ page: 1, keyword: keyword || undefined });
    }

    /**
     * 复合过滤：通常重置页码并合并多维度参数
     */
    public async filter(params: any) {
        return this.list({ ...params, page: 1 });
    }

    /**
     * 排序
     */
    public async sort(prop: string, order: 'asc' | 'desc' | null) {
        return this.list({ page: 1, sortField: prop, sortOrder: order });
    }

    /**
     * 这是一个典型的 UI 动作：切换 20/50/100 条
     */
    public async setPageSize(size: number) {
        this._userPageSize = size; // 记忆用户的选择
        return this.list({
            pageSize: size,
            page: 1,
        });
    }
    /**
     * 方便 UI 直接绑定：<select :options="manager.pageSizeOptions" />
     */
    public get pageSizeOptions(): number[] {
        return this.config.pageSizeOptions || [10, 20, 50, 100];
    }

    /**
     * 翻页系列
     */
    public async nextPage() {
        return this.list({ page: this._queryState.page! + 1 });
    }

    public async prePage() {
        return this.list({ page: this._queryState.page! - 1 });
    }

    public async jumpTo(page: number) {
        return this.list({ page });
    }

    /**
     * 刷新：保持当前所有状态重新加载
     */
    public async refresh() {
        return this.list();
    }

    /**
     * 重置：彻底清空状态回到初始页
     */
    public async reset() {
        // 使用 _userPageSize 而不是 defaultPageSize
        this._queryState = {
            page: 1,
            pageSize: this._userPageSize,
        };
        return this.list();
    }
    // --- 属性快捷访问 ---

    /**
     * 获取配置的默认每页条数
     */
    public get pageSize(): number {
        return this._userPageSize || this.defaultPageSize || 20;
    }

    /**
     * 获取当前总记录数
     */
    public get total(): number {
        return this._lastResult?.total || 0;
    }

    /**
     * 获取当前总页数
     */
    public get totalPages(): number {
        return this._lastResult?.totalPages || 0;
    }

    // --- 数据加工厂 ---

    /**
     * 理货逻辑：将后端不规范的返回格式化
     * 子类可覆写以适配不同的后端规范 (如 ABP, Spring)
     */
    protected mapPageResult(raw: DataProcessContext, params: PaginationParams): PageResult {
        // 这里不再猜测，处理器没给 list 和 total 就是处理器的 Bug
        const { list = [], total = 0 } = raw;
        const page = params.page || 1;
        const pageSize = params.pageSize || this._userPageSize || this.defaultPageSize;
        const totalPages = Math.ceil(total / pageSize);

        return {
            items: list,
            total,
            page,
            pageSize,
            totalPages,
            hasPrev: page > 1,
            hasNext: page < totalPages,
        };
    }

    protected async syncLocalData() {
        // 这里传入当前的 _queryState
        // all() 会自动帮我们把里面的 page, pageSize 删掉
        const data = await this.all(this._queryState);

        this._rawItems = Array.isArray(data) ? data : (data as any).list || [];
    }

    /**
     * 执行本地查询（主流程）
     */
    protected executeLocalQuery(): PageResult {
        let result = [...this._rawItems];

        // 1. 调用可覆写的搜索方法
        result = this.localSearchHandler(result, this._queryState.keyword);

        // 2. 调用可覆写的过滤方法 (针对复合过滤)
        result = this.localFilterHandler(result, this._queryState);

        // 3. 调用可覆写的排序方法
        result = this.localSortHandler(
            result,
            this._queryState.sortField,
            this._queryState.sortOrder
        );

        // 4. 分页切片 (这个逻辑通常固定，不建议覆写)
        const total = result.length;
        const page = this._queryState.page || 1;
        const size = this._queryState.pageSize || this._userPageSize;
        const pagedItems = size > 0 ? result.slice((page - 1) * size, page * size) : result;

        this._lastResult = this.mapPageResult({ list: pagedItems, total } as any, this._queryState);
        return this._lastResult;
    }

    /**
     * [可覆写] 本地搜索逻辑
     */
    protected localSearchHandler(items: any[], keyword?: string): any[] {
        if (!keyword) return items;
        const k = keyword.toLowerCase();

        // 1. 如果定义了 searchFields，进行精准模糊搜索
        if (this.localSearchFields.length > 0) {
            return items.filter(item =>
                this.localSearchFields.some(field =>
                    String(item[field] ?? '')
                        .toLowerCase()
                        .includes(k)
                )
            );
        }

        // 2. 否则，保持之前的兜底方案 (全对象匹配)
        return items.filter(item => JSON.stringify(item).toLowerCase().includes(k));
    }

    /**
     * [可覆写] 本地复合过滤逻辑
     */
    protected localFilterHandler(items: any[], state: PaginationParams): any[] {
        // 默认实现：不做额外处理。
        // 子类可以在此覆写，比如实现 item.status === state.status
        return items;
    }

    /**
     * [可覆写] 本地排序逻辑
     */
    protected localSortHandler(items: any[], prop?: string, order?: 'asc' | 'desc' | null): any[] {
        if (!prop || !order) return items;
        return array.orderBy(items, [{ key: prop, order: order }]);
    }
}