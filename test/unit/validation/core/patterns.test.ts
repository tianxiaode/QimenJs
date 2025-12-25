import {
    EMAIL_PATTERN,
    URL_PATTERN,
    IPV4_PATTERN,
    IPV6_PATTERN,
    MAC_ADDRESS_PATTERN,
    PHONE_PATTERN,
    UUID_PATTERN,
    BASE64_PATTERN,
    HEX_COLOR_PATTERN,
    RGB_COLOR_PATTERN,
    RGBA_COLOR_PATTERN,
    CREDIT_CARD_PATTERN,
    CHINESE_ID_PATTERN,
    CHINESE_POSTCODE_PATTERN,
    USERNAME_PATTERN,
    UPPERCASE_PATTERN,
    LOWERCASE_PATTERN,
    DIGIT_PATTERN,
    SPECIAL_CHAR_PATTERN,
    ValidationPatternType,
    getValidationPattern,
    setValidationPattern,
} from '@/validation';

describe('Validation Patterns', () => {
    describe('EMAIL_PATTERN', () => {
        test('should match valid email addresses', () => {
            expect(EMAIL_PATTERN.test('test@example.com')).toBe(true);
            expect(EMAIL_PATTERN.test('user.name@domain.co.uk')).toBe(true);
            expect(EMAIL_PATTERN.test('user+tag@example.org')).toBe(true);
            expect(EMAIL_PATTERN.test('user123@test-domain.com')).toBe(true);
        });

        test('should not match invalid email addresses', () => {
            expect(EMAIL_PATTERN.test('invalid.email')).toBe(false);
            expect(EMAIL_PATTERN.test('@example.com')).toBe(false);
            expect(EMAIL_PATTERN.test('user@')).toBe(false);
            expect(EMAIL_PATTERN.test('user@.com')).toBe(false);
        });
    });

    describe('URL_PATTERN', () => {
        test('should match valid URLs', () => {
            expect(URL_PATTERN.test('http://example.com')).toBe(true);
            expect(URL_PATTERN.test('https://www.example.com')).toBe(true);
            expect(URL_PATTERN.test('ftp://files.example.com')).toBe(true);
            expect(URL_PATTERN.test('https://example.com/path/to/page')).toBe(true);
        });

        test('should not match invalid URLs', () => {
            expect(URL_PATTERN.test('invalid-url')).toBe(false);
            expect(URL_PATTERN.test('http://')).toBe(false);
            expect(URL_PATTERN.test('example.com')).toBe(false);
        });
    });

    describe('IPV4_PATTERN', () => {
        test('should match valid IPv4 addresses', () => {
            expect(IPV4_PATTERN.test('192.168.1.1')).toBe(true);
            expect(IPV4_PATTERN.test('10.0.0.1')).toBe(true);
            expect(IPV4_PATTERN.test('255.255.255.255')).toBe(true);
            expect(IPV4_PATTERN.test('0.0.0.0')).toBe(true);
        });

        test('should not match invalid IPv4 addresses', () => {
            expect(IPV4_PATTERN.test('256.1.1.1')).toBe(false);
            expect(IPV4_PATTERN.test('192.168.1')).toBe(false);
            expect(IPV4_PATTERN.test('192.168.1.1.1')).toBe(false);
        });
    });

    describe('IPV6_PATTERN', () => {
        test('should match valid IPv6 addresses', () => {
            expect(IPV6_PATTERN.test('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
            expect(IPV6_PATTERN.test('2001:db8:85a3:0:0:8a2e:370:7334')).toBe(true);
            expect(IPV6_PATTERN.test('2001:db8::1')).toBe(true); // This won't match as our pattern is strict
        });

        test('should not match invalid IPv6 addresses', () => {
            expect(IPV6_PATTERN.test('2001:0db8:85a3:0000:0000:8a2e:0370')).toBe(false);
            expect(IPV6_PATTERN.test('gggg:gggg:gggg:gggg:gggg:gggg:gggg:gggg')).toBe(false);
        });
    });

    describe('MAC_ADDRESS_PATTERN', () => {
        test('should match valid MAC addresses', () => {
            expect(MAC_ADDRESS_PATTERN.test('00:11:22:33:44:55')).toBe(true);
            expect(MAC_ADDRESS_PATTERN.test('aa:bb:cc:dd:ee:ff')).toBe(true);
            expect(MAC_ADDRESS_PATTERN.test('00-11-22-33-44-55')).toBe(true);
            expect(MAC_ADDRESS_PATTERN.test('AA:BB:CC:DD:EE:FF')).toBe(true);
        });

        test('should not match invalid MAC addresses', () => {
            expect(MAC_ADDRESS_PATTERN.test('00:11:22:33:44')).toBe(false);
            expect(MAC_ADDRESS_PATTERN.test('00:11:22:33:44:55:66')).toBe(false);
            expect(MAC_ADDRESS_PATTERN.test('00:11:22:33:44:gg')).toBe(false);
        });
    });

    describe('PHONE_PATTERN', () => {
        test('should match valid phone numbers', () => {
            expect(PHONE_PATTERN.test('+1234567890')).toBe(true);
            expect(PHONE_PATTERN.test('1234567890')).toBe(true);
            expect(PHONE_PATTERN.test('+1234567890123456')).toBe(true);
        });

        test('should not match invalid phone numbers', () => {
            expect(PHONE_PATTERN.test('+')).toBe(false);
            expect(PHONE_PATTERN.test('')).toBe(false);
            expect(PHONE_PATTERN.test('0')).toBe(false);
            expect(PHONE_PATTERN.test('+12345678901234567')).toBe(false);
        });
    });

    describe('UUID_PATTERN', () => {
        test('should match valid UUIDs', () => {
            expect(UUID_PATTERN.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
            expect(UUID_PATTERN.test('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
        });

        test('should not match invalid UUIDs', () => {
            expect(UUID_PATTERN.test('550e8400e29b41d4a716446655440000')).toBe(false); // missing all dashes
            expect(UUID_PATTERN.test('invalid-uuid')).toBe(false);
            expect(UUID_PATTERN.test('550e8400-e29b-41d4-a716-44665544000')).toBe(false); // too short
            expect(UUID_PATTERN.test('550e8400-e29b-41d4-a716-4466554400000')).toBe(false); // too long
        });
    });

    describe('BASE64_PATTERN', () => {
        test('should match valid Base64 strings', () => {
            expect(BASE64_PATTERN.test('SGVsbG8gV29ybGQ=')).toBe(true);
            expect(BASE64_PATTERN.test('YWJjZGVm')).toBe(true);
            expect(BASE64_PATTERN.test('')).toBe(true);
        });

        test('should not match invalid Base64 strings', () => {
            expect(BASE64_PATTERN.test('Invalid#Base64')).toBe(false);
            expect(BASE64_PATTERN.test('SGVsbG8gV29ybGQ')).toBe(false); // missing padding
        });
    });

    describe('HEX_COLOR_PATTERN', () => {
        test('should match valid hex color values', () => {
            expect(HEX_COLOR_PATTERN.test('#ff0000')).toBe(true);
            expect(HEX_COLOR_PATTERN.test('#FF0000')).toBe(true);
            expect(HEX_COLOR_PATTERN.test('#f00')).toBe(true);
            expect(HEX_COLOR_PATTERN.test('#F00')).toBe(true);
        });

        test('should not match invalid hex color values', () => {
            expect(HEX_COLOR_PATTERN.test('#gg0000')).toBe(false);
            expect(HEX_COLOR_PATTERN.test('#00000')).toBe(false);
            expect(HEX_COLOR_PATTERN.test('#0000000')).toBe(false);
        });
    });

    describe('RGB_COLOR_PATTERN', () => {
        test('should match valid RGB color values', () => {
            expect(RGB_COLOR_PATTERN.test('rgb(255, 255, 255)')).toBe(true);
            expect(RGB_COLOR_PATTERN.test('rgb(0,0,0)')).toBe(true);
            expect(RGB_COLOR_PATTERN.test('rgb( 100 , 150 , 200 )')).toBe(true);
        });

        test('should not match invalid RGB color values', () => {
            expect(RGB_COLOR_PATTERN.test('rgb(256, 0, 0)')).toBe(false);
            expect(RGB_COLOR_PATTERN.test('rgb(-1, 0, 0)')).toBe(false);
            expect(RGB_COLOR_PATTERN.test('rgb(255, 255)')).toBe(false);
        });
    });

    describe('RGBA_COLOR_PATTERN', () => {
        test('should match valid RGBA color values', () => {
            expect(RGBA_COLOR_PATTERN.test('rgba(255, 255, 255, 1)')).toBe(true);
            expect(RGBA_COLOR_PATTERN.test('rgba(0, 0, 0, 0.5)')).toBe(true);
            expect(RGBA_COLOR_PATTERN.test('rgba(100, 150, 200, 0)')).toBe(true);
            expect(RGBA_COLOR_PATTERN.test('rgba(100, 150, 200, 0.75)')).toBe(true);
        });

        test('should not match invalid RGBA color values', () => {
            expect(RGBA_COLOR_PATTERN.test('rgba(255, 255, 255, 1.5)')).toBe(false);
            expect(RGBA_COLOR_PATTERN.test('rgba(255, 255, 255)')).toBe(false);
            expect(RGBA_COLOR_PATTERN.test('rgba(256, 0, 0, 1)')).toBe(false);
        });
    });

    describe('CREDIT_CARD_PATTERN', () => {
        test('should match valid credit card numbers', () => {
            expect(CREDIT_CARD_PATTERN.test('123456789012345')).toBe(true);
            expect(CREDIT_CARD_PATTERN.test('1234 5678 9012 3456')).toBe(true);
            expect(CREDIT_CARD_PATTERN.test('1234-5678-9012-3456')).toBe(true);
        });

        test('should not match invalid credit card numbers', () => {
            expect(CREDIT_CARD_PATTERN.test('12345')).toBe(false);
            expect(CREDIT_CARD_PATTERN.test('1234567890123456789')).toBe(false);
        });
    });

    describe('CHINESE_ID_PATTERN', () => {
        test('should match valid Chinese ID numbers', () => {
            expect(CHINESE_ID_PATTERN.test('110101199001011234')).toBe(true);
            expect(CHINESE_ID_PATTERN.test('11010119900101123X')).toBe(true);
            expect(CHINESE_ID_PATTERN.test('123456789012345')).toBe(true);
        });

        test('should not match invalid Chinese ID numbers', () => {
            expect(CHINESE_ID_PATTERN.test('12345678901234')).toBe(false); // too short
            expect(CHINESE_ID_PATTERN.test('1234567890123456')).toBe(false); // too long
            expect(CHINESE_ID_PATTERN.test('123456789012345X')).toBe(false); // X in wrong place
        });
    });

    describe('CHINESE_POSTCODE_PATTERN', () => {
        test('should match valid Chinese postcodes', () => {
            expect(CHINESE_POSTCODE_PATTERN.test('100000')).toBe(true);
            expect(CHINESE_POSTCODE_PATTERN.test('123456')).toBe(true);
        });

        test('should not match invalid Chinese postcodes', () => {
            expect(CHINESE_POSTCODE_PATTERN.test('000000')).toBe(false); // starts with 0
            expect(CHINESE_POSTCODE_PATTERN.test('12345')).toBe(false); // too short
            expect(CHINESE_POSTCODE_PATTERN.test('1234567')).toBe(false); // too long
        });
    });

    describe('USERNAME_PATTERN', () => {
        test('should match valid usernames', () => {
            expect(USERNAME_PATTERN.test('username')).toBe(true);
            expect(USERNAME_PATTERN.test('user_name')).toBe(true);
            expect(USERNAME_PATTERN.test('user-name')).toBe(true);
            expect(USERNAME_PATTERN.test('u123')).toBe(true);
            expect(USERNAME_PATTERN.test('a'.repeat(20))).toBe(true);
        });

        test('should not match invalid usernames', () => {
            expect(USERNAME_PATTERN.test('ab')).toBe(false); // too short
            expect(USERNAME_PATTERN.test('a'.repeat(21))).toBe(false); // too long
            expect(USERNAME_PATTERN.test('user.name')).toBe(false); // contains dot
        });
    });

    describe('Password-related patterns', () => {
        test('UPPERCASE_PATTERN should match uppercase letters', () => {
            expect(UPPERCASE_PATTERN.test('A')).toBe(true);
            expect(UPPERCASE_PATTERN.test('Hello')).toBe(true);
            expect(UPPERCASE_PATTERN.test('hello')).toBe(false);
        });

        test('LOWERCASE_PATTERN should match lowercase letters', () => {
            expect(LOWERCASE_PATTERN.test('a')).toBe(true);
            expect(LOWERCASE_PATTERN.test('hello')).toBe(true);
            expect(LOWERCASE_PATTERN.test('HELLO')).toBe(false);
        });

        test('DIGIT_PATTERN should match digits', () => {
            expect(DIGIT_PATTERN.test('1')).toBe(true);
            expect(DIGIT_PATTERN.test('hello123')).toBe(true);
            expect(DIGIT_PATTERN.test('hello')).toBe(false);
        });

        test('SPECIAL_CHAR_PATTERN should match special characters', () => {
            expect(SPECIAL_CHAR_PATTERN.test('!')).toBe(true);
            expect(SPECIAL_CHAR_PATTERN.test('@')).toBe(true);
            expect(SPECIAL_CHAR_PATTERN.test('#hello')).toBe(true);
            expect(SPECIAL_CHAR_PATTERN.test('hello')).toBe(false);
        });
    });

    describe('ValidationPatternType enum', () => {
        test('should have all expected enum values', () => {
            expect(ValidationPatternType.EMAIL).toBe('EMAIL');
            expect(ValidationPatternType.URL).toBe('URL');
            expect(ValidationPatternType.IPV4).toBe('IPV4');
            expect(ValidationPatternType.IPV6).toBe('IPV6');
            expect(ValidationPatternType.MAC_ADDRESS).toBe('MAC_ADDRESS');
            expect(ValidationPatternType.PHONE).toBe('PHONE');
            expect(ValidationPatternType.UUID).toBe('UUID');
            expect(ValidationPatternType.BASE64).toBe('BASE64');
            expect(ValidationPatternType.HEX_COLOR).toBe('HEX_COLOR');
            expect(ValidationPatternType.RGB_COLOR).toBe('RGB_COLOR');
            expect(ValidationPatternType.RGBA_COLOR).toBe('RGBA_COLOR');
            expect(ValidationPatternType.CREDIT_CARD).toBe('CREDIT_CARD');
            expect(ValidationPatternType.CHINESE_ID).toBe('CHINESE_ID');
            expect(ValidationPatternType.CHINESE_POSTCODE).toBe('CHINESE_POSTCODE');
            expect(ValidationPatternType.USERNAME).toBe('USERNAME');
            expect(ValidationPatternType.UPPERCASE).toBe('UPPERCASE');
            expect(ValidationPatternType.LOWERCASE).toBe('LOWERCASE');
            expect(ValidationPatternType.DIGIT).toBe('DIGIT');
            expect(ValidationPatternType.SPECIAL_CHAR).toBe('SPECIAL_CHAR');
        });
    });

    describe('getValidationPattern function', () => {
        test('should return correct regex for each type', () => {
            expect(getValidationPattern(ValidationPatternType.EMAIL)).toBe(EMAIL_PATTERN);
            expect(getValidationPattern(ValidationPatternType.URL)).toBe(URL_PATTERN);
            expect(getValidationPattern(ValidationPatternType.IPV4)).toBe(IPV4_PATTERN);
        });
    });

    describe('setValidationPattern function', () => {
        test('should update the pattern correctly', () => {
            const newPattern = /new-pattern/;
            setValidationPattern(ValidationPatternType.EMAIL, newPattern);
            expect(getValidationPattern(ValidationPatternType.EMAIL)).toBe(newPattern);
        });
    });
});
