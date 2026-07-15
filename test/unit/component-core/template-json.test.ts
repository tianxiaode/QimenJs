/**
 * template-json.ts 单元测试
 *
 * 覆盖：jsonTemplateToHtml、convertTemplate、JsonTemplateNode/TplNode → HTML 转换、componentMap 提取
 */

import { jsonTemplateToHtml, convertTemplate } from '@/component-core/template-json';
import type { JsonTemplateNode, TplNodeMeta } from '@/component-core/template-json';
import type { ComponentTemplate } from '@/component-core/template-types';

describe('jsonTemplateToHtml', () => {
    describe('基础转换', () => {
        it('空数组返回空字符串和空 componentMap', () => {
            const result = jsonTemplateToHtml([]);
            expect(result.html).toBe('');
            expect(result.componentMap).toEqual({});
        });

        it('单个 div 节点', () => {
            const result = jsonTemplateToHtml([{ tag: 'div' }]);
            expect(result.html).toBe('<div></div>');
        });

        it('默认标签为 div', () => {
            const result = jsonTemplateToHtml([{}]);
            expect(result.html).toBe('<div></div>');
        });

        it('自闭合标签', () => {
            const result = jsonTemplateToHtml([{ tag: 'input' }]);
            expect(result.html).toBe('<input />');
        });

        it('img 自闭合标签', () => {
            const result = jsonTemplateToHtml([{ tag: 'img' }]);
            expect(result.html).toBe('<img />');
        });

        it('文本内容', () => {
            const result = jsonTemplateToHtml([{ tag: 'span', text: 'Hello' }]);
            expect(result.html).toBe('<span>Hello</span>');
        });

        it('子节点递归', () => {
            const nodes: JsonTemplateNode[] = [{
                tag: 'div',
                children: [
                    { tag: 'span', text: 'child1' },
                    { tag: 'span', text: 'child2' },
                ],
            }];
            const result = jsonTemplateToHtml(nodes);
            expect(result.html).toBe('<div><span>child1</span><span>child2</span></div>');
        });

        it('多个根节点拼接', () => {
            const nodes: JsonTemplateNode[] = [
                { tag: 'span', content: 'btn:icon' },
                { tag: 'span', content: 'btn:text' },
            ];
            const result = jsonTemplateToHtml(nodes);
            expect(result.html).toBe('<span data-content="btn:icon"></span><span data-content="btn:text"></span>');
        });
    });

    describe('data-* 属性映射', () => {
        it('content → data-content', () => {
            const result = jsonTemplateToHtml([{ content: 'btn:text' }]);
            expect(result.html).toContain('data-content="btn:text"');
        });

        it('event → data-event', () => {
            const result = jsonTemplateToHtml([{ content: 'btn:save', event: 'click' }]);
            expect(result.html).toContain('data-event="click"');
        });

        it('emit → data-emit', () => {
            const result = jsonTemplateToHtml([{ content: 'btn:save', emit: 'tap' }]);
            expect(result.html).toContain('data-emit="tap"');
        });

        it('target → data-target', () => {
            const result = jsonTemplateToHtml([{ content: 'list:items', target: '.item' }]);
            expect(result.html).toContain('data-target=".item"');
        });

        it('jsonMode → data-json-mode', () => {
            const result = jsonTemplateToHtml([{ content: 'grid:body', json: 'gridData', jsonMode: 'child' }]);
            expect(result.html).toContain('data-json-mode="child"');
        });

        it('template → data-template', () => {
            const result = jsonTemplateToHtml([{ content: 'page:content', template: 'contentTpl' }]);
            expect(result.html).toContain('data-template="contentTpl"');
        });

        it('i18n → data-i18n', () => {
            const result = jsonTemplateToHtml([{ content: 'btn:text', i18n: 'btn.save' }]);
            expect(result.html).toContain('data-i18n="btn.save"');
        });

        it('class 属性', () => {
            const result = jsonTemplateToHtml([{ class: 'q-btn' }]);
            expect(result.html).toContain('class="q-btn"');
        });

        it('style 属性', () => {
            const result = jsonTemplateToHtml([{ style: 'color: red;' }]);
            expect(result.html).toContain('style="color: red;"');
        });

        it('自定义 attrs', () => {
            const result = jsonTemplateToHtml([{ attrs: { id: 'myId', 'data-custom': 'val' } }]);
            expect(result.html).toContain('id="myId"');
            expect(result.html).toContain('data-custom="val"');
        });
    });

    describe('json 字段 — 字符串模式', () => {
        it('json 为字符串时直接作为 data-json 值', () => {
            const result = jsonTemplateToHtml([{ content: 'grid:body', json: 'gridData' }]);
            expect(result.html).toContain('data-json="gridData"');
            expect(result.componentMap).toEqual({});
        });
    });

    describe('json 字段 — 组件类引用模式', () => {
        it('json 为组件类时用类名作为 data-json 值', () => {
            class MyGrid {}
            const result = jsonTemplateToHtml([{ content: 'grid:body', json: MyGrid as any }]);
            expect(result.html).toContain('data-json="MyGrid"');
        });

        it('json 为匿名类时 data-json 值为类名', () => {
            const result = jsonTemplateToHtml([{ content: 'grid:body', json: class {} as any }]);
            // 匿名类在 JS 中 .name 可能是 "json" 或空字符串
            expect(result.html).toContain('data-json="');
        });

        it('json 为组件类时提取到 componentMap（content 有冒号）', () => {
            class MyGrid {}
            const result = jsonTemplateToHtml([{ content: 'grid:body', json: MyGrid as any }]);
            expect(result.componentMap['body']).toBe(MyGrid);
        });

        it('json 为组件类时提取到 componentMap（content 无冒号）', () => {
            class MyGrid {}
            const result = jsonTemplateToHtml([{ content: 'body', json: MyGrid as any }]);
            expect(result.componentMap['body']).toBe(MyGrid);
        });

        it('json 为组件类但 content 为空时不提取到 componentMap', () => {
            class MyGrid {}
            const result = jsonTemplateToHtml([{ json: MyGrid as any }]);
            expect(result.componentMap).toEqual({});
        });

        it('多个组件类引用分别提取', () => {
            class GridA {}
            class GridB {}
            const result = jsonTemplateToHtml([
                { content: 'area:gridA', json: GridA as any },
                { content: 'area:gridB', json: GridB as any },
            ]);
            expect(result.componentMap['gridA']).toBe(GridA);
            expect(result.componentMap['gridB']).toBe(GridB);
        });
    });

    describe('嵌套子节点中的 componentMap 提取', () => {
        it('子节点中的组件类引用也会提取到 componentMap', () => {
            class ChildComp {}
            const result = jsonTemplateToHtml([{
                tag: 'div',
                children: [
                    { content: 'slot:child', json: ChildComp as any },
                ],
            }]);
            expect(result.componentMap['child']).toBe(ChildComp);
            expect(result.html).toContain('data-json="ChildComp"');
        });
    });

    describe('返回值结构', () => {
        it('返回 { html, componentMap } 结构', () => {
            const result = jsonTemplateToHtml([{ tag: 'div' }]);
            expect(result).toHaveProperty('html');
            expect(result).toHaveProperty('componentMap');
            expect(typeof result.html).toBe('string');
            expect(typeof result.componentMap).toBe('object');
        });
    });
});

// ============================================
// convertTemplate — 新模板格式
// ============================================

describe('convertTemplate', () => {
    describe('基础转换', () => {
        it('空 children 返回空 html', () => {
            const tpl: ComponentTemplate = { tpl: { tag: 'div' } };
            const result = convertTemplate(tpl);
            expect(result.html).toBe('');
            expect(result.componentMap).toEqual({});
            expect(result.nodeMetas).toEqual({});
        });

        it('根节点不生成 HTML，只转换 children', () => {
            const tpl: ComponentTemplate = {
                tpl: {
                    tag: 'div',
                    className: 'root',
                    children: [
                        { tag: 'span', name: 'text', content: 'text' },
                    ],
                },
            };
            const result = convertTemplate(tpl);
            expect(result.html).not.toContain('class="root"');
            expect(result.html).toContain('<span');
        });

        it('tag 节点生成 HTML 元素', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toBe('<span></span>');
        });

        it('默认标签为 div', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{}] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toBe('<div></div>');
        });

        it('自闭合标签', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'input' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toBe('<input />');
        });

        it('文本内容', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', text: 'Hello' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toBe('<span>Hello</span>');
        });

        it('子节点递归', () => {
            const tpl: ComponentTemplate = {
                tpl: {
                    tag: 'div',
                    children: [{
                        tag: 'div',
                        children: [
                            { tag: 'span', text: 'child1' },
                            { tag: 'span', text: 'child2' },
                        ],
                    }],
                },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toBe('<div><span>child1</span><span>child2</span></div>');
        });
    });

    describe('name/content → data-content', () => {
        it('name 有冒号 → group:name 格式', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', name: 'btn:text' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-content="btn:text"');
        });

        it('name 无冒号 → _:name 格式', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', name: 'text' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-content="_:text"');
        });

        it('content 兜底 name', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', content: 'btn:label' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-content="btn:label"');
        });

        it('无 name 无 content → 不生成 data-content', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).not.toContain('data-content');
        });
    });

    describe('三类事件属性', () => {
        it('events → data-event', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'button', name: 'btn:save', events: { click: { handler: true } } }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-event="click"');
        });

        it('forwards → data-emit', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'button', name: 'btn:save', events: { tap: { emits: ['tap'] } } }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-emit="tap"');
        });

        it('bridges → data-bridge', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'button', name: 'btn:save', events: { click: { bridges: ['click'] } } }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-bridge="click"');
        });

        it('多个 events 用逗号连接', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'input', name: 'form:field', events: { input: { handler: true }, change: { handler: true } } }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-event="input,change"');
        });

        it('多个 bridges 用逗号连接', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'button', name: 'btn:action', events: { click: { bridges: ['click'] }, tap: { bridges: ['close'] } } }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-bridge="click,tap=close"');
        });
    });

    describe('type 节点（组件占位）', () => {
        it('type 为字符串 → 占位 div + data-json', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ type: 'MyGrid', name: 'grid:body' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-json="MyGrid"');
            expect(result.html).toContain('data-content="grid:body"');
            expect(result.html).toContain('<div');
        });

        it('type 为函数 → 提取到 componentMap', () => {
            class MyGrid {}
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ type: MyGrid as any, name: 'grid:body' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.componentMap['body']).toBe(MyGrid);
            expect(result.html).toContain('data-json="MyGrid"');
        });

        it('replace → data-json-mode', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ type: 'MyGrid', name: 'grid:body', replace: true }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-json-mode="replace"');
        });

        it('replace=false → data-json-mode=child', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ type: 'MyGrid', name: 'grid:body', replace: false }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-json-mode="child"');
        });

        it('type 节点支持 events（handler/emits/bridges）', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ type: 'MyGrid', name: 'grid:body', events: { click: { handler: true }, change: { emits: ['change'] }, tap: { bridges: ['tap'] } } }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-event="click"');
            expect(result.html).toContain('data-emit="change"');
            expect(result.html).toContain('data-bridge="tap"');
        });
    });

    describe('样式属性', () => {
        it('className → class', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', name: 'text', className: 'q-btn' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('class="q-btn"');
        });

        it('style 字符串', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', name: 'text', style: 'color: red;' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('style="color: red;"');
        });

        it('style 对象 → 驼峰转连字符', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', name: 'text', style: { fontSize: '14px', color: 'red' } }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('font-size:14px');
            expect(result.html).toContain('color:red');
        });
    });

    describe('其他属性', () => {
        it('i18n → data-i18n', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', name: 'text', i18n: 'btn.save' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-i18n="btn.save"');
        });

        it('hidden → data-hidden="true"', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', name: 'text', hidden: true }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('data-hidden="true"');
        });

        it('attrs → 自定义属性', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', name: 'text', attrs: { id: 'myId' } }] },
            };
            const result = convertTemplate(tpl);
            expect(result.html).toContain('id="myId"');
        });
    });

    describe('nodeMetas 提取', () => {
        it('tag 节点提取 nodeMetas', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span', name: 'btn:text', events: { click: { handler: true, emits: ['tap'], bridges: ['change'] } } }] },
            };
            const result = convertTemplate(tpl);
            const meta = result.nodeMetas['btn:text'];
            expect(meta).toBeDefined();
            expect(meta.key).toBe('btn:text');
            expect(meta.group).toBe('btn');
            expect(meta.name).toBe('text');
            expect(meta.events).toEqual({ click: { handler: true, emits: ['tap'], bridges: ['change'] } });
            expect(meta.mode).toBe('html');
        });

        it('input 节点 mode 为 value', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'input', name: 'form:field' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.nodeMetas['form:field'].mode).toBe('value');
        });

        it('img 节点 mode 为 src', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'img', name: 'avatar:img' }] },
            };
            const result = convertTemplate(tpl);
            expect(result.nodeMetas['avatar:img'].mode).toBe('src');
        });

        it('type 节点提取 nodeMetas', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ type: 'MyGrid', name: 'grid:body', events: { click: { handler: true } }, replace: true, i18n: 'grid.title', hidden: true }] },
            };
            const result = convertTemplate(tpl);
            const meta = result.nodeMetas['grid:body'];
            expect(meta).toBeDefined();
            expect(meta.typeRef).toBe('MyGrid');
            expect(meta.replace).toBe(true);
            expect(meta.events).toEqual({ click: { handler: true } });
            expect(meta.i18n).toBe('grid.title');
            expect(meta.hidden).toBe(true);
            expect(meta.mode).toBe('html');
        });

        it('无 name 无 content 的节点不提取 nodeMetas', () => {
            const tpl: ComponentTemplate = {
                tpl: { tag: 'div', children: [{ tag: 'span' }] },
            };
            const result = convertTemplate(tpl);
            expect(Object.keys(result.nodeMetas)).toHaveLength(0);
        });
    });

    describe('返回值结构', () => {
        it('返回 { html, componentMap, nodeMetas } 结构', () => {
            const tpl: ComponentTemplate = { tpl: { tag: 'div', children: [{ tag: 'span', name: 'text' }] } };
            const result = convertTemplate(tpl);
            expect(result).toHaveProperty('html');
            expect(result).toHaveProperty('componentMap');
            expect(result).toHaveProperty('nodeMetas');
            expect(typeof result.html).toBe('string');
            expect(typeof result.componentMap).toBe('object');
            expect(typeof result.nodeMetas).toBe('object');
        });
    });
});
