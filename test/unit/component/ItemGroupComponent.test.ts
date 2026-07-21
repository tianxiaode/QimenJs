/**
 * ItemGroupPooledComponent 单元测试
 *
 * 覆盖：构造函数、池化(setItems)、单项操作(add/insert/removeAt)、
 *       排序(sort/move)、事件转发(eventKey)、CSS配置、dispose
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { ItemGroupPooledComponent } from '@/component/itemgroup/ItemGroupPooledComponent';
import { ComponentRegistrar, TemplateComponent } from '@qimenjs/component-core';

// 注册一个简单的测试用子组件
class MockItem extends TemplateComponent {
    type = 'MockItem';
    tag = 'div';
    label: string = '';
    order: number = 0;
    active: boolean = false;
    eventKey: string = '';

    constructor(props?: Record<string, any>) {
        super(props);
        this.initElement();
        this.el.classList.add('mock-item');
        if (props?.label) this.label = props.label;
        if (props?.order !== undefined) this.order = props.order;
        if (props?.active) this.active = props.active;
        if (props?.eventKey) this.eventKey = props.eventKey;
    }

    update(props?: Record<string, any>): void {
        if (props?.label !== undefined) this.label = props.label;
        if (props?.order !== undefined) this.order = props.order;
        if (props?.active !== undefined) this.active = props.active;
    }
}

beforeAll(() => {
    const registrar = ComponentRegistrar.getInstance();
    if (!registrar.get('MockItem')) {
        registrar.register('MockItem', MockItem);
    }
    if (!registrar.get('Icon')) {
        // 注册一个空 Icon 组件避免 Panel 测试报错
        registrar.register('Icon', MockItem);
    }
});

describe('ItemGroupPooledComponent', () => {
    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el 并添加 q-itemgroup 类', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            expect(group.el).toBeInstanceOf(HTMLElement);
            expect(group.el.classList.contains('q-itemgroup')).toBe(true);
        });

        it('type 为 ItemGroup', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            expect(group.type).toBe('ItemGroup');
        });

        it('默认横向排列', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            expect(group.direction).toBe('horizontal');
            expect(group.el.classList.contains('q-itemgroup--horizontal')).toBe(true);
        });

        it('设置纵向排列', () => {
            const group = new ItemGroupPooledComponent({
                itemType: 'MockItem',
                direction: 'vertical',
            }) as any;
            expect(group.direction).toBe('vertical');
            expect(group.el.classList.contains('q-itemgroup--vertical')).toBe(true);
        });

        it('设置 gap', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem', gap: '8px' }) as any;
            expect(group.gap).toBe('8px');
        });

        it('设置 eventKey', () => {
            const group = new ItemGroupPooledComponent({
                itemType: 'MockItem',
                eventKey: 'tabs',
            }) as any;
            expect(group.eventKey).toBe('tabs');
        });

        it('设置额外 CSS 类名', () => {
            const group = new ItemGroupPooledComponent({
                itemType: 'MockItem',
                cls: 'q-itemgroup--divider custom-class',
            }) as any;
            expect(group.el.classList.contains('q-itemgroup--divider')).toBe(true);
            expect(group.el.classList.contains('custom-class')).toBe(true);
        });

        it('通过 items 初始化子项', () => {
            const group = new ItemGroupPooledComponent({
                itemType: 'MockItem',
                items: [{ label: 'A' }, { label: 'B' }],
            }) as any;
            expect(group.count).toBe(2);
            expect(group.items[0].label).toBe('A');
            expect(group.items[1].label).toBe('B');
        });
    });

    // ============================================
    // 池化核心 — setItems
    // ============================================

    describe('setItems', () => {
        it('批量创建子项', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.setItems([{ label: 'A' }, { label: 'B' }, { label: 'C' }]);
            expect(group.count).toBe(3);
        });

        it('复用已有实例只更新属性', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.setItems([{ label: 'A' }, { label: 'B' }]);
            const firstItem = group.items[0];

            group.setItems([{ label: 'X' }, { label: 'Y' }]);

            // 复用同一实例，只更新属性
            expect(group.items[0]).toBe(firstItem);
            expect(group.items[0].label).toBe('X');
        });

        it('减少项时隐藏多余项', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.setItems([{ label: 'A' }, { label: 'B' }, { label: 'C' }]);
            group.setItems([{ label: 'X' }]);

            expect(group.count).toBe(1);
            expect(group.pool.length).toBe(3); // 池中仍有3个
            expect(group.pool[1].el.hidden).toBe(true);
            expect(group.pool[2].el.hidden).toBe(true);
        });

        it('增加项时新增', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.setItems([{ label: 'A' }]);
            group.setItems([{ label: 'A' }, { label: 'B' }, { label: 'C' }]);

            expect(group.count).toBe(3);
            expect(group.pool.length).toBe(3);
        });
    });

    // ============================================
    // 单项操作
    // ============================================

    describe('add', () => {
        it('添加子项到末尾', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            const item = group.add({ label: 'A' });
            expect(item).not.toBeNull();
            expect(group.count).toBe(1);
            expect(item.label).toBe('A');
        });

        it('itemType 未设置时返回 null', () => {
            const group = new ItemGroupPooledComponent() as any;
            const item = group.add({ label: 'A' });
            expect(item).toBeNull();
        });
    });

    describe('insert', () => {
        it('按索引插入子项', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'A' });
            group.add({ label: 'C' });
            group.insert(1, { label: 'B' });

            expect(group.count).toBe(3);
            expect(group.items[1].label).toBe('B');
        });
    });

    describe('removeAt', () => {
        it('销毁模式移除子项', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'A' });
            group.add({ label: 'B' });
            group.removeAt(0, true);

            expect(group.count).toBe(1);
            expect(group.items[0].label).toBe('B');
        });

        it('非销毁模式只隐藏保留在池中', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'A' });
            group.add({ label: 'B' });
            const removed = group.removeAt(0, false);

            expect(group.count).toBe(1);
            expect(removed.el.hidden).toBe(true);
            expect(group.pool.length).toBe(2); // 池中仍有2个
        });

        it('越界索引返回 undefined', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            expect(group.removeAt(5)).toBeUndefined();
        });
    });

    describe('updateAt', () => {
        it('按索引更新子项属性', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'A' });
            group.updateAt(0, { label: 'X' });
            expect(group.items[0].label).toBe('X');
        });
    });

    describe('clear', () => {
        it('清空所有子项', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'A' });
            group.add({ label: 'B' });
            group.clear();

            expect(group.count).toBe(0);
            expect(group.pool.length).toBe(0);
        });
    });

    describe('getAt / indexOf', () => {
        it('getAt 按索引获取子项', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'A' });
            expect(group.getAt(0).label).toBe('A');
            expect(group.getAt(5)).toBeNull();
        });

        it('indexOf 查找子项索引', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            const item = group.add({ label: 'A' });
            expect(group.indexOf(item)).toBe(0);
        });
    });

    // ============================================
    // 排序
    // ============================================

    describe('sort', () => {
        it('按 order 属性升序排序', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'C', order: 3 });
            group.add({ label: 'A', order: 1 });
            group.add({ label: 'B', order: 2 });
            group.sort();

            expect(group.items[0].label).toBe('A');
            expect(group.items[1].label).toBe('B');
            expect(group.items[2].label).toBe('C');
        });

        it('自定义排序函数', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'A' });
            group.add({ label: 'B' });
            group.sort((a: any, b: any) => b.label.localeCompare(a.label));

            expect(group.items[0].label).toBe('B');
            expect(group.items[1].label).toBe('A');
        });
    });

    describe('move', () => {
        it('移动子项到新位置', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'A' });
            group.add({ label: 'B' });
            group.add({ label: 'C' });
            group.move(0, 2);

            expect(group.items[0].label).toBe('B');
            expect(group.items[1].label).toBe('C');
            expect(group.items[2].label).toBe('A');
        });

        it('相同位置不移动', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'A' });
            group.add({ label: 'B' });
            group.move(0, 0);

            expect(group.items[0].label).toBe('A');
        });
    });

    // ============================================
    // 事件转发
    // ============================================

    describe('eventKey 事件转发', () => {
        it('创建子项时注入 eventKey', () => {
            const group = new ItemGroupPooledComponent({
                itemType: 'MockItem',
                eventKey: 'tabs',
            }) as any;
            const item = group.add({ label: 'A' });
            // eventKey 通过 props 传入构造函数，MockItem 存到 label 同级的 props
            expect(item.eventKey).toBe('tabs');
        });

        it('默认转发 click 和 close 事件', () => {
            const group = new ItemGroupPooledComponent({
                itemType: 'MockItem',
                eventKey: 'tabs',
            }) as any;
            expect(group.forwardEvents).toEqual(['click', 'close']);
        });

        it('自定义转发事件列表', () => {
            const group = new ItemGroupPooledComponent({
                itemType: 'MockItem',
                eventKey: 'custom',
                events: ['click', 'customEvent'],
            }) as any;
            expect(group.forwardEvents).toEqual(['click', 'customEvent']);
        });

        it('无 eventKey 时不注入到子组件', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            const item = group.add({ label: 'A' });
            expect(item.props.eventKey).toBeUndefined();
        });

        it('removeAt 时解绑事件', () => {
            const group = new ItemGroupPooledComponent({
                itemType: 'MockItem',
                eventKey: 'tabs',
            }) as any;
            group.add({ label: 'A' });
            group.add({ label: 'B' });
            // 销毁移除不应报错
            expect(() => group.removeAt(0, true)).not.toThrow();
            expect(group.count).toBe(1);
        });
    });

    // ============================================
    // 属性 setter
    // ============================================

    describe('属性 setter', () => {
        it('direction setter 切换方向', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.direction = 'vertical';
            expect(group.direction).toBe('vertical');
            expect(group.el.classList.contains('q-itemgroup--vertical')).toBe(true);
        });

        it('gap setter 更新间距', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.gap = '12px';
            expect(group.gap).toBe('12px');
        });

        it('eventKey setter 更新事件标识', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.eventKey = 'newKey';
            expect(group.eventKey).toBe('newKey');
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            const el = group.el;
            group.dispose();
            expect(document.contains(el)).toBe(false);
        });

        it('dispose 清空所有子项', () => {
            const group = new ItemGroupPooledComponent({ itemType: 'MockItem' }) as any;
            group.add({ label: 'A' });
            group.add({ label: 'B' });
            group.dispose();
            expect(group.pool.length).toBe(0);
            expect(group.count).toBe(0);
        });
    });
});
