import { ComponentTypes } from '@/component-core/ComponentTypes';

describe('ComponentTypes', () => {
    it('定义 BUTTON 常量', () => {
        expect(ComponentTypes.BUTTON).toBe('Button');
    });

    it('定义 INPUT 常量', () => {
        expect(ComponentTypes.INPUT).toBe('Input');
    });

    it('定义 TABLE 常量', () => {
        expect(ComponentTypes.TABLE).toBe('Table');
    });

    it('定义 HBOX/VBOX 布局常量', () => {
        expect(ComponentTypes.HBOX).toBe('HBox');
        expect(ComponentTypes.VBOX).toBe('VBox');
    });

    it('所有值为字符串', () => {
        for (const val of Object.values(ComponentTypes)) {
            expect(typeof val).toBe('string');
        }
    });
});
