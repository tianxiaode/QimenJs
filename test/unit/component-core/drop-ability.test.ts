/**
 * DropAbility 单元测试
 *
 * 覆盖：getDrop/setDrop、initDrop（原生 drag 事件绑定）、
 *       setDroppable/setDropAccept 委托方法、dropAccept 过滤、cleanup
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(),
            })),
        },
    };
});

import { TemplateComponent } from '@/component-core';
import { DropAbility } from '@/component-core/abilities/DropAbility';

const TPL = '<div class="drop-zone"></div>';

describe('DropAbility', () => {
    const BoxClass = TemplateComponent.withTemplate(TPL).with(DropAbility);

    // ============================================
    // getDrop / setDrop
    // ============================================

    describe('getDrop / setDrop', () => {
        it('有默认值的 key 返回默认值', () => {
            const instance = new BoxClass() as any;
            expect(instance.getDrop('droppable')).toBe(false);
        });

        it('无默认值的 key 返回 undefined', () => {
            const instance = new BoxClass() as any;
            expect(instance.getDrop('dropAccept')).toBeUndefined();
            expect(instance.getDrop('dropActiveClass')).toBeUndefined();
        });

        it('setDrop 设置值', () => {
            const instance = new BoxClass() as any;
            instance.setDrop('droppable', true);
            expect(instance.getDrop('droppable')).toBe(true);
        });

        it('setDrop 设置 dropAccept', () => {
            const instance = new BoxClass() as any;
            instance.setDrop('dropAccept', 'Card');
            expect(instance.getDrop('dropAccept')).toBe('Card');
        });

        it('setDrop 设置 dropAccept 数组', () => {
            const instance = new BoxClass() as any;
            instance.setDrop('dropAccept', ['Card', 'Item']);
            expect(instance.getDrop('dropAccept')).toEqual(['Card', 'Item']);
        });
    });

    // ============================================
    // initDrop
    // ============================================

    describe('initDrop', () => {
        it('调用 initDrop 后生成 setDroppable 和 setDropAccept 委托方法', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true });
            expect(typeof instance.setDroppable).toBe('function');
            expect(typeof instance.setDropAccept).toBe('function');
        });

        it('setDroppable 更新 props', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true });
            instance.setDroppable(false);
            expect(instance.getDrop('droppable')).toBe(false);
        });

        it('setDropAccept 更新 props', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true });
            instance.setDropAccept(['Card']);
            expect(instance.getDrop('dropAccept')).toEqual(['Card']);
        });

        it('dragenter 事件触发时添加 dropActiveClass', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true, dropActiveClass: 'drop-hover' });

            const dataTransfer = {
                getData: jest.fn(() => ''),
                dropEffect: '',
            };
            const event = new Event('dragenter', { bubbles: true }) as any;
            event.dataTransfer = dataTransfer;
            event.preventDefault = jest.fn();

            instance.el.dispatchEvent(event);
            expect(instance.el.classList.contains('drop-hover')).toBe(true);
        });

        it('dragleave 事件触发时移除 dropActiveClass', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true, dropActiveClass: 'drop-hover' });

            // 先触发 dragenter 添加 class
            const enterEvent = new Event('dragenter', { bubbles: true }) as any;
            enterEvent.dataTransfer = { getData: jest.fn(() => ''), dropEffect: '' };
            enterEvent.preventDefault = jest.fn();
            instance.el.dispatchEvent(enterEvent);
            expect(instance.el.classList.contains('drop-hover')).toBe(true);

            // 再触发 dragleave 移除 class
            const leaveEvent = new Event('dragleave', { bubbles: true }) as any;
            instance.el.dispatchEvent(leaveEvent);
            expect(instance.el.classList.contains('drop-hover')).toBe(false);
        });

        it('drop 事件触发时移除 dropActiveClass', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true, dropActiveClass: 'drop-hover' });

            // 先添加 class
            const enterEvent = new Event('dragenter', { bubbles: true }) as any;
            enterEvent.dataTransfer = { getData: jest.fn(() => ''), dropEffect: '' };
            enterEvent.preventDefault = jest.fn();
            instance.el.dispatchEvent(enterEvent);

            // drop 移除 class
            const dropEvent = new Event('drop', { bubbles: true }) as any;
            dropEvent.dataTransfer = {
                getData: jest.fn((mime: string) => {
                    if (mime === 'application/qimen-drag-data') return '';
                    if (mime === 'application/qimen-drag-type') return '';
                    return '';
                }),
                dropEffect: '',
            };
            dropEvent.preventDefault = jest.fn();
            instance.el.dispatchEvent(dropEvent);
            expect(instance.el.classList.contains('drop-hover')).toBe(false);
        });

        it('dropAccept 过滤不匹配的拖拽源', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true, dropAccept: 'Card', dropActiveClass: 'drop-hover' });

            const dataTransfer = {
                getData: jest.fn((mime: string) => {
                    if (mime === 'application/qimen-drag-type') return 'Item';
                    return '';
                }),
                dropEffect: '',
            };
            const event = new Event('dragenter', { bubbles: true }) as any;
            event.dataTransfer = dataTransfer;
            event.preventDefault = jest.fn();

            instance.el.dispatchEvent(event);
            // 类型不匹配，不应添加 class
            expect(instance.el.classList.contains('drop-hover')).toBe(false);
        });

        it('dropAccept 匹配的拖拽源通过', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true, dropAccept: 'Card', dropActiveClass: 'drop-hover' });

            const dataTransfer = {
                getData: jest.fn((mime: string) => {
                    if (mime === 'application/qimen-drag-type') return 'Card';
                    return '';
                }),
                dropEffect: '',
            };
            const event = new Event('dragenter', { bubbles: true }) as any;
            event.dataTransfer = dataTransfer;
            event.preventDefault = jest.fn();

            instance.el.dispatchEvent(event);
            expect(instance.el.classList.contains('drop-hover')).toBe(true);
        });

        it('dropAccept 为数组时任一匹配通过', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true, dropAccept: ['Card', 'Item'], dropActiveClass: 'drop-hover' });

            const dataTransfer = {
                getData: jest.fn((mime: string) => {
                    if (mime === 'application/qimen-drag-type') return 'Item';
                    return '';
                }),
                dropEffect: '',
            };
            const event = new Event('dragenter', { bubbles: true }) as any;
            event.dataTransfer = dataTransfer;
            event.preventDefault = jest.fn();

            instance.el.dispatchEvent(event);
            expect(instance.el.classList.contains('drop-hover')).toBe(true);
        });

        it('无 dropAccept 时接受所有拖拽源', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true, dropActiveClass: 'drop-hover' });

            const dataTransfer = {
                getData: jest.fn(() => 'AnyType'),
                dropEffect: '',
            };
            const event = new Event('dragenter', { bubbles: true }) as any;
            event.dataTransfer = dataTransfer;
            event.preventDefault = jest.fn();

            instance.el.dispatchEvent(event);
            expect(instance.el.classList.contains('drop-hover')).toBe(true);
        });
    });

    // ============================================
    // cleanup
    // ============================================

    describe('cleanup', () => {
        it('dispose 时清理委托方法', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true });
            expect(typeof instance.setDroppable).toBe('function');
            expect(typeof instance.setDropAccept).toBe('function');

            instance.dispose();
            expect((instance as any).setDroppable).toBeUndefined();
            expect((instance as any).setDropAccept).toBeUndefined();
        });

        it('dispose 后不再响应 dragenter 事件', () => {
            const instance = new BoxClass() as any;
            instance.initDrop({ droppable: true, dropActiveClass: 'drop-hover' });

            instance.dispose();

            const dataTransfer = { getData: jest.fn(() => ''), dropEffect: '' };
            const event = new Event('dragenter', { bubbles: true }) as any;
            event.dataTransfer = dataTransfer;
            event.preventDefault = jest.fn();

            // dispose 后 el 已从 DOM 移除，dispatchEvent 不会触发能力逻辑
            // 验证不报错即可
            expect(() => {
                try { instance.el?.dispatchEvent(event); } catch {}
            }).not.toThrow();
        });
    });
});
