import { ChildNodePropsEngine } from '@/component-core/engine/ChildNodePropsEngine';
import type { NodeMetadata } from '@/component-core/types/compiled-types';

describe('child-node-props', () => {
    const makeNodeMetas = (
        overrides: Record<string, Partial<NodeMetadata>> = {}
    ): Record<string, NodeMetadata> => {
        const result: Record<string, NodeMetadata> = {};
        for (const [name, meta] of Object.entries(overrides)) {
            result[name] = { name, ...meta } as NodeMetadata;
        }
        return result;
    };

    it('DOM 子节点生成内容属性', () => {
        const nodeMetas = makeNodeMetas({ title: { contentMode: 'html' } });
        const descs = ChildNodePropsEngine.buildDescs(nodeMetas, []);
        expect(descs.titleHtml).toBeDefined();
    });

    it('value 模式生成 value 属性', () => {
        const nodeMetas = makeNodeMetas({ input: { contentMode: 'value' } });
        const descs = ChildNodePropsEngine.buildDescs(nodeMetas, []);
        expect(descs.input).toBeDefined();
    });

    it('link 模式生成 text + href 属性', () => {
        const nodeMetas = makeNodeMetas({ link: { contentMode: 'link' } });
        const descs = ChildNodePropsEngine.buildDescs(nodeMetas, []);
        expect(descs.link).toBeDefined();
        expect(descs.linkHref).toBeDefined();
    });

    it('组件子节点生成 $name', () => {
        const FakeComp = class {};
        const nodeMetas = makeNodeMetas({ icon: { componentClass: FakeComp as any } });
        const descs = ChildNodePropsEngine.buildDescs(nodeMetas, []);
        expect(descs.$icon).toBeDefined();
        expect(typeof descs.$icon.get).toBe('function');
    });

    it('保留名冲突加 _ 后缀', () => {
        const nodeMetas = makeNodeMetas({ dispose: { contentMode: 'html' } });
        const descs = ChildNodePropsEngine.buildDescs(nodeMetas, []);
        expect(descs.disposeHtml).toBeDefined();
        expect(descs.dispose).toBeUndefined();
    });
});
