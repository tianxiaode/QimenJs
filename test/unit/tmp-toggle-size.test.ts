/**
 * 临时验证：ToggleComponent size option 是否加 q-size--lg 类
 */
import { ToggleComponent } from '@/component/toggle/ToggleComponent';

describe('ToggleComponent size', () => {
    it('size lg 应添加 q-size--lg 类', async () => {
        const t = new ToggleComponent({ size: 'lg', offIcon: 'fa fa-sun-o' });
        await t.ready;
        console.log('className:', t.el?.className);
        expect(t.el?.className).toContain('q-size--lg');
    });

    it('default size md 应添加 q-size--md 类', async () => {
        const t = new ToggleComponent({});
        await t.ready;
        console.log('className:', t.el?.className);
        expect(t.el?.className).toContain('q-size--md');
    });
});
