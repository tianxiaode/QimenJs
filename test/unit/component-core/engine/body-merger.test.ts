import { BodyMerger } from '@/component-core/engine/BodyMerger';

describe('BodyMerger', () => {
    describe('merge', () => {
        it('parentBody 为 undefined 时返回 childBody 副本', () => {
            const child = { tag: 'div', cls: 'child' };
            const result = BodyMerger.merge(undefined, child);
            expect(result).toEqual(child);
            expect(result).not.toBe(child);
        });

        it('简单合并父和子 body', () => {
            const parent = { tag: 'div', cls: 'parent' };
            const child = { cls: 'child', hidden: true };
            const result = BodyMerger.merge(parent, child);
            expect(result).toEqual({ tag: 'div', cls: 'child', hidden: true });
        });

        it('合并 nodes 配置', () => {
            const parent = { nodes: { header: { cls: 'h1' }, footer: { cls: 'f1' } } };
            const child = { nodes: { header: { hidden: true }, body: { cls: 'b1' } } };
            const result = BodyMerger.merge(parent, child);
            expect(result.nodes).toEqual({
                header: { cls: 'h1', hidden: true },
                footer: { cls: 'f1' },
                body: { cls: 'b1' },
            });
        });

        it('child 无 nodes 时保留 parent nodes', () => {
            const parent = { nodes: { header: { cls: 'h1' } } };
            const child = { cls: 'child' };
            const result = BodyMerger.merge(parent, child);
            expect(result.nodes).toEqual({ header: { cls: 'h1' } });
        });

        it('parent 无 nodes 时保留 child nodes', () => {
            const parent = { tag: 'div' };
            const child = { nodes: { header: { cls: 'h1' } } };
            const result = BodyMerger.merge(parent, child);
            expect(result.nodes).toEqual({ header: { cls: 'h1' } });
        });
    });

    describe('mergeTplEvents', () => {
        it('parentEvents 为 undefined 时返回 childEvents 副本', () => {
            const child = { root: ['click'] };
            const result = BodyMerger.mergeTplEvents(undefined, child);
            expect(result).toEqual(child);
            expect(result).not.toBe(child);
        });

        it('数组合并', () => {
            const parent = { root: ['click', 'focus'] };
            const child = { root: ['blur'] };
            const result = BodyMerger.mergeTplEvents(parent, child);
            expect(result.root).toEqual(['click', 'focus', 'blur']);
        });

        it('对象合并', () => {
            const parent = { root: { click: 'onClick' } };
            const child = { root: { blur: 'onBlur' } };
            const result = BodyMerger.mergeTplEvents(parent, child);
            expect(result.root).toEqual({ click: 'onClick', blur: 'onBlur' });
        });

        it('类型不一致时 child 覆盖', () => {
            const parent = { root: ['click'] };
            const child = { root: { click: 'onClick' } };
            const result = BodyMerger.mergeTplEvents(parent, child);
            expect(result.root).toEqual({ click: 'onClick' });
        });

        it('新增 nodeName', () => {
            const parent = { root: ['click'] };
            const child = { icon: ['tap'] };
            const result = BodyMerger.mergeTplEvents(parent, child);
            expect(result).toEqual({ root: ['click'], icon: ['tap'] });
        });

        it('parent 有 nodeName 但 child 无对应时保留 parent', () => {
            const parent = { root: ['click'], icon: ['tap'] };
            const child = { root: ['blur'] };
            const result = BodyMerger.mergeTplEvents(parent, child);
            expect(result.icon).toEqual(['tap']);
        });
    });

    describe('mergeNodeOverrides', () => {
        it('parentOverrides 为 undefined 时返回 childOverrides 副本', () => {
            const child = { header: { cls: 'h1' } };
            const result = BodyMerger.mergeNodeOverrides(undefined, child);
            expect(result).toEqual(child);
            expect(result).not.toBe(child);
        });

        it('合并同名 node 的 override', () => {
            const parent = { header: { cls: 'h1', hidden: false } };
            const child = { header: { cls: 'h2' } };
            const result = BodyMerger.mergeNodeOverrides(parent, child);
            expect(result.header).toEqual({ cls: 'h2', hidden: false });
        });

        it('新增 node override', () => {
            const parent = { header: { cls: 'h1' } };
            const child = { footer: { cls: 'f1' } };
            const result = BodyMerger.mergeNodeOverrides(parent, child);
            expect(result).toEqual({ header: { cls: 'h1' }, footer: { cls: 'f1' } });
        });
    });
});
