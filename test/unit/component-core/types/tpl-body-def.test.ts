import {
    TPL_NODE_FIELDS,
    copyMetaFields,
    copyRootFields,
} from '@/component-core/types/tpl-node-def';

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

    it('text 字段已加入 TPL_NODE_FIELDS 且写入 meta', () => {
        const textField = TPL_NODE_FIELDS.find(f => f.field === 'text')!;
        expect(textField).toBeDefined();
        expect(textField.category).toBe('content');
        expect(textField.toMeta).toBe(true);
        expect(textField.toRoot).toBe(false);
    });

    it('copyMetaFields 复制 text 字段', () => {
        const source = { text: 'Hello', i18n: 'btn.ok', cls: 'active' };
        const target = copyMetaFields(source);
        expect(target.text).toBe('Hello');
        expect(target.i18nKey).toBe('btn.ok');
        expect(target.cls).toBe('active');
    });

    it('copyRootFields 复制 cls/style/flex/grid', () => {
        const source = { cls: 'test', style: 'color:red', flex: true, grid: true, text: 'skip' };
        const target = copyRootFields(source);
        expect(target.cls).toBe('test');
        expect(target.style).toBe('color:red');
        expect(target.flex).toBe(true);
        expect(target.grid).toBe(true);
        expect(target.text).toBeUndefined();
    });
});
