export function QueryMixin<TBase extends GConstructor<CoreEntityManager>>(Base: TBase) {
    return class extends Base {
        public filterText: string = '';
        public sortBy: string | null = null;
        public sortOrder: 'asc' | 'desc' | null = null;

        public async sort(key: string, order: 'asc' | 'desc' | null) {
            this.sortBy = key;
            this.sortOrder = order;
            this.pageIndex = 1; // 假设混入了分页，这里能访问到 pageIndex
            return (this as any).list();
        }

        public async search(text: string) {
            this.filterText = text;
            return (this as any).list();
        }
    };
}