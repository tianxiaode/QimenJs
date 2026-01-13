export const AbpAlignerEntry: ActionEntry = {
    name: 'AbpAligner',
    category: ActionCategory.ALIGN,
    description: '对齐 ABP 数据',
    offset: 100,
    handler: async (ctx) => {
        if (ctx.metadata.preset !== 'abp' || ctx.metadata.isTransportFailure) return;

        const raw = ctx.data.raw;

        // 1. 业务逻辑判定：ABP 返回 success: false
        if (raw && raw.success === false) {
            ctx.metadata.hasError = true;
            // 提取 ABP 标准错误格式
            const errorInfo = raw.error || {};
            const message = errorInfo.details || errorInfo.message || 'ABP 系统错误';
            
            // 2. 直接在这里结算：弹出 UI 提示
            if (!ctx.metadata.silent) {
                ui.notification.error(message); 
            }
            return;
        }

        // 3. 成功逻辑：对齐数据
        ctx.data.list = raw?.result?.items || [];
        ctx.data.total = raw?.result?.totalCount || 0;
    }
};