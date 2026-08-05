/**
 * ArrowAbility 单元测试
 */

import { ArrowAbility } from '@/component-abilities/render/ArrowAbility';

describe('ArrowAbility', () => {
    function createInstance(config?: { arrowName?: string }) {
        const arrowName = config?.arrowName ?? 'arrow';
        const arrowEl = document.createElement('span');
        arrowEl.className = 'q-arrow';

        const nodeMap: Record<string, any> = {
            [arrowName]: { el: arrowEl },
        };

        return {
            nodeMap,
            _arrowVisible: false,
            _arrowName: '',
            _arrowEl: null as HTMLElement | null,
        };
    }

    describe('initArrow', () => {
        it('默认配置初始化', () => {
            const inst = createInstance();
            ArrowAbility.initArrow.call(inst);
            expect(inst._arrowVisible).toBe(true);
            expect(inst._arrowName).toBe('arrow');
            expect(inst._arrowEl).toBeTruthy();
        });

        it('arrow=false 时隐藏箭头', () => {
            const inst = createInstance();
            ArrowAbility.initArrow.call(inst, { arrow: false });
            expect(inst._arrowVisible).toBe(false);
            expect(inst._arrowEl?.style.display).toBe('none');
        });

        it('自定义 arrowName', () => {
            const inst = createInstance({ arrowName: 'myArrow' });
            inst.nodeMap['myArrow'] = { el: document.createElement('span') };
            ArrowAbility.initArrow.call(inst, { arrowName: 'myArrow' });
            expect(inst._arrowName).toBe('myArrow');
        });

        it('arrowVars 设置 CSS 变量', () => {
            const inst = createInstance();
            ArrowAbility.initArrow.call(inst, {
                arrowVars: { '--q-arrow-color': '#fff' },
            });
            expect(inst._arrowEl?.style.getPropertyValue('--q-arrow-color')).toBe('#fff');
        });

        it('nodeMap 中无箭头元素时不初始化', () => {
            const inst = { nodeMap: {}, _arrowVisible: false, _arrowName: '', _arrowEl: null };
            ArrowAbility.initArrow.call(inst);
            expect(inst._arrowEl).toBeNull();
        });
    });

    describe('updateArrowPlacement', () => {
        it('更新方向 CSS 类', () => {
            const inst = createInstance();
            ArrowAbility.initArrow.call(inst);
            ArrowAbility.updateArrowPlacement.call(inst, 'top');
            expect(inst._arrowEl?.classList.contains('q-arrow--top')).toBe(true);
            expect(inst._arrowEl?.classList.contains('q-arrow--bottom')).toBe(false);
        });

        it('切换方向替换类名', () => {
            const inst = createInstance();
            ArrowAbility.initArrow.call(inst);
            ArrowAbility.updateArrowPlacement.call(inst, 'left');
            expect(inst._arrowEl?.classList.contains('q-arrow--left')).toBe(true);
        });

        it('无箭头元素不报错', () => {
            const inst = { _arrowEl: null };
            expect(() => ArrowAbility.updateArrowPlacement.call(inst, 'top')).not.toThrow();
        });
    });

    describe('setArrowVisible', () => {
        it('显示箭头', () => {
            const inst = createInstance();
            ArrowAbility.initArrow.call(inst);
            ArrowAbility.setArrowVisible.call(inst, false);
            expect(inst._arrowEl?.style.display).toBe('none');
            ArrowAbility.setArrowVisible.call(inst, true);
            expect(inst._arrowEl?.style.display).toBe('');
        });

        it('无箭头元素不报错', () => {
            const inst = { _arrowVisible: false, _arrowEl: null };
            expect(() => ArrowAbility.setArrowVisible.call(inst, true)).not.toThrow();
        });
    });
});
