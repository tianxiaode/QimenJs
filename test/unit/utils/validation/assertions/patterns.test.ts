// patterns.test.ts
import {
    assertPattern,
    assertEmail,
    assertPhone,
    assertURL,
    assertIPv4,
    assertIPv6,
    assertMAC,
    assertHexColor,
    assertRGBColor,
    assertRGBAColor,
    assertUsername,
    assertPassword,
    assertChineseID,
    assertChinesePostcode,
    assertDateTime,
    assertJSONString,
    assertBase64,
    assertUUID,
    assertCreditCard,
    createPatternAssert,
    createUsernameAssert,
    createPasswordAssert,
    assertPatterns,
    conditionalPatternAssert,
    patternValidationChain,
    createPatternValidationChainAssert,
    InvalidInputError,
} from '@orbitjs/utils';

describe('Pattern Assertions', () => {
    describe('assertPattern', () => {
        it('should pass for valid pattern match', () => {
            expect(() => assertPattern('hello123', /^[a-z]+[0-9]+$/)).not.toThrow();
        });

        it('should throw for invalid pattern match', () => {
            expect(() => assertPattern('hello', /^[0-9]+$/)).toThrow(InvalidInputError);
        });
    });

    describe('assertEmail', () => {
        it('should pass for valid email', () => {
            expect(() => assertEmail('test@example.com')).not.toThrow();
        });

        it('should throw for invalid email', () => {
            expect(() => assertEmail('invalid.email')).toThrow(InvalidInputError);
        });

        it('should throw EMAIL_INVALID for non-string values', () => {
            expect(() => assertEmail(123)).toThrow(InvalidInputError);
        });
    });

    describe('assertPhone', () => {
        it('should pass for valid phone number', () => {
            expect(() => assertPhone('+86-138-0000-0000')).not.toThrow();
        });

        it('should throw for invalid phone number', () => {
            expect(() => assertPhone('invalid-phone')).toThrow(InvalidInputError);
        });

        it('should throw PHONE_INVALID for non-string values', () => {
            expect(() => assertPhone(123)).toThrow(InvalidInputError);
        });
    });

    describe('assertURL', () => {
        it('should pass for valid URL', () => {
            expect(() => assertURL('https://example.com')).not.toThrow();
        });

        it('should throw for invalid URL', () => {
            expect(() => assertURL('not-a-url')).toThrow(InvalidInputError);
        });

        it('should throw URL_INVALID for non-string values', () => {
            expect(() => assertURL(123)).toThrow(InvalidInputError);
        });
    });

    describe('IP Address Assertions', () => {
        it('should validate IPv4 addresses', () => {
            expect(() => assertIPv4('192.168.1.1')).not.toThrow();
            expect(() => assertIPv4('invalid-ip')).toThrow(InvalidInputError);
            expect(() => assertIPv4(123)).toThrow(InvalidInputError);
        });

        it('should validate IPv6 addresses', () => {
            expect(() => assertIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).not.toThrow();
            expect(() => assertIPv6('invalid-ip')).toThrow(InvalidInputError);
            expect(() => assertIPv6(123)).toThrow(InvalidInputError);
        });
    });

    describe('MAC Address Assertion', () => {
        it('should validate MAC addresses', () => {
            expect(() => assertMAC('00:1A:2B:3C:4D:5E')).not.toThrow();
            expect(() => assertMAC('invalid-mac')).toThrow(InvalidInputError);
            expect(() => assertMAC(123)).toThrow(InvalidInputError);
        });
    });

    describe('Color Assertions', () => {
        it('should validate hex colors', () => {
            expect(() => assertHexColor('#FF5733')).not.toThrow();
            expect(() => assertHexColor('invalid-color')).toThrow(InvalidInputError);
            expect(() => assertHexColor(123)).toThrow(InvalidInputError);
        });

        it('should validate RGB colors', () => {
            expect(() => assertRGBColor('rgb(255, 0, 0)')).not.toThrow();
            expect(() => assertRGBColor('invalid-rgb')).toThrow(InvalidInputError);
            expect(() => assertRGBColor(123)).toThrow(InvalidInputError);
        });

        it('should validate RGBA colors', () => {
            expect(() => assertRGBAColor('rgba(255, 0, 0, 0.5)')).not.toThrow();
            expect(() => assertRGBAColor('invalid-rgba')).toThrow(InvalidInputError);
            expect(() => assertRGBAColor(123)).toThrow(InvalidInputError);
        });
    });

    describe('assertUsername', () => {
        it('should pass for valid username', () => {
            expect(() => assertUsername('user_name')).not.toThrow();
        });

        it('should throw for invalid username', () => {
            expect(() => assertUsername('ab')) // Too short
                .toThrow(InvalidInputError);
        });

        it('should respect custom options', () => {
            expect(() => assertUsername('a1', { minLength: 2 })).not.toThrow();
            expect(() => assertUsername('user@domain', { allowAt: true })).not.toThrow();
        });

        it('should throw USERNAME_INVALID for non-string values', () => {
            expect(() => assertUsername(123)).toThrow(InvalidInputError);
        });
    });

    describe('assertPassword', () => {
        it('should pass for valid password', () => {
            expect(() => assertPassword('MyPass123')).not.toThrow();
        });

        it('should throw for invalid password', () => {
            expect(() => assertPassword('weak')).toThrow(InvalidInputError);
        });

        it('should respect custom requirements', () => {
            expect(() =>
                assertPassword('mypassword', {
                    requireUppercase: false,
                    requireDigits: false,
                })
            ).not.toThrow();
        });

        // 新增测试用例来覆盖"未知原因"的代码路径
        it('should throw PASSWORD_INVALID for unknown reasons', () => {
            const customPasswordAssert = createPasswordAssert({
                minLength: 10,
                requireUppercase: true,
                requireLowercase: true,
                requireDigits: true,
                requireSpecial: true,
            });

            expect(() => customPasswordAssert('aaaaaaaaaa')).toThrow(InvalidInputError);
        });
    });

    describe('ID and Postcode Assertions', () => {
        // Skip Chinese ID test due to unknown valid test data
        it('should validate Chinese ID', () => {
            // TODO: Find a valid Chinese ID test case or check validation implementation
            expect(() => assertChineseID('11010519491231002X')).not.toThrow();
            expect(() => assertChineseID('invalid-id')).toThrow(InvalidInputError);
            expect(() => assertChineseID(123)).toThrow(InvalidInputError);
        });

        it('should validate Chinese postcode', () => {
            expect(() => assertChinesePostcode('100000')).not.toThrow();
            expect(() => assertChinesePostcode('invalid-postcode')).toThrow(InvalidInputError);
            expect(() => assertChinesePostcode(123)).toThrow(InvalidInputError);
        });
    });

    describe('assertDateTime', () => {
        it('should pass for valid datetime values', () => {
            expect(() => assertDateTime('2023-01-01')).not.toThrow();
            expect(() => assertDateTime('2023-01-01 12:30:45')).not.toThrow();
            expect(() => assertDateTime('2023-01-01T12:30:45Z')).not.toThrow();
            expect(() => assertDateTime(1672531200000)).not.toThrow(); // 时间戳
            expect(() => assertDateTime(new Date())).not.toThrow();
        });

        it('should throw for invalid datetime values', () => {
            expect(() => assertDateTime('invalid-date')).toThrow(InvalidInputError);
            expect(() => assertDateTime('not-a-date')).toThrow(InvalidInputError);
            expect(() => assertDateTime(null)).toThrow(InvalidInputError);
            expect(() => assertDateTime(undefined)).toThrow(InvalidInputError);
            expect(() => assertDateTime(NaN)).toThrow(InvalidInputError);
        });
    });

    describe('Data Format Assertions', () => {
        it('should validate JSON strings', () => {
            expect(() => assertJSONString('{"key": "value"}')).not.toThrow();
            expect(() => assertJSONString('invalid-json')).toThrow(InvalidInputError);
            expect(() => assertJSONString(123)).toThrow(InvalidInputError);
        });

        it('should validate Base64 strings', () => {
            expect(() => assertBase64('dGVzdA==')).not.toThrow();
            expect(() => assertBase64('invalid-base64')).toThrow(InvalidInputError);
            expect(() => assertBase64(123)).toThrow(InvalidInputError);
        });

        it('should validate UUIDs', () => {
            expect(() => assertUUID('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
            expect(() => assertUUID('invalid-uuid')).toThrow(InvalidInputError);
            expect(() => assertUUID(123)).toThrow(InvalidInputError);
        });

        it('should validate credit cards', () => {
            // Using a known test credit card number
            expect(() => assertCreditCard('4111111111111111')).not.toThrow();
            expect(() => assertCreditCard('invalid-card')).toThrow(InvalidInputError);
            expect(() => assertCreditCard(123)).toThrow(InvalidInputError);
        });
    });

    describe('Factory Functions', () => {
        it('should create pattern assert function', () => {
            const emailAssert = createPatternAssert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            expect(() => emailAssert('test@example.com')).not.toThrow();
            expect(() => emailAssert('invalid-email')).toThrow(InvalidInputError);
            expect(() => emailAssert(123)).toThrow(InvalidInputError);
        });

        it('should create username assert function', () => {
            const strictUsernameAssert = createUsernameAssert({
                minLength: 5,
                allowHyphen: false,
            });
            expect(() => strictUsernameAssert('username')).not.toThrow();
            expect(() => strictUsernameAssert('user-name')).toThrow(InvalidInputError);
            expect(() => strictUsernameAssert(123)).toThrow(InvalidInputError);
        });

        it('should create password assert function', () => {
            const simplePasswordAssert = createPasswordAssert({
                minLength: 1,
                requireSpecial: false,
                requireUppercase: false,
                requireLowercase: false,
                requireDigits: false,
            });
            expect(() => simplePasswordAssert('pass123')).not.toThrow();
            // For non-string input, it should throw a type error
            expect(() => simplePasswordAssert(123)).toThrow(InvalidInputError);
        });

        it('should handle string pattern correctly in created assert function', () => {
            const patternAssert: any = createPatternAssert('^[a-z]+$');
            try {
                patternAssert('123');
            } catch (error: any) {
                expect(error).toBeInstanceOf(InvalidInputError);
                // 错误信息中应该包含字符串 pattern
                expect(error.message).toContain('^[a-z]+$');
            }
        });

        
    });

    describe('Composite Assertions', () => {
        it('should validate multiple assertions with assertPatterns', () => {
            const assertions = [
                (v: any) => assertPattern(v, /^[a-zA-Z0-9]+$/),
                (v: any) => assertPattern(v, /.{5,}/),
            ];

            expect(() => assertPatterns('valid123', assertions)).not.toThrow();

            expect(() => assertPatterns('inv', assertions)).toThrow(InvalidInputError);
        });

        it('should conditionally validate with conditionalPatternAssert', () => {
            const assertIsLong = (v: any) => assertPattern(v, /.{10,}/);

            expect(() =>
                conditionalPatternAssert(true, assertIsLong, 'very-long-string')
            ).not.toThrow();

            expect(() => conditionalPatternAssert(false, assertIsLong, 'short')).not.toThrow(); // Should not execute assertion

            expect(() => conditionalPatternAssert(true, assertIsLong, 'short')).toThrow(
                InvalidInputError
            );
        });

        it('should validate chain with patternValidationChain', () => {
            const validators = [(v: string) => v.length > 5, (v: string) => /[0-9]/.test(v)];

            expect(patternValidationChain('valid1', validators)).toBe(true);
            expect(patternValidationChain('invalid', validators)).toBe(false);
        });

        it('should create pattern validation chain assert', () => {
            const validators = [(v: string) => v.length > 5, (v: string) => /[0-9]/.test(v)];

            const chainAssert = createPatternValidationChainAssert(validators);

            expect(() => chainAssert('valid1')).not.toThrow();
            expect(() => chainAssert('invalid')).toThrow(InvalidInputError);
            expect(() => chainAssert(123)).toThrow(InvalidInputError);
        });
    });

    describe('Additional Coverage Tests', () => {
        it('should cover username maxLength validation', () => {
            // 测试超过默认最大长度(20)的用户名
            const longUsername = 'a'.repeat(21);
            expect(() => assertUsername(longUsername)).toThrow(InvalidInputError);
        });

        it('should cover createUsernameAssert function completely', () => {
            const customUsernameAssert = createUsernameAssert({
                minLength: 3,
                maxLength: 10,
                allowDigits: false,
            });

            expect(() => customUsernameAssert('abc')).not.toThrow();
            expect(() => customUsernameAssert('ab')).toThrow(InvalidInputError); // 太短
            expect(() => customUsernameAssert('a'.repeat(11))).toThrow(InvalidInputError); // 太长
            expect(() => customUsernameAssert('a1')).toThrow(InvalidInputError); // 包含数字，不允许
            expect(() => customUsernameAssert(123)).toThrow(InvalidInputError); // 非字符串
        });

        it('should cover all password requirement checks', () => {
            // 测试缺少大写字母的情况
            expect(() =>
                assertPassword('mypassword123', {
                    requireUppercase: true,
                    requireLowercase: false,
                    requireDigits: false,
                    requireSpecial: false,
                })
            ).toThrow(InvalidInputError);

            // 测试缺少小写字母的情况
            expect(() =>
                assertPassword('MYPASSWORD123', {
                    requireUppercase: false,
                    requireLowercase: true,
                    requireDigits: false,
                    requireSpecial: false,
                })
            ).toThrow(InvalidInputError);

            // 测试缺少数字的情况
            expect(() =>
                assertPassword('MyPassword', {
                    requireUppercase: false,
                    requireLowercase: false,
                    requireDigits: true,
                    requireSpecial: false,
                })
            ).toThrow(InvalidInputError);

            // 测试缺少特殊字符的情况
            expect(() =>
                assertPassword('MyPassword123', {
                    requireUppercase: false,
                    requireLowercase: false,
                    requireDigits: false,
                    requireSpecial: true,
                })
            ).toThrow(InvalidInputError);
        });

        it('should cover factory functions type checking', () => {
            // createPatternAssert 类型检查
            const patternAssert = createPatternAssert(/test/);
            expect(() => patternAssert(123)).toThrow(InvalidInputError);

            // createPasswordAssert 类型检查
            const passwordAssert = createPasswordAssert();
            expect(() => passwordAssert(123)).toThrow(InvalidInputError);
        });

        it('should cover edge cases in composite functions', () => {
            // 测试 patternValidationChain 的失败情况
            const validators = [(v: string) => v.length > 5, (v: string) => /[0-9]/.test(v)];

            expect(patternValidationChain('123', validators)).toBe(false); // 不满足第一个条件
            expect(patternValidationChain('abcdef', validators)).toBe(false); // 不满足第二个条件

            // 测试 createPatternValidationChainAssert 失败情况
            const chainAssert = createPatternValidationChainAssert(validators);
            expect(() => chainAssert('123')).toThrow(InvalidInputError);
            expect(() => chainAssert('abcdef')).toThrow(InvalidInputError);
            expect(() => chainAssert(123)).toThrow(InvalidInputError);
        });
    });

    describe('assertPattern', () => {
        it('should pass for valid pattern match', () => {
            expect(() => assertPattern('hello123', /^[a-z]+[0-9]+$/)).not.toThrow();
        });

        it('should throw for invalid pattern match', () => {
            expect(() => assertPattern('hello', /^[0-9]+$/)).toThrow(InvalidInputError);
        });

        // 添加测试用例覆盖 patternText 的不同情况
        it('should handle RegExp pattern correctly', () => {
            try {
                assertPattern('invalid', /^[a-z]+[0-9]+$/);
            } catch (error: any) {
                expect(error).toBeInstanceOf(InvalidInputError);
                // 错误信息中应该包含正则表达式的 source
                expect(error.message).toContain('^[a-z]+[0-9]+$');
            }
        });

        it('should handle string pattern correctly', () => {
            try {
                assertPattern('invalid', '^[a-z]+[0-9]+$');
            } catch (error: any) {
                expect(error).toBeInstanceOf(InvalidInputError);
                // 错误信息中应该包含字符串 pattern
                expect(error.message).toContain('^[a-z]+[0-9]+$');
            }
        });
    });
});
