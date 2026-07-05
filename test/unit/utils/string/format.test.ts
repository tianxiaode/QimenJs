import {
    replace,
    replaceAll,
    highlightText,
    textToHtml,
    splitWithEscaping,
} from '../../../../src/utils/string/format';

describe('String Format Utility Functions', () => {
    describe('replace', () => {
        it('should replace placeholders in a string with provided options', () => {
            const result = replace('Hello {name}, welcome to {place}!', {
                name: 'John',
                place: 'QimenJS',
            });
            expect(result).toBe('Hello John, welcome to QimenJS!');
        });

        it('should handle a string with no placeholders', () => {
            const result = replace('Hello world!', {
                name: 'John',
            });
            expect(result).toBe('Hello world!');
        });

        it('should handle empty options', () => {
            const result = replace('Hello {name}!', {});
            expect(result).toBe('Hello {name}!');
        });

        it('should handle empty string', () => {
            const result = replace('', {
                name: 'John',
            });
            expect(result).toBe('');
        });
    });

    describe('replaceAll', () => {
        it('should replace all occurrences of a substring', () => {
            const result = replaceAll('hello hello hello', 'hello', 'hi');
            expect(result).toBe('hi hi hi');
        });

        it('should handle case insensitive replacement', () => {
            // 正则表达式是大小写不敏感的，所以所有匹配项都会被替换
            const result = replaceAll('Hello HELLO hello', 'hello', 'hi');
            expect(result).toBe('hi hi hi');
        });

        it('should handle no matches', () => {
            const result = replaceAll('hello world', 'xyz', 'abc');
            expect(result).toBe('hello world');
        });
    });

    describe('highlightText', () => {
        it('should highlight matching text with default HTML span classes', () => {
            const result = highlightText('This is a test string', 'test');
            expect(result).toBe('This is a <span class="text-danger font-bold">test</span> string');
        });

        it('should handle case insensitive matching', () => {
            const result = highlightText('This is a TEST string', 'test');
            expect(result).toBe('This is a <span class="text-danger font-bold">TEST</span> string');
        });

        it('should return original text if text is empty', () => {
            expect(highlightText('', 'test')).toBe('');
        });

        it('should highlight multiple occurrences', () => {
            const result = highlightText('test one test two test', 'test');
            expect(result).toBe(
                '<span class="text-danger font-bold">test</span> one <span class="text-danger font-bold">test</span> two <span class="text-danger font-bold">test</span>'
            );
        });

        it('should highlight with additional CSS classes', () => {
            const result = highlightText('This is a test string', 'test', 'bg-yellow highlight');
            expect(result).toBe(
                'This is a <span class="text-danger font-bold bg-yellow highlight">test</span> string'
            );
        });

        it('should work with additional CSS class when search term has special regex characters', () => {
            const result = highlightText('This is a (test) string', '(test)', 'custom-class');
            expect(result).toBe(
                'This is a <span class="text-danger font-bold custom-class">(test)</span> string'
            );
        });

        it('should handle empty search term by highlighting all characters', () => {
            // 空搜索词会在每个字符之间匹配，这符合正则表达式的行为
            const result = highlightText('test', '');
            // 空正则表达式会匹配字符串中每个位置，包括字符之间和首尾
            expect(result).toContain(
                't<span class="text-danger font-bold"></span>e<span class="text-danger font-bold"></span>s<span class="text-danger font-bold"></span>t<span class="text-danger font-bold"></span>'
            );
        });
    });

    describe('textToHtml', () => {
        it('should convert a string with newlines to HTML paragraphs', () => {
            const result = textToHtml('Line 1\nLine 2\nLine 3');
            expect(result).toBe(
                '<p class="">Line 1</p><p class="">Line 2</p><p class="">Line 3</p>'
            );
        });

        it('should work with custom class name', () => {
            const result = textToHtml('Line 1\nLine 2', 'my-class');
            expect(result).toBe('<p class="my-class">Line 1</p><p class="my-class">Line 2</p>');
        });

        it('should handle a string without newlines', () => {
            const result = textToHtml('Single line text');
            expect(result).toBe('<p class="">Single line text</p>');
        });

        it('should handle an array of strings', () => {
            const result = textToHtml(['Line 1', 'Line 2'], 'my-class');
            expect(result).toBe('<p class="my-class">Line 1</p><p class="my-class">Line 2</p>');
        });
    });

    describe('splitWithEscaping', () => {
        it('should split a string with escaping', () => {
            const result = splitWithEscaping('a,b,,c,d', ',');
            expect(result).toEqual(['a', 'b,c', 'd']);
        });

        it('should handle a string without escaped separators', () => {
            const result = splitWithEscaping('a,b,c', ',');
            expect(result).toEqual(['a', 'b', 'c']);
        });

        it('should handle a string with multiple escaped separators', () => {
            const result = splitWithEscaping('a,b,,c,,,d', ',');
            expect(result).toEqual(['a', 'b,c,', 'd']);
        });

        it('should return the original string if separator is empty', () => {
            const result = splitWithEscaping('a,b,c', '');
            expect(result).toEqual(['a,b,c']);
        });

        it('should handle string with no separators', () => {
            const result = splitWithEscaping('abc', ',');
            expect(result).toEqual(['abc']);
        });
    });
});
