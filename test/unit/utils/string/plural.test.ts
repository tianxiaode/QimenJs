import { pluralize, plural, pluralWithCount } from '../../../../src/utils/string/plural';

describe('String Plural Utility Functions', () => {
    describe('pluralize', () => {
        it('should pluralize regular words by adding "s"', () => {
            expect(pluralize('cat')).toBe('cats');
            expect(pluralize('dog')).toBe('dogs');
        });

        it('should handle irregular plurals', () => {
            expect(pluralize('child')).toBe('children');
            expect(pluralize('man')).toBe('men');
            expect(pluralize('person')).toBe('people');
        });

        it('should handle words ending with "y" preceded by consonant', () => {
            expect(pluralize('city')).toBe('cities');
            expect(pluralize('baby')).toBe('babies');
        });

        it('should handle words ending with "f" or "fe"', () => {
            expect(pluralize('leaf')).toBe('leaves');
            expect(pluralize('knife')).toBe('knives');
            expect(pluralize('shelf')).toBe('shelves');
        });

        it('should handle words ending with "sh", "ch", "x" or "z"', () => {
            expect(pluralize('brush')).toBe('brushes');
            expect(pluralize('church')).toBe('churches');
            expect(pluralize('box')).toBe('boxes');
            expect(pluralize('quiz')).toBe('quizzes');
        });

        it('should handle words ending with "s"', () => {
            expect(pluralize('cats')).toBe('cats');
        });

        it('should return default plural form for words that do not match any rule', () => {
            // 测试以元音结尾的单词，这些单词不会匹配任何现有规则，因此会使用默认返回
            expect(pluralize('apple')).toBe('apples');
            expect(pluralize('orange')).toBe('oranges');
        });

        it('should support custom irregular rules', () => {
            const customIrregular = { goose: 'geese', mouse: 'mice' };
            expect(pluralize('goose', { irregular: customIrregular })).toBe('geese');
            expect(pluralize('mouse', { irregular: customIrregular })).toBe('mice');
        });

        it('should support custom rules', () => {
            const customRules = [
                {
                    test: (word: string) => word.endsWith('o'),
                    apply: (word: string) => word + 'es',
                },
            ];
            expect(pluralize('tomato', { rules: customRules })).toBe('tomatoes');
        });
    });

    describe('plural', () => {
        it('should return singular form when count is 1', () => {
            expect(plural(1, 'cat', 'cats')).toBe('cat');
            expect(plural(1, 'child', 'children')).toBe('child');
        });

        it('should return plural form when count is not 1', () => {
            expect(plural(0, 'cat', 'cats')).toBe('cats');
            expect(plural(2, 'cat', 'cats')).toBe('cats');
            expect(plural(10, 'cat', 'cats')).toBe('cats');
        });
    });

    describe('pluralWithCount', () => {
        it('should return count with singular form when count is 1', () => {
            expect(pluralWithCount(1, 'cat', 'cats')).toBe('1 cat');
            expect(pluralWithCount(1, 'child', 'children')).toBe('1 child');
        });

        it('should return count with plural form when count is not 1', () => {
            expect(pluralWithCount(0, 'cat', 'cats')).toBe('0 cats');
            expect(pluralWithCount(2, 'cat', 'cats')).toBe('2 cats');
            expect(pluralWithCount(10, 'cat', 'cats')).toBe('10 cats');
        });
    });
});
