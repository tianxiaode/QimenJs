import { compileTemplate, expandFragments } from '@/component-core/engine/TemplateCompiler';
import { TemplateDeriver } from '@/component-core/engine/TemplateDeriver';
import { Logger } from '@/logger';

function compile(tpl: any) {
    const expanded = expandFragments(tpl);
    return compileTemplate(expanded, Logger.for('bench'));
}

const BUTTON_TPL = {
    tag: 'div',
    cls: 'q-button',
    children: [
        { tag: 'i', name: 'icon', cls: 'q-button__icon' },
        { tag: 'span', name: 'text', cls: 'q-button__text' },
        {
            tag: 'i',
            name: 'dropIcon',
            cls: 'q-expand-arrow q-expand-arrow--collapsed',
            hidden: true,
        },
    ],
};

const COMPLEX_TPL = {
    tag: 'div',
    cls: 'q-panel',
    children: [
        {
            tag: 'div',
            name: 'header',
            cls: 'q-panel__header',
            children: [
                { tag: 'span', name: 'title', cls: 'q-panel__title' },
                {
                    tag: 'div',
                    name: 'tools',
                    cls: 'q-panel__tools',
                    children: [
                        { tag: 'i', name: 'tool1', cls: 'q-panel__tool' },
                        { tag: 'i', name: 'tool2', cls: 'q-panel__tool' },
                        { tag: 'i', name: 'tool3', cls: 'q-panel__tool' },
                    ],
                },
            ],
        },
        { tag: 'div', name: 'body', cls: 'q-panel__body' },
        {
            tag: 'div',
            name: 'footer',
            cls: 'q-panel__footer',
            children: [
                { tag: 'button', name: 'okBtn', cls: 'q-btn q-btn--primary' },
                { tag: 'button', name: 'cancelBtn', cls: 'q-btn' },
            ],
        },
    ],
};

const TABLE_ROW_TPL = {
    tag: 'tr',
    cls: 'q-row',
    children: Array.from({ length: 10 }, (_, i) => ({
        tag: 'td',
        name: `cell${i}`,
        cls: 'q-cell',
        children: [{ tag: 'span', name: `text${i}`, cls: 'q-cell__text' }],
    })),
};

function bench(name: string, fn: () => void, iterations: number = 10000) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) fn();
    const total = performance.now() - start;
    const perOp = total / iterations;
    console.log(`${name}: ${iterations}x → total ${total.toFixed(2)}ms, per ${perOp.toFixed(4)}ms`);
    return { total, perOp, iterations };
}

describe('compile benchmark', () => {
    it('Button tpl compile', () => {
        const r = bench('Button', () => compile(BUTTON_TPL));
        console.log(`  → 1次编译 ${r.perOp.toFixed(4)}ms, 50条池化 ${(r.perOp * 50).toFixed(2)}ms`);
        expect(r.perOp).toBeLessThan(5);
    });

    it('Complex panel tpl compile', () => {
        const r = bench('Panel', () => compile(COMPLEX_TPL));
        console.log(`  → 1次编译 ${r.perOp.toFixed(4)}ms, 50条池化 ${(r.perOp * 50).toFixed(2)}ms`);
        expect(r.perOp).toBeLessThan(5);
    });

    it('Table row tpl compile (10 cols)', () => {
        const r = bench('Row10', () => compile(TABLE_ROW_TPL));
        console.log(`  → 1次编译 ${r.perOp.toFixed(4)}ms, 50条池化 ${(r.perOp * 50).toFixed(2)}ms`);
        expect(r.perOp).toBeLessThan(5);
    });

    it('Full page simulation: 50 rows × 10 cols', () => {
        const start = performance.now();
        for (let i = 0; i < 50; i++) {
            compile(TABLE_ROW_TPL);
        }
        const total = performance.now() - start;
        console.log(`  → 50行编译 ${total.toFixed(2)}ms`);
        expect(total).toBeLessThan(500);
    });

    it('compile vs derive', () => {
        const compiled = compile(BUTTON_TPL);
        const REPLACE_TPL = {
            tag: 'div',
            cls: 'q-button q-button--dropdown',
            children: [
                { tag: 'i', name: 'icon', cls: 'q-button__icon' },
                { tag: 'span', name: 'text', cls: 'q-button__text' },
                { tag: 'i', name: 'dropIcon', cls: 'q-expand-arrow', hidden: false },
                { tag: 'div', name: 'arrow', cls: 'q-button__arrow' },
            ],
        };

        const rCompile = bench('  compile', () => compile(REPLACE_TPL), 5000);
        const rDerive = bench(
            '  derive',
            () =>
                TemplateDeriver.derive(
                    {
                        html: compiled.html,
                        indexPath: compiled.indexPath,
                        exposeNames: compiled.exposeNames,
                        i18nNodes: compiled.i18nNodes,
                        skeletonPaths: compiled.skeletonPaths,
                        templateCache: document.createElement('template'),
                    },
                    REPLACE_TPL
                ),
            5000
        );
        console.log(`  → derive/compile 比率: ${(rDerive.perOp / rCompile.perOp).toFixed(2)}x`);
    });
});
