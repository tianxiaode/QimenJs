import { generateColorShades } from '@/utils/color/generateColorShades';

describe('generateColorShades', () => {
    it('should generate color shades correctly', () => {
        const shades = generateColorShades('#808080');
        expect(shades).toHaveProperty('light-3');
        expect(shades).toHaveProperty('light-5');
        expect(shades).toHaveProperty('light-7');
        expect(shades).toHaveProperty('light-8');
        expect(shades).toHaveProperty('light-9');
        expect(shades).toHaveProperty('dark-2');
    });

    it('should generate correct number of shades with custom steps', () => {
        const customSteps = [2, 4, 6];
        const darkStep = 5;
        const shades = generateColorShades('#808080', customSteps, darkStep);
        
        expect(shades).toHaveProperty('light-2');
        expect(shades).toHaveProperty('light-4');
        expect(shades).toHaveProperty('light-6');
        expect(shades).toHaveProperty('dark-5');
        
        // Check that the default steps are not present
        expect(shades).not.toHaveProperty('light-3');
        expect(shades).not.toHaveProperty('light-5');
        expect(shades).not.toHaveProperty('light-7');
    });

    it('should return valid hex values', () => {
        const shades = generateColorShades('#FF0000');
        
        for (const shade in shades) {
            expect(shades[shade]).toMatch(/^#([A-Fa-f0-9]{6})$/);
        }
    });
});