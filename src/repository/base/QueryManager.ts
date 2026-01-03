export class QueryManager {
    public state = {
        page: 1,
        size: 10,
        filters: {} as any,
        sort: {} as any,
    };

    update(params: any) {
        if (params.page) this.state.page = params.page;
        if (params.size) this.state.size = params.size;
        if (params.filters) this.state.filters = { ...this.state.filters, ...params.filters };
        return this.getPayload();
    }

    reset(filters = {}) {
        this.state.page = 1;
        this.state.filters = filters;
        return this.getPayload();
    }

    /**
     * 专门处理每页条数变化
     */
    changeSize(newSize: number) {
        this.state.size = newSize;
        // 关键逻辑：改变每页大小时，通常重置回第一页，避免超出范围
        this.state.page = 1;
        return this.getPayload();
    }

    /**
     * 跳转到指定页
     */
    jumpTo(page: number) {
        this.state.page = page;
        return this.getPayload();
    }

    getPayload() {
        // 在这里统一做空值过滤 (Clean Payload)
        return Object.fromEntries(
            Object.entries({
                ...this.state.filters,
                page: this.state.page,
                size: this.state.size,
            }).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        );
    }
}
