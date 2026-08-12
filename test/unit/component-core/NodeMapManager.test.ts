/**
 * NodeMapManager 单元测试
 * 目标覆盖率：80%+
 */

import { NodeMapManager } from '@/component-core/engine/NodeManager';
import type { CompiledTemplateCache, NodeMetadata } from '@/component-core/types/template';
import { SKELETON_CLS } from '@/component-core/constants/compile';

// Mock findByPath
jest.mock('@/component-core/engine/utils/dom-path', () => ({
    findByPath: jest.fn((root: HTMLElement, path: number[]) => {
        // 简单的路径查找实现
        let current: Element | null = root;
        for (const idx of path) {
            if (!current || !current.children[idx]) return null;
            current = current.children[idx];
        }
        return current as HTMLElement;
    }),
}));

// Helper: 创建模板元素
function createTemplateElement(html: string): HTMLTemplateElement {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template;
}

// Helper: 创建测试用 CompiledTemplateCache
function createMockCache(overrides?: Partial<CompiledTemplateCache>): CompiledTemplateCache {
    const template = createTemplateElement('<div><span data-name="test">content</span></div>');
    return {
        html: '<div><span data-name="test">content</span></div>',
        indexPath: { test: [0, 0], root: [] },
        exposeNames: [],
        i18nNodes: [],
        permissionNodes: [],
        templateCache: template,
        ...overrides,
    };
}

// Helper: 创建测试用 NodeMetadata
function createNodeMeta(overrides?: Partial<NodeMetadata>): NodeMetadata {
    return {
        name: 'test',
        tag: 'div',
        ...overrides,
    };
}

describe('NodeMapManager', () => {
    let mockCache: CompiledTemplateCache;
    let mockNodeMetas: Record<string, NodeMetadata>;
    let mockOwner: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCache = createMockCache();
        mockNodeMetas = {
            test: createNodeMeta({ name: 'test', tag: 'span' }),
            root: createNodeMeta({ name: 'root', tag: 'div' }),
        };
        mockOwner = {
            nodeMap: {},
        };
    });

    // ══════════════════════════════════════════════════════════════
    // 构造函数测试
    // ══════════════════════════════════════════════════════════════

    describe('构造函数', () => {
        it('应正确初始化所有属性', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);

            expect(manager['indexPath']).toBe(mockCache.indexPath);
            expect(manager['nodeMetas']).toBe(mockNodeMetas);
            expect(manager['i18nNodes']).toBe(mockCache.i18nNodes);
            expect(manager['exposeNames']).toBe(mockCache.exposeNames);
        });

        it('应支持无 nodeMetas 参数', () => {
            const manager = new NodeMapManager(mockCache);

            expect(manager['nodeMetas']).toEqual({});
        });

        it('应支持无 owner 参数', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas);

            expect(manager['_owner']).toBeUndefined();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // Getter 测试
    // ══════════════════════════════════════════════════════════════

    describe('getter 属性', () => {
        let manager: NodeMapManager;

        beforeEach(() => {
            manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
        });

        it('indexPath 应返回正确的值', () => {
            expect(manager.indexPath).toBe(mockCache.indexPath);
        });

        it('nodeMetas 应返回正确的值', () => {
            expect(manager.nodeMetas).toBe(mockNodeMetas);
        });

        it('i18nNodes 应返回正确的值', () => {
            expect(manager.i18nNodes).toBe(mockCache.i18nNodes);
        });

        it('exposeNames 应返回正确的值', () => {
            expect(manager.exposeNames).toBe(mockCache.exposeNames);
        });

        it('rootTag 应返回 root 节点的 tag', () => {
            expect(manager.rootTag).toBe('div');
        });

        it('rootTag 应在无 root 节点时返回默认值 div', () => {
            const managerWithoutRoot = new NodeMapManager(mockCache, {}, mockOwner);
            expect(managerWithoutRoot.rootTag).toBe('div');
        });

        it('el 应在 buildDOM 后返回元素', () => {
            manager.buildDOM();
            expect(manager.el).toBeDefined();
            expect(manager.el.tagName.toLowerCase()).toBe('div');
        });
    });

    // ══════════════════════════════════════════════════════════════
    // buildDOM 测试
    // ══════════════════════════════════════════════════════════════

    describe('buildDOM', () => {
        it('应正确构建 DOM 并返回根元素', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            const el = manager.buildDOM();

            expect(el).toBeDefined();
            expect(el.tagName.toLowerCase()).toBe('div');
            expect(el.querySelector('[data-name="test"]')).toBeTruthy();
        });

        it('应正确构建 nodeMap', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();

            const testNode = manager.get('test');
            expect(testNode).toBeDefined();
            expect(testNode?.el).toBeDefined();
        });

        it('应跳过不在 nodeMetas 中的节点', () => {
            const cache = createMockCache({
                indexPath: {
                    test: [0, 0],
                    nonExistent: [0, 1],
                },
            });
            const manager = new NodeMapManager(cache, mockNodeMetas, mockOwner);
            manager.buildDOM();

            expect(manager.get('test')).toBeDefined();
            expect(manager.get('nonExistent')).toBeUndefined();
        });

        it('应跳过 DOM 中不存在的节点', () => {
            const cache = createMockCache({
                indexPath: {
                    test: [0, 0],
                    invalid: [9, 9], // 不存在的路径
                },
            });
            cache.templateCache = createTemplateElement('<div><span>test</span></div>');
            const nodeMetas = {
                test: createNodeMeta({ name: 'test' }),
                invalid: createNodeMeta({ name: 'invalid' }),
            };

            const manager = new NodeMapManager(cache, nodeMetas, mockOwner);
            manager.buildDOM();

            expect(manager.get('test')).toBeDefined();
            expect(manager.get('invalid')).toBeUndefined();
        });

        it('应使用正确的 rootTag', () => {
            const nodeMetas = {
                root: createNodeMeta({ name: 'root', tag: 'section' }),
            };
            const manager = new NodeMapManager(mockCache, nodeMetas, mockOwner);
            const el = manager.buildDOM();

            expect(el.tagName.toLowerCase()).toBe('section');
        });
    });

    // ══════════════════════════════════════════════════════════════
    // _buildBadgeOverlays 测试
    // ══════════════════════════════════════════════════════════════

    describe('badge overlay 构建', () => {
        function createBadgeCache() {
            return createMockCache({
                indexPath: { root: [], icon: [0, 0] },
            });
        }

        function createBadgeTemplate() {
            return createTemplateElement('<div><span>icon</span></div>');
        }

        it('应为声明 badge 的节点创建绝对定位 badge 元素', () => {
            const cache = createBadgeCache();
            cache.templateCache = createBadgeTemplate();
            const nodeMetas = {
                root: createNodeMeta({ name: 'root', tag: 'div' }),
                icon: createNodeMeta({ name: 'icon', tag: 'span', badge: '3' }),
            };

            const manager = new NodeMapManager(cache, nodeMetas, mockOwner);
            manager.buildDOM();

            const badgeNode = manager.get('icon:badge');
            expect(badgeNode).toBeDefined();
            expect(badgeNode?.el).toBeDefined();
            expect(badgeNode?.el?.className).toBe('q-badge');
            expect(badgeNode?.el?.textContent).toBe('3');
            expect(badgeNode?.el?.style.position).toBe('absolute');
        });

        it('badge 对象配置应正确设置文本', () => {
            const cache = createBadgeCache();
            cache.templateCache = createBadgeTemplate();
            const nodeMetas = {
                root: createNodeMeta({ name: 'root', tag: 'div' }),
                icon: createNodeMeta({ name: 'icon', tag: 'span', badge: { text: 'New' } }),
            };

            const manager = new NodeMapManager(cache, nodeMetas, mockOwner);
            manager.buildDOM();

            const badgeNode = manager.get('icon:badge');
            expect(badgeNode?.el?.textContent).toBe('New');
        });

        it('badge visible: false 时应隐藏 badge 元素', () => {
            const cache = createBadgeCache();
            cache.templateCache = createBadgeTemplate();
            const nodeMetas = {
                root: createNodeMeta({ name: 'root', tag: 'div' }),
                icon: createNodeMeta({
                    name: 'icon',
                    tag: 'span',
                    badge: { text: '5', visible: false },
                }),
            };

            const manager = new NodeMapManager(cache, nodeMetas, mockOwner);
            manager.buildDOM();

            const badgeNode = manager.get('icon:badge');
            expect(badgeNode?.el?.style.display).toBe('none');
        });

        it('badge 为 null 时不应创建 badge 节点', () => {
            const cache = createBadgeCache();
            cache.templateCache = createBadgeTemplate();
            const nodeMetas = {
                root: createNodeMeta({ name: 'root', tag: 'div' }),
                icon: createNodeMeta({ name: 'icon', tag: 'span', badge: null }),
            };

            const manager = new NodeMapManager(cache, nodeMetas, mockOwner);
            manager.buildDOM();

            expect(manager.get('icon:badge')).toBeUndefined();
        });

        it('无 badge 声明时不应创建任何 badge 节点', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();

            const all = manager.getAll();
            const badgeKeys = Object.keys(all).filter(k => k.endsWith(':badge'));
            expect(badgeKeys).toHaveLength(0);
        });

        it('锚点元素 position 为 static 时应设为 relative', () => {
            const cache = createBadgeCache();
            cache.templateCache = createBadgeTemplate();
            const nodeMetas = {
                root: createNodeMeta({ name: 'root', tag: 'div' }),
                icon: createNodeMeta({ name: 'icon', tag: 'span', badge: '3' }),
            };

            const manager = new NodeMapManager(cache, nodeMetas, mockOwner);
            const el = manager.buildDOM();
            document.body.appendChild(el);

            try {
                const iconNode = manager.get('icon');
                expect(iconNode?.el?.style.position).toBe('relative');
            } finally {
                document.body.removeChild(el);
            }
        });

        it('badge 数字类型应正确转为文本', () => {
            const cache = createBadgeCache();
            cache.templateCache = createBadgeTemplate();
            const nodeMetas = {
                root: createNodeMeta({ name: 'root', tag: 'div' }),
                icon: createNodeMeta({ name: 'icon', tag: 'span', badge: 42 }),
            };

            const manager = new NodeMapManager(cache, nodeMetas, mockOwner);
            manager.buildDOM();

            const badgeNode = manager.get('icon:badge');
            expect(badgeNode?.el?.textContent).toBe('42');
        });

        it('锚点节点不在 nodeMap 中时不应创建 badge', () => {
            const cache = createMockCache();
            cache.templateCache = createTemplateElement('<div>empty</div>');
            cache.indexPath = { root: [] };
            const nodeMetas = {
                root: createNodeMeta({ name: 'root', tag: 'div' }),
                icon: createNodeMeta({ name: 'icon', tag: 'span', badge: '3' }),
            };

            const manager = new NodeMapManager(cache, nodeMetas, mockOwner);
            manager.buildDOM();

            expect(manager.get('icon:badge')).toBeUndefined();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // get/getAll/set 测试
    // ══════════════════════════════════════════════════════════════

    describe('get/getAll/set', () => {
        let manager: NodeMapManager;

        beforeEach(() => {
            manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
        });

        describe('get', () => {
            it('应返回已设置的节点', () => {
                const meta = createNodeMeta({ name: 'test' });
                manager.set('test', meta);
                expect(manager.get('test')).toBe(meta);
            });

            it('应返回 undefined 对于不存在的节点', () => {
                expect(manager.get('nonexistent')).toBeUndefined();
            });
        });

        describe('getAll', () => {
            it('应返回所有节点映射', () => {
                const meta1 = createNodeMeta({ name: 'test1' });
                const meta2 = createNodeMeta({ name: 'test2' });
                manager.set('test1', meta1);
                manager.set('test2', meta2);

                const all = manager.getAll();
                expect(all['test1']).toBe(meta1);
                expect(all['test2']).toBe(meta2);
            });

            it('应返回空对象如果没有节点', () => {
                expect(manager.getAll()).toEqual({});
            });
        });

        describe('set', () => {
            it('应正确设置节点映射', () => {
                const meta = createNodeMeta({ name: 'test' });
                manager.set('test', meta);
                expect(manager.get('test')).toBe(meta);
            });

            it('应覆盖已存在的节点', () => {
                const meta1 = createNodeMeta({ name: 'test', tag: 'div' });
                const meta2 = createNodeMeta({ name: 'test', tag: 'span' });

                manager.set('test', meta1);
                manager.set('test', meta2);

                expect(manager.get('test')).toBe(meta2);
            });
        });
    });

    // ══════════════════════════════════════════════════════════════
    // restoreSkeleton 测试
    // ══════════════════════════════════════════════════════════════

    describe('restoreSkeleton', () => {
        let manager: NodeMapManager;

        beforeEach(() => {
            manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();
        });

        it('应恢复节点的骨架占位符', () => {
            const testNode = manager.get('test');
            const originalEl = testNode?.el;
            expect(originalEl).toBeDefined();

            manager.restoreSkeleton('test');

            const restoredNode = manager.get('test');
            expect(restoredNode?.el?.classList.contains(SKELETON_CLS)).toBe(true);
            expect(restoredNode?.component).toBeUndefined();
        });

        it('应处理不存在节点名', () => {
            expect(() => manager.restoreSkeleton('nonexistent')).not.toThrow();
        });

        it('应在节点有 el 时使用 replaceWith', () => {
            const testNode = manager.get('test');
            const originalEl = testNode?.el;
            const replaceWithSpy = jest.spyOn(HTMLElement.prototype, 'replaceWith');

            manager.restoreSkeleton('test');

            expect(replaceWithSpy).toHaveBeenCalled();
        });

        it('应在节点无 el 但有 parentNode 时使用 insertBefore', () => {
            const parentNode = document.createElement('div');
            const refNode = document.createElement('span');
            parentNode.appendChild(refNode);

            const meta = createNodeMeta({
                name: 'testNode',
                parentNode,
                nodeIndex: 0,
            });
            meta.el = undefined;
            manager.set('testNode', meta);

            manager.restoreSkeleton('testNode');

            const restoredNode = manager.get('testNode');
            expect(restoredNode?.el?.classList.contains(SKELETON_CLS)).toBe(true);
            expect(parentNode.contains(restoredNode?.el as any)).toBe(true);
        });

        it('应在 refNode 不存在时使用 appendChild', () => {
            const parentNode = document.createElement('div');

            const meta = createNodeMeta({
                name: 'testNode',
                parentNode,
                nodeIndex: 999, // 不存在的索引
            });
            meta.el = undefined;
            manager.set('testNode', meta);

            manager.restoreSkeleton('testNode');

            const restoredNode = manager.get('testNode');
            expect(restoredNode?.el?.classList.contains(SKELETON_CLS)).toBe(true);
            expect(parentNode.contains(restoredNode?.el as any)).toBe(true);
        });

        it('应在无 el 和 parentNode 时不执行任何操作', () => {
            const meta = createNodeMeta({
                name: 'testNode',
            });
            manager.set('testNode', meta);

            expect(() => manager.restoreSkeleton('testNode')).not.toThrow();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // remove 测试
    // ══════════════════════════════════════════════════════════════

    describe('remove', () => {
        let manager: NodeMapManager;

        beforeEach(() => {
            manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();
        });

        it('应移除节点并清理 DOM', () => {
            const testNode = manager.get('test');
            const el = testNode?.el;
            expect(el).toBeDefined();

            manager.remove('test');

            expect(manager.get('test')).toBeUndefined();
            expect(el?.parentNode).toBeNull();
        });

        it('应处理不存在节点名', () => {
            expect(() => manager.remove('nonexistent')).not.toThrow();
        });

        it('应调用组件的 dispose 方法', () => {
            const mockDispose = jest.fn();
            const testNode = manager.get('test');
            if (testNode) {
                testNode.component = { dispose: mockDispose };
            }

            manager.remove('test');

            expect(mockDispose).toHaveBeenCalled();
        });

        it('应跳过无 dispose 方法的组件', () => {
            const testNode = manager.get('test');
            if (testNode) {
                testNode.component = {};
            }

            expect(() => manager.remove('test')).not.toThrow();
        });

        it('应移除子节点条目', () => {
            // 设置父节点和子节点
            const cache = createMockCache({
                indexPath: {
                    parent: [0],
                    'parent-child': [0, 0],
                },
            });
            cache.templateCache = createTemplateElement('<div><span>child</span></div>');

            const nodeMetas = {
                parent: createNodeMeta({ name: 'parent' }),
                'parent-child': createNodeMeta({ name: 'parent-child' }),
            };

            manager = new NodeMapManager(cache, nodeMetas, mockOwner);
            manager.buildDOM();

            // 验证子节点存在
            expect(manager.get('parent-child')).toBeDefined();

            // 添加 mock dispose
            const childNode = manager.get('parent-child');
            if (childNode) {
                childNode.component = { dispose: jest.fn() };
            }

            // 移除父节点
            manager.remove('parent');

            // 验证子节点也被移除
            expect(manager.get('parent')).toBeUndefined();
            expect(manager.get('parent-child')).toBeUndefined();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // replace 测试
    // ══════════════════════════════════════════════════════════════

    describe('replace', () => {
        let manager: NodeMapManager;
        let MockComponentClass: any;

        beforeEach(() => {
            manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();

            MockComponentClass = jest.fn().mockImplementation(props => ({
                el: document.createElement('div'),
                props,
                dispose: jest.fn(),
                nodeMap: { replacedNode: createNodeMeta({ name: 'replacedNode' }) },
            }));
        });

        it('应成功替换组件', () => {
            const newComponent = manager.replace('test', MockComponentClass, { prop: 'value' });

            expect(newComponent).toBeDefined();
            expect(MockComponentClass).toHaveBeenCalledWith({ prop: 'value' });
        });

        it('应返回 null 对于不存在的节点', () => {
            const result = manager.replace('nonexistent', MockComponentClass);
            expect(result).toBeNull();
        });

        it('应销毁旧组件', () => {
            const oldDispose = jest.fn();
            const testNode = manager.get('test');
            if (testNode) {
                testNode.component = { dispose: oldDispose };
            }

            manager.replace('test', MockComponentClass);

            expect(oldDispose).toHaveBeenCalled();
        });

        it('应处理无 dispose 方法的旧组件', () => {
            const testNode = manager.get('test');
            if (testNode) {
                testNode.component = {};
            }

            expect(() => manager.replace('test', MockComponentClass)).not.toThrow();
        });

        it('应设置 parent 引用', () => {
            const instance = manager.replace('test', MockComponentClass);

            expect((instance as any).parent).toBe(mockOwner);
        });

        it('应合并 nodeMap 到 owner', () => {
            manager.replace('test', MockComponentClass);

            expect(mockOwner.nodeMap.replacedNode).toBeDefined();
        });

        it('应处理子组件有 nodeMapMgr 的情况', () => {
            const childManager = new NodeMapManager(mockCache, mockNodeMetas);
            childManager.set('childNode', createNodeMeta({ name: 'childNode' }));

            MockComponentClass = jest.fn().mockImplementation(() => ({
                el: document.createElement('div'),
                nodeMapMgr: childManager,
            }));

            manager.replace('test', MockComponentClass);

            expect(manager.get('childNode')).toBeDefined();
        });

        it('应在 DOM 中替换元素', () => {
            const oldNode = manager.get('test');
            const oldEl = oldNode?.el;
            const parentEl = oldEl?.parentNode;

            manager.replace('test', MockComponentClass);

            const newNode = manager.get('test');
            expect(newNode?.el).not.toBe(oldEl);
            expect(parentEl?.contains(newNode?.el as any)).toBe(true);
        });

        it('应更新 componentClass 引用', () => {
            manager.replace('test', MockComponentClass);

            const node = manager.get('test');
            expect(node?.componentClass).toBe(MockComponentClass);
        });

        it('应在无 owner 时不设置 parent', () => {
            manager = new NodeMapManager(mockCache, mockNodeMetas);
            manager.buildDOM();

            manager.replace('test', MockComponentClass);

            expect(MockComponentClass.mock.instances[0].parent).toBeUndefined();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // disposeAll 测试
    // ══════════════════════════════════════════════════════════════

    describe('disposeAll', () => {
        let manager: NodeMapManager;

        beforeEach(() => {
            manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();
        });

        it('应清理所有节点映射', () => {
            manager.disposeAll();
            expect(manager.getAll()).toEqual({});
        });

        it('应调用所有组件的 dispose 方法', () => {
            const dispose1 = jest.fn();
            const dispose2 = jest.fn();

            const node1 = manager.get('test');
            if (node1) node1.component = { dispose: dispose1 };

            manager.set(
                'node2',
                createNodeMeta({ name: 'node2', component: { dispose: dispose2 } })
            );

            manager.disposeAll();

            expect(dispose1).toHaveBeenCalled();
            expect(dispose2).toHaveBeenCalled();
        });

        it('应跳过无 dispose 方法的组件', () => {
            manager.set('node1', createNodeMeta({ name: 'node1', component: {} }));

            expect(() => manager.disposeAll()).not.toThrow();
        });

        it('应处理空 nodeMap', () => {
            manager = new NodeMapManager(mockCache, {}, mockOwner);
            expect(() => manager.disposeAll()).not.toThrow();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // mountChildComponent 测试
    // ══════════════════════════════════════════════════════════════

    describe('mountChildComponent', () => {
        let manager: NodeMapManager;

        beforeEach(() => {
            manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();
        });

        it('应将子组件挂载到占位节点', () => {
            const placeholder = document.createElement('div');
            placeholder.className = SKELETON_CLS;

            const parentNode = document.createElement('div');
            parentNode.appendChild(placeholder);
            document.body.appendChild(parentNode);

            const node = createNodeMeta({
                name: 'slotNode',
                el: placeholder,
            });

            const childEl = document.createElement('span');
            const child = {
                el: childEl,
                nodeMapMgr: null,
            };

            manager.mountChildComponent(node, child);

            expect(node.el).toBe(childEl);
            expect(node.component).toBe(child);
            expect((child as any).parent).toBe(mockOwner);
            expect(parentNode.contains(childEl)).toBe(true);
        });

        it('应设置 parentNode 和 nodeIndex', () => {
            const placeholder = document.createElement('div');
            const parentNode = document.createElement('div');
            parentNode.appendChild(placeholder);

            const node = createNodeMeta({
                name: 'slotNode',
                el: placeholder,
            });

            const child = {
                el: document.createElement('span'),
            };

            manager.mountChildComponent(node, child);

            expect(node.parentNode).toBe(parentNode);
            expect(node.nodeIndex).toBeDefined();
        });

        it('应添加 cls 到子组件元素', () => {
            const placeholder = document.createElement('div');
            const node = createNodeMeta({
                name: 'slotNode',
                el: placeholder,
                cls: 'class1 class2',
            });

            const childEl = document.createElement('span');
            const child = { el: childEl };

            manager.mountChildComponent(node, child);

            expect(childEl.classList.contains('class1')).toBe(true);
            expect(childEl.classList.contains('class2')).toBe(true);
        });

        it('应跳过空的 cls', () => {
            const placeholder = document.createElement('div');
            const node = createNodeMeta({
                name: 'slotNode',
                el: placeholder,
                cls: '',
            });

            const childEl = document.createElement('span');
            const child = { el: childEl };

            manager.mountChildComponent(node, child);

            expect(childEl.classList.length).toBe(0);
        });

        it('应合并子组件的 nodeMapMgr', () => {
            const placeholder = document.createElement('div');
            const node = createNodeMeta({
                name: 'slotNode',
                el: placeholder,
            });

            const childManager = new NodeMapManager(mockCache, {});
            childManager.set('childNode', createNodeMeta({ name: 'childNode' }));

            const child = {
                el: document.createElement('span'),
                nodeMapMgr: childManager,
            };

            manager.mountChildComponent(node, child);

            expect(manager.get('childNode')).toBeDefined();
        });

        it('应合并子组件的 nodeMap', () => {
            const placeholder = document.createElement('div');
            const node = createNodeMeta({
                name: 'slotNode',
                el: placeholder,
            });

            const childNodeMap = {
                childNode: createNodeMeta({ name: 'childNode' }),
            };

            const child = {
                el: document.createElement('span'),
                nodeMap: childNodeMap,
            };

            manager.mountChildComponent(node, child);

            expect(manager.get('childNode')).toBe(childNodeMap.childNode);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // 私有方法间接测试
    // ══════════════════════════════════════════════════════════════

    describe('_buildNodeMap (间接测试)', () => {
        it('应正确构建节点映射', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();

            // 验证节点映射已建立
            const testNode = manager.get('test');
            expect(testNode).toBeDefined();
            expect(testNode?.el).toBeDefined();
        });
    });

    describe('_removeChildEntries (间接测试)', () => {
        it('应移除子节点并调用 dispose', () => {
            const cache = createMockCache({
                indexPath: {
                    parent: [0],
                    'parent-child': [0, 0],
                },
            });
            cache.templateCache = createTemplateElement('<div><span>child</span></div>');

            const nodeMetas = {
                parent: createNodeMeta({ name: 'parent' }),
                'parent-child': createNodeMeta({ name: 'parent-child' }),
            };

            const testManager = new NodeMapManager(cache, nodeMetas, mockOwner);
            testManager.buildDOM();

            const childDispose = jest.fn();
            const childNode = testManager.get('parent-child');
            if (childNode) {
                childNode.component = { dispose: childDispose };
            }

            testManager.remove('parent');

            expect(testManager.get('parent-child')).toBeUndefined();
            expect(childDispose).toHaveBeenCalled();
        });
    });

    describe('_replaceDOM (间接测试)', () => {
        it('应在有 el.parentNode 时使用 replaceWith', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();

            const MockComponentClass = jest.fn().mockImplementation(() => ({
                el: document.createElement('div'),
                dispose: jest.fn(),
            }));

            const oldNode = manager.get('test');
            const oldEl = oldNode?.el;
            const parentEl = oldEl?.parentNode;

            manager.replace('test', MockComponentClass);

            const newNode = manager.get('test');
            expect(parentEl?.contains(newNode?.el as any)).toBe(true);
        });

        it('应在无 el.parentNode 但有 parentNode 和 nodeIndex 时使用 insertBefore', () => {
            const parentNode = document.createElement('div');
            const refNode = document.createElement('span');
            parentNode.appendChild(refNode);

            const meta = createNodeMeta({
                name: 'testNode',
                parentNode,
                nodeIndex: 0,
            });

            const testManager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            testManager.buildDOM();
            testManager.set('testNode', meta);

            const MockComponentClass = jest.fn().mockImplementation(() => ({
                el: document.createElement('div'),
            }));

            testManager.replace('testNode', MockComponentClass);

            expect(parentNode.contains(testManager.get('testNode')?.el as any)).toBe(true);
        });
    });

    describe('_mergeChildNodeMap (间接测试)', () => {
        it('应合并子组件的 nodeMap', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();

            const childManager = new NodeMapManager(mockCache, {});
            childManager.set('mergedNode', createNodeMeta({ name: 'mergedNode' }));

            const MockComponentClass = jest.fn().mockImplementation(() => ({
                el: document.createElement('div'),
                nodeMapMgr: childManager,
            }));

            manager.replace('test', MockComponentClass);

            expect(manager.get('mergedNode')).toBeDefined();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // 边界情况测试
    // ══════════════════════════════════════════════════════════════

    describe('边界情况', () => {
        it('应处理空的 indexPath', () => {
            const cache = createMockCache({ indexPath: {} });
            const manager = new NodeMapManager(cache, mockNodeMetas, mockOwner);

            expect(() => manager.buildDOM()).not.toThrow();
        });

        it('应处理空的 nodeMetas', () => {
            const manager = new NodeMapManager(mockCache, {}, mockOwner);
            manager.buildDOM();

            expect(manager.getAll()).toEqual({});
        });

        it('应处理多次 buildDOM 调用', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);

            manager.buildDOM();
            const el1 = manager.el;

            manager.buildDOM();
            const el2 = manager.el;

            expect(el1).not.toBe(el2);
        });

        it('应处理 replace 后的再次 replace', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();

            const MockComponentClass1 = jest.fn().mockImplementation(() => ({
                el: document.createElement('div'),
                dispose: jest.fn(),
            }));

            const MockComponentClass2 = jest.fn().mockImplementation(() => ({
                el: document.createElement('span'),
                dispose: jest.fn(),
            }));

            manager.replace('test', MockComponentClass1);
            manager.replace('test', MockComponentClass2);

            const node = manager.get('test');
            expect(node?.componentClass).toBe(MockComponentClass2);
        });

        it('应处理 disposeAll 后的再次操作', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            manager.buildDOM();

            manager.disposeAll();

            expect(() => manager.set('newNode', createNodeMeta({ name: 'newNode' }))).not.toThrow();
            expect(manager.get('newNode')).toBeDefined();
        });

        it('应处理无父元素的节点恢复骨架', () => {
            const testManager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            testManager.buildDOM();

            const meta = createNodeMeta({
                name: 'orphanNode',
            });
            testManager.set('orphanNode', meta);

            expect(() => testManager.restoreSkeleton('orphanNode')).not.toThrow();
        });

        it('应处理 mountChildComponent 时无 parentElement 的情况', () => {
            const testManager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);
            testManager.buildDOM();

            const placeholder = document.createElement('div');
            // 不添加到任何父元素

            const node = createNodeMeta({
                name: 'slotNode',
                el: placeholder,
            });

            const child = {
                el: document.createElement('span'),
            };

            // 这种情况下 replaceWith 会抛出错误，但我们的实现应该处理
            expect(() => testManager.mountChildComponent(node, child)).not.toThrow();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // 集成场景测试
    // ══════════════════════════════════════════════════════════════

    describe('集成场景', () => {
        it('完整生命周期：build → set → replace → remove', () => {
            const manager = new NodeMapManager(mockCache, mockNodeMetas, mockOwner);

            // Build
            manager.buildDOM();
            expect(manager.get('test')).toBeDefined();

            // Set
            manager.set('customNode', createNodeMeta({ name: 'customNode' }));
            expect(manager.get('customNode')).toBeDefined();

            // Replace
            const MockComponentClass = jest.fn().mockImplementation(() => ({
                el: document.createElement('div'),
                dispose: jest.fn(),
            }));
            manager.replace('test', MockComponentClass);

            // Remove
            manager.remove('test');
            expect(manager.get('test')).toBeUndefined();
        });

        it('多层级节点管理', () => {
            const cache = createMockCache({
                indexPath: {
                    root: [],
                    level1: [0],
                    level2: [0, 0],
                    level3: [0, 0, 0],
                },
            });
            cache.templateCache = createTemplateElement('<div><span><em>deep</em></span></div>');

            const nodeMetas = {
                root: createNodeMeta({ name: 'root' }),
                level1: createNodeMeta({ name: 'level1' }),
                level2: createNodeMeta({ name: 'level2' }),
                level3: createNodeMeta({ name: 'level3' }),
            };

            const manager = new NodeMapManager(cache, nodeMetas, mockOwner);
            manager.buildDOM();

            expect(manager.get('root')).toBeDefined();
            expect(manager.get('level1')).toBeDefined();
            expect(manager.get('level2')).toBeDefined();
            expect(manager.get('level3')).toBeDefined();
        });
    });
});
