import { TPL_NODE_FIELDS } from '@/component-core/types/tpl-node-def';

describe('tpl-node-def', () => {
    it('float/drag/animation 已加入 TPL_NODE_FIELDS', () => {
        const fields = TPL_NODE_FIELDS.map(f => f.field);
        expect(fields).toContain('float');
        expect(fields).toContain('drag');
        expect(fields).toContain('animation');
    });

    it('float/drag/animation 写入 meta', () => {
        const floatField = TPL_NODE_FIELDS.find(f => f.field === 'float')!;
        const dragField = TPL_NODE_FIELDS.find(f => f.field === 'drag')!;
        const animField = TPL_NODE_FIELDS.find(f => f.field === 'animation')!;
        expect(floatField.toMeta).toBe(true);
        expect(dragField.toMeta).toBe(true);
        expect(animField.toMeta).toBe(true);
    });
});
