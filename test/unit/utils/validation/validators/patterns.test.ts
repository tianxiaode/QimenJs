import {
    validatePattern,
    validateEmail,
    validatePhone,
    validateURL,
    validateIPv4,
    validateIPv6,
    validateMAC,
    validateHexColor,
    validateRGBColor,
    validateRGBAColor,
    validateUsername,
    validatePassword,
    validateChineseID,
    validateChinesePostcode,
    validateDateTime,
    validateJSONString,
    validateBase64,
    validateUUID,
    validateCreditCard,
    createPatternValidator,
} from '@orbitjs/utils';

describe('Validation Patterns', () => {
    describe('validatePattern', () => {
        it('should validate string against regex pattern', () => {
            expect(validatePattern('hello', /hello/)).toBe(true);
            expect(validatePattern('Hello', /hello/, { caseSensitive: false })).toBe(true);
            expect(validatePattern('hello world', /hello/, { global: true })).toBe(true);
            expect(validatePattern('hello', /[0-9]/)).toBe(false);
        });

        it('should support case insensitive option', () => {
            // 测试 ignoreCase 选项
            expect(validatePattern('HELLO', /hello/, { ignoreCase: true })).toBe(true);
            expect(validatePattern('Hello', /hello/, { ignoreCase: true })).toBe(true);
            // 不使用 ignoreCase 选项应该不匹配
            expect(validatePattern('HELLO', /hello/)).toBe(false);
        });

        it('should support global option', () => {
            // 测试 global 选项
            expect(validatePattern('hello world hello', /hello/, { global: true })).toBe(true);
            // 即使没有 global 选项，test 方法也会返回 true（只要找到一个匹配）
            expect(validatePattern('hello world hello', /hello/)).toBe(true);
        });

        it('should support multiline option', () => {
            const multilineText = `line1
line2
line3`;
            // 通过选项参数传递 multiline 标志
            expect(validatePattern(multilineText, /^line2$/, { multiline: true })).toBe(true);
            // 不使用 multiline 标志应该不匹配
            expect(validatePattern(multilineText, /^line2$/)).toBe(false);
        });

        it('should support unicode option', () => {
            expect(validatePattern('café', /café/, { unicode: true })).toBe(true);
        });

        it('should support sticky option', () => {
            // Sticky 标志测试 - 只匹配字符串开头
            expect(validatePattern('hello world', /hello/, { sticky: true })).toBe(true);
            // 不匹配中间或末尾的匹配
            expect(validatePattern('world hello', /hello/, { sticky: true })).toBe(false);
            expect(validatePattern('worldhello', /hello/, { sticky: true })).toBe(false);
        });

        it('should return false for non-string values', () => {
            expect(validatePattern(null as any, /test/)).toBe(false);
            expect(validatePattern(undefined as any, /test/)).toBe(false);
            expect(validatePattern(123 as any, /test/)).toBe(false);
        });
    });

    describe('validateEmail', () => {
        it('should validate correct email addresses', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('user+tag@example.org')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(validateEmail('invalid.email')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('test@.com')).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('should validate phone numbers', () => {
            expect(validatePhone('+1234567890')).toBe(true);
            expect(validatePhone('13812345678')).toBe(true);
            expect(validatePhone('010-12345678')).toBe(true);
            expect(validatePhone('(010) 1234 5678')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(validatePhone('invalid')).toBe(false);
            expect(validatePhone('123')).toBe(false);
            expect(validatePhone('12')).toBe(false); // 测试长度<3的情况
        });
    });

    describe('validateURL', () => {
        it('should validate URLs', () => {
            expect(validateURL('https://www.example.com')).toBe(true);
            expect(validateURL('http://localhost:3000')).toBe(true);
            expect(validateURL('ftp://files.example.com')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(validateURL('invalid')).toBe(false);
            expect(validateURL('http://')).toBe(false);
        });
    });

    describe('validateIPv4', () => {
        it('should validate IPv4 addresses', () => {
            expect(validateIPv4('192.168.1.1')).toBe(true);
            expect(validateIPv4('127.0.0.1')).toBe(true);
            expect(validateIPv4('255.255.255.255')).toBe(true);
        });

        it('should reject invalid IPv4 addresses', () => {
            expect(validateIPv4('256.1.1.1')).toBe(false);
            expect(validateIPv4('192.168.1')).toBe(false);
            expect(validateIPv4('invalid')).toBe(false);
        });
    });

    describe('validateIPv6', () => {
        it('should validate IPv6 addresses', () => {
            expect(validateIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
            expect(validateIPv6('::1')).toBe(true);
            expect(validateIPv6('fe80::1')).toBe(true);
        });

        it('should reject invalid IPv6 addresses', () => {
            expect(validateIPv6('invalid')).toBe(false);
        });
    });

    describe('validateMAC', () => {
        it('should validate MAC addresses', () => {
            expect(validateMAC('00:1A:2B:3C:4D:5E')).toBe(true);
            expect(validateMAC('00-1A-2B-3C-4D-5E')).toBe(true);
        });

        it('should reject invalid MAC addresses', () => {
            expect(validateMAC('invalid')).toBe(false);
            expect(validateMAC('00:1A:2B:3C:4D')).toBe(false);
        });
    });

    describe('validateHexColor', () => {
        it('should validate hex color values', () => {
            expect(validateHexColor('#FF0000')).toBe(true);
            expect(validateHexColor('#f00')).toBe(true);
            expect(validateHexColor('FFFFFF')).toBe(true);
            expect(validateHexColor('#FFFFFFFF')).toBe(true);
        });

        it('should reject invalid hex colors', () => {
            expect(validateHexColor('invalid')).toBe(false);
            expect(validateHexColor('#GGGGGG')).toBe(false);
        });
    });

    describe('validateRGBColor', () => {
        it('should validate RGB color values', () => {
            expect(validateRGBColor('rgb(255, 0, 0)')).toBe(true);
            expect(validateRGBColor('rgb(0, 255, 0)')).toBe(true);
            expect(validateRGBColor('rgb( 100 , 100 , 100 )')).toBe(true);
        });

        it('should reject invalid RGB colors', () => {
            expect(validateRGBColor('rgb(256, 0, 0)')).toBe(false);
            expect(validateRGBColor('rgb(-1, 0, 0)')).toBe(false);
            expect(validateRGBColor('invalid')).toBe(false);
            // 测试正则表达式不匹配的情况
            expect(validateRGBColor('rgb(255, 0)')).toBe(false); // 缺少一个值
            expect(validateRGBColor('rgb(255, 0, 0, 0)')).toBe(false); // 多了一个值
        });
    });

    describe('validateRGBAColor', () => {
        it('should validate RGBA color values', () => {
            expect(validateRGBAColor('rgba(255, 0, 0, 1)')).toBe(true);
            expect(validateRGBAColor('rgba(0, 0, 255, 0.5)')).toBe(true);
            expect(validateRGBAColor('rgba(100, 100, 100, 0)')).toBe(true);
        });

        it('should reject invalid RGBA colors', () => {
            expect(validateRGBAColor('rgba(256, 0, 0, 1)')).toBe(false);
            expect(validateRGBAColor('rgba(255, 0, 0, 2)')).toBe(false);
            expect(validateRGBAColor('invalid')).toBe(false);
            // 测试正则表达式不匹配的情况
            expect(validateRGBAColor('rgba(255, 0, 0)')).toBe(false); // 缺少alpha值
            expect(validateRGBAColor('rgba(255, 0, 0, 1, 0)')).toBe(false); // 多了一个值
        });
    });

    describe('validateUsername', () => {
        it('should validate usernames with default options', () => {
            expect(validateUsername('user123')).toBe(true);
            expect(validateUsername('user_name')).toBe(true);
            expect(validateUsername('user-name')).toBe(true);
        });

        it('should respect validation options', () => {
            expect(validateUsername('123user', { startWithLetter: false })).toBe(true);
            expect(validateUsername('user123', { allowDigits: false })).toBe(false);
            expect(validateUsername('ab', { minLength: 3 })).toBe(false);
            expect(validateUsername('verylongusername', { maxLength: 10 })).toBe(false);

            // 测试 allowDot 选项
            expect(validateUsername('user.name', { allowDot: true })).toBe(true);
            expect(validateUsername('user.name', { allowDot: false })).toBe(false);

            // 测试 allowAt 选项
            expect(validateUsername('user@domain', { allowAt: true })).toBe(true);
            expect(validateUsername('user@domain', { allowAt: false })).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should validate passwords with default options', () => {
            expect(validatePassword('Password123')).toBe(true);
            expect(validatePassword('StrongPass1')).toBe(true);
        });

        it('should respect password validation options', () => {
            expect(
                validatePassword('password', {
                    requireUppercase: false,
                    requireDigits: false,
                })
            ).toBe(true);

            expect(
                validatePassword('PASSWORD123', {
                    requireLowercase: false,
                })
            ).toBe(true);

            // 测试 requireSpecial 选项
            expect(
                validatePassword('Password123!', {
                    requireSpecial: true,
                })
            ).toBe(true);

            expect(
                validatePassword('Password123', {
                    requireSpecial: true,
                })
            ).toBe(false);
        });

        it('should reject weak passwords', () => {
            expect(validatePassword('weak')).toBe(false);
            expect(validatePassword('password')).toBe(false);
            expect(validatePassword('PASSWORD')).toBe(false);
        });
    });

    describe('validateChineseID', () => {
        it('should validate Chinese ID numbers', () => {
            // 使用确定有效的身份证号码示例
            expect(validateChineseID('11010519491231002X')).toBe(true);
            expect(validateChineseID('440524188001010014')).toBe(true);
        });

        it('should reject invalid Chinese IDs', () => {
            expect(validateChineseID('110101199001013517')).toBe(false); // 校验位错误
            expect(validateChineseID('110105194912310013')).toBe(false); // 校验位错误
            expect(validateChineseID('invalid')).toBe(false);
            expect(validateChineseID('11010119900101351')).toBe(false); // 长度不够
            expect(validateChineseID('1101011990010135145')).toBe(false); // 长度过长
        });

        // 添加这一部分来测试非字符串输入
        it('should return false for non-string inputs', () => {
            expect(validateChineseID(null as any)).toBe(false);
            expect(validateChineseID(undefined as any)).toBe(false);
            expect(validateChineseID(123456789012345678 as any)).toBe(false);
            expect(validateChineseID({} as any)).toBe(false);
            expect(validateChineseID([] as any)).toBe(false);
        });
    });
    describe('validateChinesePostcode', () => {
        it('should validate Chinese postcodes', () => {
            expect(validateChinesePostcode('100000')).toBe(true);
            expect(validateChinesePostcode('518000')).toBe(true);
        });

        it('should reject invalid postcodes', () => {
            expect(validateChinesePostcode('000000')).toBe(false);
            expect(validateChinesePostcode('12345')).toBe(false);
        });
    });

    // 修改 patterns.test.ts 中的 validateDateTime 测试用例
    describe('validateDateTime', () => {
        it('should validate valid dates', () => {
            // 字符串格式
            expect(validateDateTime('2023-01-01')).toBe(true);
            expect(validateDateTime('2023-01-01 12:30:45')).toBe(true);
            expect(validateDateTime('2023-01-01T12:30:45Z')).toBe(true);
            expect(validateDateTime('Sun, 01 Jan 2023 00:00:00 GMT')).toBe(true);

            // 时间戳
            expect(validateDateTime(1672531200000)).toBe(true); // 毫秒时间戳
            expect(validateDateTime(1672531200)).toBe(true); // 秒时间戳

            // Date 对象
            expect(validateDateTime(new Date('2023-01-01'))).toBe(true);
            expect(validateDateTime(new Date())).toBe(true);
        });

        it('should reject invalid dates', () => {
            // 无效字符串
            expect(validateDateTime('invalid-date')).toBe(false);
            expect(validateDateTime('')).toBe(false);
            expect(validateDateTime('not-a-date')).toBe(false);

            // 无效数字
            expect(validateDateTime(NaN)).toBe(false);
            expect(validateDateTime(Infinity)).toBe(false);
            expect(validateDateTime(-Infinity)).toBe(false);

            // 无效对象
            expect(validateDateTime(null)).toBe(false);
            expect(validateDateTime(undefined)).toBe(false);
            expect(validateDateTime({})).toBe(false);
            expect(validateDateTime([])).toBe(false);

            // 无效 Date 对象
            expect(validateDateTime(new Date('invalid'))).toBe(false);
            expect(validateDateTime(new Date(NaN))).toBe(false);
        });

        it('should handle edge cases', () => {
            // 边界日期
            expect(validateDateTime('1970-01-01')).toBe(true);
            expect(validateDateTime(0)).toBe(true);
            expect(validateDateTime(new Date(0))).toBe(true);

            // 负数时间戳（早期日期）
            expect(validateDateTime(-86400000)).toBe(true); // 1969-12-31

            // 非常大的数值（这些实际上可能仍被视为有效日期）
            expect(validateDateTime(9999999999999)).toBe(true); // 远未来日期
            // 移除或修改这个测试，因为非常大的数值在 JavaScript 中可能仍被视为有效
            // 我们可以测试一个更明显的无效值
            expect(validateDateTime(new Date(NaN))).toBe(false); // 明确的无效日期
        });
    });
    describe('validateJSONString', () => {
        it('should validate JSON strings', () => {
            expect(validateJSONString('{"key": "value"}')).toBe(true);
            expect(validateJSONString('[1, 2, 3]')).toBe(true);
            expect(validateJSONString('"string"')).toBe(true);
        });

        it('should reject invalid JSON', () => {
            expect(validateJSONString('invalid')).toBe(false);
            expect(validateJSONString('{key: value}')).toBe(false);
        });
    });

    describe('validateBase64', () => {
        it('should validate Base64 strings', () => {
            expect(validateBase64('dGVzdA==')).toBe(true);
            expect(validateBase64('SGVsbG8gV29ybGQ=')).toBe(true);
        });

        it('should reject invalid Base64', () => {
            expect(validateBase64('invalid!')).toBe(false);
        });
    });

    describe('validateUUID', () => {
        it('should validate UUIDs', () => {
            expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
            expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
        });

        it('should reject invalid UUIDs', () => {
            expect(validateUUID('invalid')).toBe(false);
            expect(validateUUID('550e8400-e29b-41d4-a716-44665544000G')).toBe(false);
        });
    });

    describe('validateCreditCard', () => {
        it('should validate credit card numbers', () => {
            // Using test numbers from https://developer.paypal.com/docs/payflow/payflow-pro/payflow-pro-testing/
            expect(validateCreditCard('4111111111111111')).toBe(true); // Visa
            expect(validateCreditCard('5555555555554444')).toBe(true); // Mastercard
            expect(validateCreditCard('378282246310005')).toBe(true); // American Express
        });

        it('should reject invalid credit card numbers', () => {
            expect(validateCreditCard('1234567890123456')).toBe(false);
            expect(validateCreditCard('invalid')).toBe(false);
        });

        it('should handle formatted card numbers', () => {
            expect(validateCreditCard('4111-1111-1111-1111')).toBe(true);
            expect(validateCreditCard('4111 1111 1111 1111')).toBe(true);
        });
    });

    describe('createPatternValidator', () => {
        it('should create a custom pattern validator', () => {
            const validator = createPatternValidator(/^[A-Z]+$/, { caseSensitive: true });
            expect(validator('HELLO')).toBe(true);
            expect(validator('Hello')).toBe(false);
        });

        it('should work with string patterns', () => {
            const validator = createPatternValidator('^[0-9]+$');
            expect(validator('12345')).toBe(true);
            expect(validator('abcde')).toBe(false);
        });

        it('should support various regex options', () => {
            // 测试 multiline 选项
            const multilineValidator = createPatternValidator('^line2$', { multiline: true });
            const multilineText = `line1
line2
line3`;
            expect(multilineValidator(multilineText)).toBe(true);

            // 测试 ignoreCase 选项
            const caseInsensitiveValidator = createPatternValidator('hello', { ignoreCase: true });
            expect(caseInsensitiveValidator('HELLO')).toBe(true);
            expect(caseInsensitiveValidator('Hello')).toBe(true);

            // 测试 sticky 选项
            const stickyValidator = createPatternValidator('hello', { sticky: true });
            expect(stickyValidator('hello world')).toBe(true);
            expect(stickyValidator('world hello')).toBe(false);

            // 测试 global 选项
            const globalValidator = createPatternValidator('hello', { global: true });
            expect(globalValidator('hello world hello')).toBe(true);
        });
    });
});
