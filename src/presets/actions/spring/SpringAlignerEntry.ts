// /src/actions/04-align/SpringAligner.ts
export const SpringAlignerEntry: ActionEntry = {
    name: 'SpringAligner',
    category: ActionCategory.ALIGN,
    handler: async (ctx) => {
        if (ctx.metadata.preset !== 'spring' || ctx.metadata.isTransportFailure) return;

        const raw = ctx.data.raw;

        // Spring 逻辑：code 不等于 200 就是错
        if (raw && raw.code !== 200) {
            ctx.metadata.hasError = true;
            if (!ctx.metadata.silent) {
                ui.toast.show(raw.msg || 'Spring 业务异常');
            }
            return;
        }

        ctx.data.list = raw?.data || [];
    }
};