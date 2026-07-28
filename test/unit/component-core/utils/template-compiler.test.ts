import { findByPath } from '@/component-core/engine/utils/dom-path';

describe('template-compiler', () => {
    describe('findByPath', () => {
        it('按路径定位子元素', () => {
            const root = document.createElement('div');
            const child0 = document.createElement('span');
            const child1 = document.createElement('div');
            const grandChild = document.createElement('p');
            root.appendChild(child0);
            root.appendChild(child1);
            child1.appendChild(grandChild);
            expect(findByPath(root, [0])).toBe(child0);
            expect(findByPath(root, [1])).toBe(child1);
            expect(findByPath(root, [1, 0])).toBe(grandChild);
        });

        it('路径不存在返回 null', () => {
            const root = document.createElement('div');
            expect(findByPath(root, [0])).toBeNull();
        });
    });
});
