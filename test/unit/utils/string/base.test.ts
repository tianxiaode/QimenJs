import {
    trim,
    capitalize,
    uncapitalize,
    camelCase,
    camelCaseToDash,
} from '../../../../src/utils/string/base';

describe('String Base Utility Functions', () => {
    describe('trim', () => {
        it('should remove leading and trailing spaces', () => {
            expect(trim('  hello world  ')).toBe('hello world');
        });

        it('should not affect strings without leading/trailing spaces', () => {
            expect(trim('hello world')).toBe('hello world');
        });

        it('should handle strings with only spaces', () => {
            expect(trim('   ')).toBe('');
        });

        it('should handle empty string', () => {
            expect(trim('')).toBe('');
        });
    });

    describe('capitalize', () => {
        it('should capitalize the first letter of a string', () => {
            expect(capitalize('hello')).toBe('Hello');
        });

        it('should handle single character strings', () => {
            expect(capitalize('a')).toBe('A');
            expect(capitalize('Z')).toBe('Z');
        });

        it('should handle empty string', () => {
            expect(capitalize('')).toBe('');
        });

        it('should not affect the rest of the string', () => {
            expect(capitalize('hELLO')).toBe('HELLO');
        });
    });

    describe('uncapitalize', () => {
        it('should uncapitalize the first letter of a string', () => {
            expect(uncapitalize('Hello')).toBe('hello');
        });

        it('should handle single character strings', () => {
            expect(uncapitalize('A')).toBe('a');
            expect(uncapitalize('z')).toBe('z');
        });

        it('should handle empty string', () => {
            expect(uncapitalize('')).toBe('');
        });

        it('should not affect the rest of the string', () => {
            expect(uncapitalize('HELLO')).toBe('hELLO');
        });
    });

    describe('camelCase', () => {
        it('should convert a string with spaces to camelCase', () => {
            expect(camelCase('hello world')).toBe('helloWorld');
        });

        it('should convert a string with hyphens to camelCase', () => {
            expect(camelCase('hello-world')).toBe('helloWorld');
        });

        it('should convert a string with underscores to camelCase', () => {
            expect(camelCase('hello_world')).toBe('helloWorld');
        });

        it('should handle mixed separators', () => {
            expect(camelCase('hello_world test')).toBe('helloWorldTest');
        });

        it('should handle strings that are already in camelCase', () => {
            expect(camelCase('helloWorld')).toBe('helloWorld');
        });

        it('should handle empty string', () => {
            expect(camelCase('')).toBe('');
        });

        it('should handle single word', () => {
            expect(camelCase('hello')).toBe('hello');
        });
    });

    describe('camelCaseToDash', () => {
        it('should convert camelCase to dash-separated', () => {
            expect(camelCaseToDash('helloWorld')).toBe('hello-world');
        });

        it('should handle multiple camelCase segments', () => {
            expect(camelCaseToDash('camelCaseToDash')).toBe('camel-case-to-dash');
        });

        it('should handle single word', () => {
            expect(camelCaseToDash('hello')).toBe('hello');
        });

        it('should handle empty string', () => {
            expect(camelCaseToDash('')).toBe('');
        });
    });
});
