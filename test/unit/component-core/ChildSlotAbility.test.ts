/**
 * ChildSlotAbility 单元测试
 *
 * 覆盖：_replaceChildComponent 的替换逻辑
 * - 节点未找到时返回 null
 * - replace 模式替换
 * - child 模式替换
 * - fallback 替换
 * - 旧组件销毁
 * - nodeMap 更新
 */

import { ChildSlotAbility } from '@/component-abilities/render/ChildSlotAbility';
import type { NodeMetadata } from '@/component-core/types';

describe('ChildSlotAbility', () => {
    describe('_replaceChildComponent', () => {
        it('节点未找到时返回 null', () => {
            const host: any = {
                nodeMap: { group: {} },
            };
            Object.assign(host, ChildSlotAbility);
            const result = host._replaceChildComponent('notExist', class {});
            expect(result).toBeNull();
        });

        it('replace 模式：利用 parentNode + nodeIndex 在原位插入', () => {
            const parentEl = document.createElement('div');
            const oldEl = document.createElement('span');
            oldEl.textContent = 'old';
            parentEl.appendChild(oldEl);

            const node: NodeMetadata = {
                el: oldEl,
                raw: 'slot:body',
                group: 'slot',
                name: 'body',
                parentNode: parentEl,
                nodeIndex: 0,
                jsonMode: 'replace',
            };

            class NewComp {
                el = document.createElement('div');
                parent: any;
                dispose() {}
            }

            const host: any = {
                nodeMap: { slot: { body: node } },
            };
            Object.assign(host, ChildSlotAbility);

            const result = host._replaceChildComponent('body', NewComp);

            expect(result).toBeInstanceOf(NewComp);
            expect(result.parent).toBe(host);
            expect(parentEl.contains(result.el)).toBe(true);
            expect(node.el).toBe(result.el);
            expect(node.component).toBe(result);
            expect(node.componentClass).toBe(NewComp);
        });

        it('child 模式：清空占位节点内容，挂载新组件', () => {
            const container = document.createElement('div');
            const placeholder = document.createElement('div');
            container.appendChild(placeholder);

            const node: NodeMetadata = {
                el: placeholder,
                raw: 'slot:body',
                group: 'slot',
                name: 'body',
                parentNode: null,
                jsonMode: 'child',
            };

            class NewComp {
                el = document.createElement('span');
                parent: any;
                dispose() {}
            }

            const host: any = {
                nodeMap: { slot: { body: node } },
            };
            Object.assign(host, ChildSlotAbility);

            const result = host._replaceChildComponent('body', NewComp);

            expect(result).toBeInstanceOf(NewComp);
            expect(result.parent).toBe(host);
            expect(container.contains(result.el)).toBe(true);
        });

        it('fallback：直接替换当前 el', () => {
            const parentEl = document.createElement('div');
            const oldEl = document.createElement('span');
            parentEl.appendChild(oldEl);

            const node: NodeMetadata = {
                el: oldEl,
                raw: 'slot:body',
                group: 'slot',
                name: 'body',
                jsonMode: undefined,
            };

            class NewComp {
                el = document.createElement('div');
                parent: any;
                dispose() {}
            }

            const host: any = {
                nodeMap: { slot: { body: node } },
            };
            Object.assign(host, ChildSlotAbility);

            const result = host._replaceChildComponent('body', NewComp);

            expect(result).toBeInstanceOf(NewComp);
            // replaceWith 会替换旧元素
            expect(parentEl.contains(result.el)).toBe(true);
        });

        it('销毁旧组件', () => {
            const disposeFn = jest.fn();
            const oldComponent = { dispose: disposeFn };
            const oldEl = document.createElement('span');

            const node: NodeMetadata = {
                el: oldEl,
                raw: 'slot:body',
                group: 'slot',
                name: 'body',
                component: oldComponent,
                parentNode: document.createElement('div'),
                nodeIndex: 0,
            };
            (node as any).parentNode.appendChild(oldEl);

            class NewComp {
                el = document.createElement('div');
                parent: any;
                dispose() {}
            }

            const host: any = {
                nodeMap: { slot: { body: node } },
            };
            Object.assign(host, ChildSlotAbility);

            host._replaceChildComponent('body', NewComp);

            expect(disposeFn).toHaveBeenCalled();
        });

        it('更新 nodeMap 中的 el、component、componentClass', () => {
            const parentEl = document.createElement('div');
            const oldEl = document.createElement('span');
            parentEl.appendChild(oldEl);

            const node: NodeMetadata = {
                el: oldEl,
                raw: 'slot:body',
                group: 'slot',
                name: 'body',
                parentNode: parentEl,
                nodeIndex: 0,
            };

            class NewComp {
                el = document.createElement('div');
                parent: any;
                dispose() {}
            }

            const host: any = {
                nodeMap: { slot: { body: node } },
            };
            Object.assign(host, ChildSlotAbility);

            const result = host._replaceChildComponent('body', NewComp);

            expect(node.el).toBe(result.el);
            expect(node.component).toBe(result);
            expect(node.componentClass).toBe(NewComp);
        });

        it('传入 props 给新组件', () => {
            const parentEl = document.createElement('div');
            const oldEl = document.createElement('span');
            parentEl.appendChild(oldEl);

            const node: NodeMetadata = {
                el: oldEl,
                raw: 'slot:body',
                group: 'slot',
                name: 'body',
                parentNode: parentEl,
                nodeIndex: 0,
            };

            let receivedProps: any;
            class NewComp {
                el = document.createElement('div');
                parent: any;
                constructor(props?: any) { receivedProps = props; }
                dispose() {}
            }

            const host: any = {
                nodeMap: { slot: { body: node } },
            };
            Object.assign(host, ChildSlotAbility);

            host._replaceChildComponent('body', NewComp, { title: 'test' });

            expect(receivedProps).toEqual({ title: 'test' });
        });
    });
});
