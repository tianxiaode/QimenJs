export class PaginationHelper {
    public pageIndex: number = 1;
    public pageSize: number = 20;
    public total: number = 0;
    public pageSizeOptions: number[] = [10, 20, 50];

    constructor(private em: any) {}

    get pageCount() { return Math.ceil(this.total / this.pageSize) || 1; }

    async jump(page: number) {
        this.pageIndex = page; // 这里可加逻辑校验
        await this.em.list();
    }
    
    async next() { if (this.pageIndex < this.pageCount) await this.jump(this.pageIndex + 1); }
    async prev() { if (this.pageIndex > 1) await this.jump(this.pageIndex - 1); }
}