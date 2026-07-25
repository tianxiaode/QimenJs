import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import type { DelegatedEventRule } from '@/component-core/types/tpl-events';

function makeEl(tag: string = 'div'): HTMLElement {
    return document.createElement(tag);
}

function makeInstance(overrides: Record<string, any> = {}): any {
    return {
        el: makeEl(),
        nodeMap: {} as Record<string, any>,
        containsElement(nodeName: string, target: Element): boolean {
            const node = this.nodeMap?.[nodeName];
            if (!node) return false;
            const el = node.component ? node.component.el : node.el;
            return el?.contains(target) ?? false;
        },
        emit: jest.fn(),
        bridgeEmit: jest.fn(),
        entityEmit: jest.fn(),
        routerEmit: jest.fn(),
        systemEmit: jest.fn(),
        ...overrides,
    };
}

describe('DelegatedEventEngine', () => {
    describe('compileTplEvents', () => {
        it('编译数组声明（纯声明，零绑定）', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                btn: ['click'],
                field: ['input', 'focus'],
            });
            expect(rules).toHaveLength(3);
            expect(rules[0]).toEqual({ nodeName: 'btn', event: 'click', needsBinding: false });
            expect(rules[1]).toEqual({ nodeName: 'field', event: 'input', needsBinding: false });
            expect(rules[2]).toEqual({ nodeName: 'field', event: 'focus', needsBinding: false });
        });

        it('编译对象声明（内部处理）', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                eye: { click: { handler: true } },
                field: { input: { handler: 'onInput', debounce: 300 } },
            });
            expect(rules).toHaveLength(2);
            expect(rules[0].nodeName).toBe('eye');
            expect(rules[0].event).toBe('click');
            expect(rules[0].handler).toBe('onEyeClick');
            expect(rules[0].needsBinding).toBe(true);
            expect(rules[0].debounce).toBeUndefined();

            expect(rules[1].nodeName).toBe('field');
            expect(rules[1].handler).toBe('onInput');
            expect(rules[1].needsBinding).toBe(true);
            expect(rules[1].debounce).toBe(300);
        });

        it('emits 声明', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                saveBtn: { click: { handler: true, emits: ['saveBtn'] } },
            });
            expect(rules[0].emits).toEqual(['saveBtn']);
            expect(rules[0].needsBinding).toBe(true);
        });

        it('bridges 声明', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                saveBtn: { click: { bridges: ['saveBtn'] } },
            });
            expect(rules[0].bridges).toEqual(['saveBtn']);
        });

        it('entities 声明', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                saveBtn: { click: { entities: 'saveBtn' } },
            });
            expect(rules[0].entities).toBe('saveBtn');
        });

        it('entities: true 声明', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                container: {
                    $items: {
                        Button: { click: { entities: true } },
                    },
                },
            });
            expect(rules[0].entities).toBe(true);
            expect(rules[0].itemType).toBe('Button');
            expect(rules[0].keyProp).toBe('name');
        });

        it('router: true 声明', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                nav: {
                    $items: {
                        NavItem: { click: { router: true } },
                    },
                },
            });
            expect(rules[0].router).toBe(true);
            expect(rules[0].itemType).toBe('NavItem');
            expect(rules[0].keyProp).toBe('name');
        });

        it('纯声明 + 对象混合', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                btn: ['click'],
                eye: { click: { handler: true } },
            });
            expect(rules).toHaveLength(2);
            expect(rules.find(r => r.nodeName === 'btn')!.needsBinding).toBe(false);
            expect(rules.find(r => r.nodeName === 'eye')!.needsBinding).toBe(true);
        });

        it('$items 编译：默认 keyProp=name', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                itemContainer: {
                    $items: {
                        Button: { click: { emits: ['itemClick'] } },
                        MenuItem: { click: { emits: ['select'] } },
                    },
                },
            });
            expect(rules).toHaveLength(2);
            expect(rules[0].itemType).toBe('Button');
            expect(rules[0].keyProp).toBe('name');
            expect(rules[1].itemType).toBe('MenuItem');
            expect(rules[1].keyProp).toBe('name');
        });

        it('$items 编译：显式 keyProp 覆盖默认值', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                list: {
                    $items: {
                        Icon: { click: { emits: ['actionClick'], keyProp: 'id' } },
                    },
                },
            });
            expect(rules[0].keyProp).toBe('id');
        });

        it('容器节点同时有自身事件和 $items', () => {
            const rules = DelegatedEventEngine.compileTplEvents({
                itemContainer: {
                    scroll: { handler: true },
                    $items: {
                        Button: { click: { emits: ['itemClick'] } },
                    },
                },
            });
            expect(rules).toHaveLength(2);
            const scrollRule = rules.find(r => r.event === 'scroll')!;
            expect(scrollRule.nodeName).toBe('itemContainer');
            expect(scrollRule.handler).toBe('onItemContainerScroll');
            expect(scrollRule.itemType).toBeUndefined();

            const itemRule = rules.find(r => r.itemType === 'Button')!;
            expect(itemRule.event).toBe('click');
        });
    });

    describe('handleDelegatedEvent - containsElement 匹配', () => {
        it('点击节点内元素，匹配对应规则', () => {
            const rootEl = makeEl();
            const btnEl = makeEl();
            const innerEl = makeEl();
            rootEl.appendChild(btnEl);
            btnEl.appendChild(innerEl);

            const instance = makeInstance({
                el: rootEl,
                nodeMap: { btn: { el: btnEl } },
            });

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            const domEvt = { target: innerEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.emit).toHaveBeenCalled();
        });

        it('点击不在任何节点内，不匹配', () => {
            const rootEl = makeEl();
            const otherEl = makeEl();
            rootEl.appendChild(otherEl);

            const instance = makeInstance({
                el: rootEl,
                nodeMap: { btn: { el: makeEl() } },
            });

            const rules: DelegatedEventRule[] = [
                { nodeName: 'btn', event: 'click', emits: ['btnClick'], needsBinding: true },
            ];
            const domEvt = { target: otherEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.emit).not.toHaveBeenCalled();
        });

        it('$items 规则：通过 getTargetItem 定位 item', () => {
            const rootEl = makeEl();
            const containerEl = makeEl();
            const itemEl = makeEl();
            rootEl.appendChild(containerEl);
            containerEl.appendChild(itemEl);

            const itemComponent = { id: 'icon-1', name: 'eye', el: itemEl };
            const instance = makeInstance({
                el: rootEl,
                nodeMap: {
                    actions: { component: { el: containerEl, getTargetItem: jest.fn() } },
                },
            });
            instance.nodeMap.actions.component.getTargetItem.mockReturnValue({
                component: itemComponent,
                type: 'Icon',
                index: 0,
            });

            const rules: DelegatedEventRule[] = [
                {
                    nodeName: 'actions',
                    event: 'click',
                    itemType: 'Icon',
                    keyProp: 'name',
                    emits: ['actionClick'],
                    needsBinding: true,
                },
            ];
            const domEvt = { target: itemEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.nodeMap.actions.component.getTargetItem).toHaveBeenCalledWith(itemEl);
        });

        it('$items 规则：itemType 不匹配时跳过', () => {
            const rootEl = makeEl();
            const containerEl = makeEl();
            const itemEl = makeEl();
            rootEl.appendChild(containerEl);
            containerEl.appendChild(itemEl);

            const instance = makeInstance({
                el: rootEl,
                nodeMap: {
                    actions: { component: { el: containerEl, getTargetItem: jest.fn() } },
                },
            });
            instance.nodeMap.actions.component.getTargetItem.mockReturnValue({
                component: { name: 'btn1' },
                type: 'Button',
                index: 0,
            });

            const rules: DelegatedEventRule[] = [
                {
                    nodeName: 'actions',
                    event: 'click',
                    itemType: 'Icon',
                    keyProp: 'name',
                    emits: ['actionClick'],
                    needsBinding: true,
                },
            ];
            const domEvt = { target: itemEl, type: 'click' };
            DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);

            expect(instance.emit).not.toHaveBeenCalled();
        });
    });

    describe('_dispatchRule', () => {
        it('handler 调用', () => {
            const el = makeEl();
            const handlerFn = jest.fn();
            const instance = {
                onEyeClick: handlerFn,
                nodeMap: { eye: { el } },
            };
            const rule: DelegatedEventRule = {
                nodeName: 'eye',
                event: 'click',
                handler: 'onEyeClick',
                needsBinding: true,
            };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            expect(handlerFn).toHaveBeenCalledWith(domEvt, el, {});
        });

        it('emits 转发', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                emit: (name: string, ctx: any) => emitted.push({ name, ctx }),
                eventKey: 'testKey',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                emits: ['btnClick'],
                needsBinding: true,
            };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            expect(emitted).toHaveLength(1);
            expect(emitted[0].name).toBe('btnClick');
            expect(emitted[0].ctx.domEvent).toBe(domEvt);
        });

        it('bridges 转发', () => {
            const el = makeEl();
            const bridged: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                bridgeEmit: (ctx: any) => bridged.push(ctx),
                eventKey: 'testKey',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                bridges: ['btnClick'],
                needsBinding: true,
            };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            expect(bridged).toHaveLength(1);
        });

        it('bridges 无 eventKey 时不转发', () => {
            const el = makeEl();
            const bridged: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                bridgeEmit: (ctx: any) => bridged.push(ctx),
                eventKey: undefined,
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                bridges: ['btnClick'],
                needsBinding: true,
            };
            DelegatedEventEngine._dispatchRule(instance, rule, { type: 'click', target: el });
            expect(bridged).toHaveLength(0);
        });

        it('entities 转发', () => {
            const el = makeEl();
            const entitied: any[] = [];
            const instance = {
                nodeMap: { btn: { el } },
                entityEmit: (ctx: any) => entitied.push(ctx),
                entityKey: 'testEntity',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'btn',
                event: 'click',
                entities: 'save',
                needsBinding: true,
            };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            expect(entitied).toHaveLength(1);
        });

        it('entities: true + keyProp 从 item 取名', () => {
            const el = makeEl();
            const entitied: any[] = [];
            const instance = {
                nodeMap: { actions: { component: { el } } },
                entityEmit: (ctx: any) => entitied.push(ctx),
                entityKey: 'testEntity',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'actions',
                event: 'click',
                entities: true,
                keyProp: 'name',
                needsBinding: true,
            };
            const itemInfo = { component: { name: 'save' }, type: 'Button', index: 0 };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt, itemInfo);
            expect(entitied).toHaveLength(1);
        });

        it('router: true + keyProp 从 item 取名', () => {
            const el = makeEl();
            const routed: any[] = [];
            const instance = {
                nodeMap: { nav: { component: { el } } },
                routerEmit: (ctx: any) => routed.push(ctx),
                routeKey: 'testRoute',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'nav',
                event: 'click',
                router: true,
                keyProp: 'name',
                needsBinding: true,
            };
            const itemInfo = { component: { name: 'users' }, type: 'NavItem', index: 0 };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt, itemInfo);
            expect(routed).toHaveLength(1);
        });

        it('keyProp 生成带前缀的 emit 名', () => {
            const el = makeEl();
            const emitted: any[] = [];
            const instance = {
                nodeMap: { actions: { component: { el } } },
                emit: (name: string, ctx: any) => emitted.push(name),
                eventKey: 'testKey',
            };
            const rule: DelegatedEventRule = {
                nodeName: 'actions',
                event: 'click',
                keyProp: 'name',
                emits: ['actionClick'],
                needsBinding: true,
            };
            const itemInfo = { component: { name: 'eye' }, type: 'Icon', index: 0 };
            const domEvt = { type: 'click', target: el };
            DelegatedEventEngine._dispatchRule(instance, rule, domEvt, itemInfo);
            expect(emitted).toEqual(['eyeActionClick', 'actionClick']);
        });
    });

    describe('_resolveHandlerName', () => {
        it('handler: true 自动推导', () => {
            expect(DelegatedEventEngine._resolveHandlerName('eye', 'click', true)).toBe(
                'onEyeClick'
            );
            expect(DelegatedEventEngine._resolveHandlerName('field', 'input', true)).toBe(
                'onFieldInput'
            );
        });

        it('handler: string 直接使用', () => {
            expect(DelegatedEventEngine._resolveHandlerName('eye', 'click', 'onToggle')).toBe(
                'onToggle'
            );
        });

        it('handler: undefined 返回 undefined', () => {
            expect(
                DelegatedEventEngine._resolveHandlerName('eye', 'click', undefined)
            ).toBeUndefined();
        });
    });
});
