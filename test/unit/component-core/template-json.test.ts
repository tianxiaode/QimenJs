/**
 * template-json.ts 单元测试
 *
 * 覆盖：jsonTemplateToHtml、JsonTemplateNode → HTML 转换、componentMap 提取
 */

import { jsonTemplateToHtml } from '@/component-core/template-json';
import type { JsonTemplateNode } from '@/component-core/template-json';

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
