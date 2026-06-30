/**
 * Date 处理器单元测试
 */

import { DateTypeProcessor } from '@/validation/processors/date/type';
import { DateIsProcessor } from '@/validation/processors/date/is';
import { DateExcludesProcessor } from '@/validation/processors/date/excludes';
import { DateIncludesProcessor } from '@/validation/processors/date/includes';
import { DateWeenendProcessor } from '@/validation/processors/date/weekend';

function createContext(value: any, rule: any = {}) {
    return {
        value,
        rule,
        errors: [] as any[],
        terminate: false,
        path: '',
        status: { isUndefined: value === undefined, isNull: value === null, isEmpty: false },
    } as any;
}

describe('DateTypeProcessor', () => {
    it('should pass for valid Date', async () => {
        const context = createContext(new Date('2024-01-01'), { type: 'date' });
        await DateTypeProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for non-Date value', async () => {
        const context = createContext('2024-01-01', { type: 'date' });
        await DateTypeProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
        expect(context.terminate).toBe(true);
    });

    it('should fail for invalid Date', async () => {
        const context = createContext(new Date('invalid'), { type: 'date' });
        await DateTypeProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
        expect(context.terminate).toBe(true);
    });

    it('should fail for number', async () => {
        const context = createContext(123, { type: 'date' });
        await DateTypeProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });
});

describe('DateIsProcessor', () => {
    it('should pass for future date when rule.future=true', async () => {
        const future = new Date();
        future.setDate(future.getDate() + 30);
        const context = createContext(future, { type: 'date', future: true });
        await DateIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for past date when rule.future=true', async () => {
        const past = new Date();
        past.setDate(past.getDate() - 30);
        const context = createContext(past, { type: 'date', future: true });
        await DateIsProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should pass for past date when rule.past=true', async () => {
        const past = new Date();
        past.setDate(past.getDate() - 30);
        const context = createContext(past, { type: 'date', past: true });
        await DateIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for future date when rule.past=true', async () => {
        const future = new Date();
        future.setDate(future.getDate() + 30);
        const context = createContext(future, { type: 'date', past: true });
        await DateIsProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should pass for today when rule.today=true', async () => {
        const today = new Date();
        const context = createContext(today, { type: 'date', today: true });
        await DateIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass for yesterday when rule.yesterday=true', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const context = createContext(yesterday, { type: 'date', yesterday: true });
        await DateIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass for tomorrow when rule.tomorrow=true', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const context = createContext(tomorrow, { type: 'date', tomorrow: true });
        await DateIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should skip when rule key is not true', async () => {
        const context = createContext(new Date(), { type: 'date', future: false });
        await DateIsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });
});

describe('DateExcludesProcessor', () => {
    it('should skip when excludes is undefined', async () => {
        const context = createContext(new Date(), { type: 'date' });
        await DateExcludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass when value is not in excludes array', async () => {
        const date = new Date('2024-06-01');
        const excluded = [new Date('2024-01-01'), new Date('2024-12-31')];
        const context = createContext(date, { type: 'date', excludes: excluded });
        await DateExcludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail when value is in excludes array', async () => {
        const date = new Date('2024-06-01');
        const excluded = [new Date('2024-06-01'), new Date('2024-12-31')];
        const context = createContext(date, { type: 'date', excludes: excluded });
        await DateExcludesProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should support function excludes', async () => {
        const date = new Date('2024-06-01');
        const getExcludes = jest.fn().mockReturnValue([new Date('2024-06-01')]);
        const context = createContext(date, { type: 'date', excludes: getExcludes });
        await DateExcludesProcessor(context);
        expect(getExcludes).toHaveBeenCalled();
        expect(context.errors.length).toBeGreaterThan(0);
    });
});

describe('DateIncludesProcessor', () => {
    it('should skip when includes is undefined', async () => {
        const context = createContext(new Date(), { type: 'date' });
        await DateIncludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass when value is in includes array', async () => {
        const date = new Date('2024-06-01');
        const included = [new Date('2024-06-01'), new Date('2024-12-31')];
        const context = createContext(date, { type: 'date', includes: included });
        await DateIncludesProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail when value is not in includes array', async () => {
        const date = new Date('2024-06-01');
        const included = [new Date('2024-01-01'), new Date('2024-12-31')];
        const context = createContext(date, { type: 'date', includes: included });
        await DateIncludesProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should support function includes', async () => {
        const date = new Date('2024-06-01');
        const getIncludes = jest.fn().mockReturnValue([new Date('2024-06-01')]);
        const context = createContext(date, { type: 'date', includes: getIncludes });
        await DateIncludesProcessor(context);
        expect(getIncludes).toHaveBeenCalled();
        expect(context.errors).toHaveLength(0);
    });
});

describe('DateWeekendProcessor', () => {
    it('should skip when weekend is undefined or falsy', async () => {
        const context = createContext(new Date(), { type: 'date' });
        await DateWeenendProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should pass when date is on a weekend day', async () => {
        // Find next Saturday
        const saturday = new Date();
        while (saturday.getDay() !== 6) {
            saturday.setDate(saturday.getDate() + 1);
        }
        const context = createContext(saturday, { type: 'date', weekend: [6, 0] });
        await DateWeenendProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail when date is not on a weekend day', async () => {
        // Find next Monday
        const monday = new Date();
        while (monday.getDay() !== 1) {
            monday.setDate(monday.getDate() + 1);
        }
        const context = createContext(monday, { type: 'date', weekend: [6, 0] });
        await DateWeenendProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should support single weekend day number', async () => {
        const saturday = new Date();
        while (saturday.getDay() !== 6) {
            saturday.setDate(saturday.getDate() + 1);
        }
        const context = createContext(saturday, { type: 'date', weekend: 6 });
        await DateWeenendProcessor(context);
        expect(context.errors).toHaveLength(0);
    });
});
