import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { BenchTableA } from './ComponentMode';
import { BenchTableB } from './TdMode';
import type { BenchColumnDef } from './ComponentMode';
import './benchmark.css';

const ROW_COUNT = 50;
const COL_WIDTH = 100;

function generateColumns(colCount: number): BenchColumnDef[] {
    const cols: BenchColumnDef[] = [];
    for (let j = 0; j < colCount; j++) {
        cols.push({ field: `col${j}`, title: `Column ${j}`, width: COL_WIDTH });
    }
    return cols;
}

function generateData(colCount: number): Record<string, any>[] {
    const data: Record<string, any>[] = [];
    for (let i = 0; i < ROW_COUNT; i++) {
        const row: Record<string, any> = {};
        for (let j = 0; j < colCount; j++) {
            row[`col${j}`] = `R${i}C${j}`;
        }
        data.push(row);
    }
    return data;
}

class BenchmarkPage extends Component {
    static type = 'benchmark-page';

    _tableA: BenchTableA | null = null;
    _tableB: BenchTableB | null = null;
    _currentCols: number = 10;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            classes: 'bench-page',
            children: [
                { tag: 'h1', name: 'title', classes: 'bench-page__title', options: { text: 'Table Performance Benchmark' } },
                { tag: 'p', name: 'desc', classes: 'bench-page__desc', options: { text: 'Component mode (div+flex) vs TD mode (table+tr+td)' } },
                {
                    tag: 'div',
                    name: 'controls',
                    classes: 'bench-controls',
                    children: [
                        { tag: 'span', classes: 'bench-controls__label', options: { text: 'Cols:' } },
                        {
                            tag: 'select',
                            name: 'colSelect',
                            classes: 'bench-controls__select',
                            children: [
                                { tag: 'option', attributes: { value: '5' }, options: { text: '5' } },
                                { tag: 'option', attributes: { value: '10', selected: 'selected' }, options: { text: '10' } },
                                { tag: 'option', attributes: { value: '20' }, options: { text: '20' } },
                                { tag: 'option', attributes: { value: '50' }, options: { text: '50' } },
                                { tag: 'option', attributes: { value: '100' }, options: { text: '100' } },
                            ],
                        },
                        { tag: 'button', name: 'runBtn', classes: 'bench-controls__btn', options: { text: 'Run Benchmark' } },
                        { tag: 'button', name: 'hideBtn', classes: 'bench-controls__btn', options: { text: 'Hide Col 3' } },
                        { tag: 'button', name: 'showBtn', classes: 'bench-controls__btn', options: { text: 'Show Col 3' } },
                        { tag: 'button', name: 'moveBtn', classes: 'bench-controls__btn', options: { text: '0->5' } },
                        { tag: 'button', name: 'clearBtn', classes: 'bench-controls__btn bench-controls__btn--danger', options: { text: 'Clear' } },
                    ],
                },
                {
                    tag: 'div',
                    name: 'results',
                    classes: 'bench-results',
                    children: [
                        {
                            tag: 'div',
                            name: 'resultCardA',
                            classes: 'bench-result-card',
                            children: [
                                { tag: 'div', classes: 'bench-result-card__title bench-result-card__title--a', options: { text: 'Mode A: Component (div+flex)' } },
                                { tag: 'div', classes: 'bench-result-row', children: [
                                    { tag: 'span', classes: 'bench-result-row__label', options: { text: 'Render:' } },
                                    { tag: 'span', name: 'renderA', classes: 'bench-result-row__value', options: { text: '-' } },
                                ]},
                                { tag: 'div', classes: 'bench-result-row', children: [
                                    { tag: 'span', classes: 'bench-result-row__label', options: { text: 'Hide Col:' } },
                                    { tag: 'span', name: 'hideA', classes: 'bench-result-row__value', options: { text: '-' } },
                                ]},
                                { tag: 'div', classes: 'bench-result-row', children: [
                                    { tag: 'span', classes: 'bench-result-row__label', options: { text: 'Show Col:' } },
                                    { tag: 'span', name: 'showA', classes: 'bench-result-row__value', options: { text: '-' } },
                                ]},
                                { tag: 'div', classes: 'bench-result-row', children: [
                                    { tag: 'span', classes: 'bench-result-row__label', options: { text: 'Move Col:' } },
                                    { tag: 'span', name: 'moveA', classes: 'bench-result-row__value', options: { text: '-' } },
                                ]},
                                { tag: 'div', classes: 'bench-result-row', children: [
                                    { tag: 'span', classes: 'bench-result-row__label', options: { text: 'Clear:' } },
                                    { tag: 'span', name: 'clearA', classes: 'bench-result-row__value', options: { text: '-' } },
                                ]},
                            ],
                        },
                        {
                            tag: 'div',
                            name: 'resultCardB',
                            classes: 'bench-result-card',
                            children: [
                                { tag: 'div', classes: 'bench-result-card__title bench-result-card__title--b', options: { text: 'Mode B: TD (table+tr+td)' } },
                                { tag: 'div', classes: 'bench-result-row', children: [
                                    { tag: 'span', classes: 'bench-result-row__label', options: { text: 'Render:' } },
                                    { tag: 'span', name: 'renderB', classes: 'bench-result-row__value', options: { text: '-' } },
                                ]},
                                { tag: 'div', classes: 'bench-result-row', children: [
                                    { tag: 'span', classes: 'bench-result-row__label', options: { text: 'Hide Col:' } },
                                    { tag: 'span', name: 'hideB', classes: 'bench-result-row__value', options: { text: '-' } },
                                ]},
                                { tag: 'div', classes: 'bench-result-row', children: [
                                    { tag: 'span', classes: 'bench-result-row__label', options: { text: 'Show Col:' } },
                                    { tag: 'span', name: 'showB', classes: 'bench-result-row__value', options: { text: '-' } },
                                ]},
                                { tag: 'div', classes: 'bench-result-row', children: [
                                    { tag: 'span', classes: 'bench-result-row__label', options: { text: 'Move Col:' } },
                                    { tag: 'span', name: 'moveB', classes: 'bench-result-row__value', options: { text: '-' } },
                                ]},
                                { tag: 'div', classes: 'bench-result-row', children: [
                                    { tag: 'span', classes: 'bench-result-row__label', options: { text: 'Clear:' } },
                                    { tag: 'span', name: 'clearB', classes: 'bench-result-row__value', options: { text: '-' } },
                                ]},
                            ],
                        },
                    ],
                },
                {
                    tag: 'div',
                    name: 'tables',
                    classes: 'bench-tables',
                    children: [
                        {
                            tag: 'div',
                            name: 'wrapperA',
                            classes: 'bench-table-wrapper',
                            children: [
                                { tag: 'div', classes: 'bench-table-wrapper__header bench-table-wrapper__header--a', options: { text: 'Mode A: Component' } },
                                { tag: 'div', name: 'bodyA', classes: 'bench-table-wrapper__body' },
                            ],
                        },
                        {
                            tag: 'div',
                            name: 'wrapperB',
                            classes: 'bench-table-wrapper',
                            children: [
                                { tag: 'div', classes: 'bench-table-wrapper__header bench-table-wrapper__header--b', options: { text: 'Mode B: TD' } },
                                { tag: 'div', name: 'bodyB', classes: 'bench-table-wrapper__body' },
                            ],
                        },
                    ],
                },
            ],
        };
    }

    domEvents = {
        click: [
            { path: 'runBtn', handler: '_onRunClick' },
            { path: 'hideBtn', handler: '_onHideClick' },
            { path: 'showBtn', handler: '_onShowClick' },
            { path: 'moveBtn', handler: '_onMoveClick' },
            { path: 'clearBtn', handler: '_onClearClick' },
        ],
    };

    onMounted(): void {
        const select = this.getNodeEl('colSelect') as HTMLSelectElement | null;
        if (select) {
            this._currentCols = parseInt(select.value, 10) || 10;
        }
        this._runBenchmark();
    }

    _onRunClick(): void {
        this._runBenchmark();
    }

    _onHideClick(): void {
        if (!this._tableA || !this._tableB) return;
        const t0 = performance.now();
        this._tableA.hideColumn(3);
        const t1 = performance.now();
        this._tableB.hideColumn(3);
        const t2 = performance.now();
        this._setResult('hideA', `${(t1 - t0).toFixed(2)}ms`);
        this._setResult('hideB', `${(t2 - t1).toFixed(2)}ms`);
    }

    _onShowClick(): void {
        if (!this._tableA || !this._tableB) return;
        const t0 = performance.now();
        this._tableA.showColumn(3);
        const t1 = performance.now();
        this._tableB.showColumn(3);
        const t2 = performance.now();
        this._setResult('showA', `${(t1 - t0).toFixed(2)}ms`);
        this._setResult('showB', `${(t2 - t1).toFixed(2)}ms`);
    }

    _onMoveClick(): void {
        if (!this._tableA || !this._tableB) return;
        const t0 = performance.now();
        this._tableA.moveColumn(0, 5);
        const t1 = performance.now();
        this._tableB.moveColumn(0, 5);
        const t2 = performance.now();
        this._setResult('moveA', `${(t1 - t0).toFixed(2)}ms`);
        this._setResult('moveB', `${(t2 - t1).toFixed(2)}ms`);
    }

    _onClearClick(): void {
        if (!this._tableA || !this._tableB) return;
        const t0 = performance.now();
        this._tableA.clear();
        const t1 = performance.now();
        this._tableB.clear();
        const t2 = performance.now();
        this._setResult('clearA', `${(t1 - t0).toFixed(2)}ms`);
        this._setResult('clearB', `${(t2 - t1).toFixed(2)}ms`);
    }

    _runBenchmark(): void {
        const cols = this._currentCols;
        const columns = generateColumns(cols);
        const data = generateData(cols);

        const bodyA = this.getNodeEl('bodyA');
        const bodyB = this.getNodeEl('bodyB');
        if (!bodyA || !bodyB) return;

        if (this._tableA) {
            this._tableA.dispose();
            this._tableA = null;
        }
        if (this._tableB) {
            this._tableB.dispose();
            this._tableB = null;
        }
        bodyA.innerHTML = '';
        bodyB.innerHTML = '';

        this._setResult('renderA', 'running...');
        this._setResult('renderB', 'running...');

        const t0 = performance.now();
        this._tableA = new BenchTableA({ columns, benchData: data });
        bodyA.appendChild(this._tableA.el);
        this._tableA.ready.then(() => {
            const t1 = performance.now();
            this._setResult('renderA', `${(t1 - t0).toFixed(2)}ms (${ROW_COUNT}r×${cols}c)`);

            const t2 = performance.now();
            this._tableB = new BenchTableB({ columns, benchData: data });
            bodyB.appendChild(this._tableB.el);
            this._tableB.ready.then(() => {
                const t3 = performance.now();
                this._setResult('renderB', `${(t3 - t2).toFixed(2)}ms (${ROW_COUNT}r×${cols}c)`);
                this._setResult('hideA', '-');
                this._setResult('hideB', '-');
                this._setResult('showA', '-');
                this._setResult('showB', '-');
                this._setResult('moveA', '-');
                this._setResult('moveB', '-');
                this._setResult('clearA', '-');
                this._setResult('clearB', '-');
            });
        });
    }

    _setResult(name: string, value: string): void {
        const el = this.getNodeEl(name);
        if (el) el.textContent = value;
    }
}

BenchmarkPage.register();

export { BenchmarkPage };
