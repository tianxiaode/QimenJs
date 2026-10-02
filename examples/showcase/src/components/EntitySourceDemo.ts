import { Component, type TemplateDecl, type DomEventsMap } from '@qimenjs/component-core';
import { TableComponent, NavComponent, TagComponent } from '@qimenjs/component';
import type { ColumnDefOrGroup } from '@qimenjs/component';
import '@/component/table/row/row.css';
import '@/component/table/header/header.css';
import type { DemoConfig } from './types';

const ENTITY_KEY = 'demo-entity-source';

const DEPT_DATA = [
    { value: 'tech', label: '技术部', text: '技术部' },
    { value: 'market', label: '市场部', text: '市场部' },
    { value: 'manage', label: '管理层', text: '管理层' },
    { value: 'sales', label: '销售部', text: '销售部' },
];

const ROLE_DATA = [
    { value: 'dev', label: '开发工程师', text: '开发工程师' },
    { value: 'pm', label: '产品经理', text: '产品经理' },
    { value: 'designer', label: '设计师', text: '设计师' },
    { value: 'qa', label: '测试工程师', text: '测试工程师' },
    { value: 'ops', label: '运维工程师', text: '运维工程师' },
];

const TABLE_COLUMNS: ColumnDefOrGroup[] = [
    { name: 'value', field: 'value', title: '编码', width: 100 },
    { name: 'label', field: 'label', title: '名称', width: 150 },
];

class EntitySourceInteractiveDemo extends Component {
    static type = 'entity-source-interactive-demo';

    _table: TableComponent | null = null;
    _nav: NavComponent | null = null;
    _tag: TagComponent | null = null;
    _currentDataset: 'dept' | 'role' = 'dept';
    _currentData: any[] = DEPT_DATA;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-entity-demo',
            children: [
                {
                    tag: 'div',
                    classes: 'q-entity-demo__hint',
                    options: {
                        text: '下方三个组件（Table、Nav、Tag）共享同一个 entityKey，数据由 EntityManager 统一管理。点击按钮切换数据源，所有组件自动更新。',
                    },
                },
                {
                    tag: 'div',
                    classes: 'q-entity-demo__controls',
                    children: [
                        {
                            tag: 'button',
                            name: 'switchBtn',
                            classes: 'q-entity-demo__btn',
                            options: { text: '切换数据源' },
                        },
                        {
                            tag: 'button',
                            name: 'addBtn',
                            classes: 'q-entity-demo__btn',
                            options: { text: '添加新项' },
                        },
                    ],
                },
                {
                    tag: 'div',
                    classes: 'q-entity-demo__status',
                    name: 'status',
                    options: { text: '当前数据源: 部门列表 (4 项)' },
                },
                {
                    tag: 'div',
                    classes: 'q-entity-demo__section',
                    children: [
                        {
                            tag: 'h4',
                            classes: 'q-entity-demo__section-title',
                            options: { text: 'Table（携带 data，作为数据源）' },
                        },
                        { tag: 'div', name: 'tableContainer', classes: 'q-entity-demo__table' },
                    ],
                },
                {
                    tag: 'div',
                    classes: 'q-entity-demo__section',
                    children: [
                        {
                            tag: 'h4',
                            classes: 'q-entity-demo__section-title',
                            options: { text: 'Nav（仅 entityKey，从共享 EntityManager 获取数据）' },
                        },
                        { tag: 'div', name: 'navContainer', classes: 'q-entity-demo__nav' },
                    ],
                },
                {
                    tag: 'div',
                    classes: 'q-entity-demo__section',
                    children: [
                        {
                            tag: 'h4',
                            classes: 'q-entity-demo__section-title',
                            options: { text: 'Tag（仅 entityKey，从共享 EntityManager 获取数据）' },
                        },
                        { tag: 'div', name: 'tagContainer', classes: 'q-entity-demo__tag' },
                    ],
                },
            ],
        };
    }

    domEvents: DomEventsMap = {
        click: [
            { path: 'switchBtn', handler: '_onSwitchClick' },
            { path: 'addBtn', handler: '_onAddClick' },
        ],
    };

    onAfterInit(): void {
        this._createComponents();
    }

    _createComponents(): void {
        const tableContainer = this.getNodeEl('tableContainer') as HTMLElement;
        const navContainer = this.getNodeEl('navContainer') as HTMLElement;
        const tagContainer = this.getNodeEl('tagContainer') as HTMLElement;

        if (tableContainer) {
            this._table = new TableComponent({
                columns: TABLE_COLUMNS,
                entityKey: ENTITY_KEY,
                entityType: 'dictionary_manager',
                data: this._currentData,
            });
            tableContainer.appendChild(this._table.el);
        }

        if (navContainer) {
            this._nav = new NavComponent({
                entityKey: ENTITY_KEY,
                entityType: 'dictionary_manager',
            });
            navContainer.appendChild(this._nav.el);
        }

        if (tagContainer) {
            this._tag = new TagComponent({
                entityKey: ENTITY_KEY,
                entityType: 'dictionary_manager',
            });
            tagContainer.appendChild(this._tag.el);
        }
    }

    _onSwitchClick(): void {
        this._currentDataset = this._currentDataset === 'dept' ? 'role' : 'dept';
        this._currentData = this._currentDataset === 'dept' ? [...DEPT_DATA] : [...ROLE_DATA];
        this._reloadData();
        this._updateStatus();
    }

    _onAddClick(): void {
        const newItem =
            this._currentDataset === 'dept'
                ? { value: `dept_${Date.now()}`, label: '新部门', text: '新部门' }
                : { value: `role_${Date.now()}`, label: '新角色', text: '新角色' };
        this._currentData = [...this._currentData, newItem];
        this._reloadData();
        this._updateStatus();
    }

    _reloadData(): void {
        this.entityEmit('load_dictionary', this._currentData, { source: ENTITY_KEY });
    }

    _updateStatus(): void {
        const statusEl = this.getNodeEl('status');
        if (statusEl) {
            const name = this._currentDataset === 'dept' ? '部门列表' : '角色列表';
            statusEl.textContent = `当前数据源: ${name} (${this._currentData.length} 项)`;
        }
    }

    onDestroy(): void {
        this._table?.dispose();
        this._nav?.dispose();
        this._tag?.dispose();
        this._table = null;
        this._nav = null;
        this._tag = null;
    }
}

export const ENTITY_SOURCE_DEMO: DemoConfig = {
    title: '数据来源 (EntitySource)',
    description:
        '通过 entityKey 连接 EntityManager，多个组件共享同一数据源 — 数据变更自动同步到所有连接的组件',
    sections: [
        {
            label: '数据来源概念',
            code: `组件设置 entityKey + entityType → 连接 EntityManager
EntityManager 统一管理数据（加载、过滤、排序）
LISTED 事件广播 → 所有连接的组件自动更新

数据流：
  Component.entityEmit(CONNECT)
    → DataDispatchCenter 创建/复用 Manager
    → Component.entityEmit(LOAD_DICTIONARY, data)
    → Manager.loadDictionary(data) → refreshView()
    → Manager.entityEmit(LISTED, items)
    → 所有订阅 LISTED 的组件收到数据 → 自动渲染`,
            template: {
                tag: 'div',
                classes: 'q-entity-demo__concept',
                children: [
                    {
                        tag: 'div',
                        classes: 'q-entity-demo__concept-item',
                        children: [
                            { tag: 'h4', options: { text: '1. 组件连接' } },
                            {
                                tag: 'p',
                                options: {
                                    text: '组件通过 entityKey + entityType 连接 EntityManager。DataDispatchCenter 按 entityKey 创建或复用 Manager 实例（引用计数管理）。',
                                },
                            },
                        ],
                    },
                    {
                        tag: 'div',
                        classes: 'q-entity-demo__concept-item',
                        children: [
                            { tag: 'h4', options: { text: '2. 数据加载' } },
                            {
                                tag: 'p',
                                options: {
                                    text: '携带 data 的组件通过 LOAD_DICTIONARY 事件将数据加载到 Manager。其他组件只需 entityKey，从共享 Manager 获取数据。',
                                },
                            },
                        ],
                    },
                    {
                        tag: 'div',
                        classes: 'q-entity-demo__concept-item',
                        children: [
                            { tag: 'h4', options: { text: '3. 自动同步' } },
                            {
                                tag: 'p',
                                options: {
                                    text: 'Manager 数据变更后发射 LISTED 事件，所有订阅的组件自动收到更新并重新渲染。切换数据源只需一次 entityEmit，所有组件同步更新。',
                                },
                            },
                        ],
                    },
                ],
            },
        },
        {
            label: '多组件共享数据源',
            code: `// Table — 携带 data，作为数据源
new TableComponent({
    columns,
    entityKey: 'demo-entity-source',
    entityType: 'dictionary_manager',
    data: DEPT_DATA,
})

// Nav — 仅 entityKey，从共享 Manager 获取数据
new NavComponent({
    entityKey: 'demo-entity-source',
    entityType: 'dictionary_manager',
})

// Tag — 仅 entityKey，从共享 Manager 获取数据
new TagComponent({
    entityKey: 'demo-entity-source',
    entityType: 'dictionary_manager',
})

// 切换数据源 — 一次 emit，所有组件同步更新
this.entityEmit('load_dictionary', newData, { source: 'demo-entity-source' })`,
            component: EntitySourceInteractiveDemo,
        },
    ],
};
