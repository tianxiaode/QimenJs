// patterns.test.ts
import {
  matchesPattern,
  isEmail,
  isURL,
  isMACAddress,
  isPhoneNumber,
  isUUID,
  isBase64,
  isHexColor,
  isRGBColor,
  isRGBAColor,
  isCreditCard,
  isChineseID,
  isChinesePostcode,
  isUsername,
  isIPv4,
  isIPv6,
  isNumericString,
  isIntegerString,
  hasPasswordStrength
} from '@orbitjs/utils';

describe('Validation Rules - Patterns', () => {
  describe('matchesPattern', () => {
    it('should validate using a regular expression', () => {
      const rule = matchesPattern(/^[a-z]+$/);
      expect(rule('abc').isValid).toBe(true);
      expect(rule('ABC').isValid).toBe(false);
    });

    it('should validate using a string pattern', () => {
      const rule = matchesPattern('^[a-z]+$');
      expect(rule('abc').isValid).toBe(true);
      expect(rule('ABC').isValid).toBe(false);
    });

    it('should fail validation for non-string values', () => {
      const rule = matchesPattern(/^[a-z]+$/);
      const result = rule(123);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].errorCode).toBe('VALIDATION_TYPE_NOT_STRING');
    });
  });

  describe('isEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isEmail('test@example.com').isValid).toBe(true);
    });

    it('should invalidate incorrect email addresses', () => {
      expect(isEmail('invalid-email').isValid).toBe(false);
    });
  });

  describe('isURL', () => {
    it('should validate correct URLs', () => {
      expect(isURL('https://www.example.com').isValid).toBe(true);
      expect(isURL('http://example.com').isValid).toBe(true);
    });

    it('should invalidate incorrect URLs', () => {
      expect(isURL('not-a-url').isValid).toBe(false);
    });
  });

  describe('isMACAddress', () => {
    it('should validate correct MAC addresses', () => {
      expect(isMACAddress('00:1A:2B:3C:4D:5E').isValid).toBe(true);
      expect(isMACAddress('00-1A-2B-3C-4D-5E').isValid).toBe(true);
    });

    it('should invalidate incorrect MAC addresses', () => {
      expect(isMACAddress('invalid-mac').isValid).toBe(false);
    });
  });

  describe('isPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(isPhoneNumber('+1234567890').isValid).toBe(true);
      expect(isPhoneNumber('1234567890').isValid).toBe(true);
    });

    it('should invalidate incorrect phone numbers', () => {
      expect(isPhoneNumber('invalid-phone').isValid).toBe(false);
    });
  });

  describe('isUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isUUID('123e4567-e89b-12d3-a456-426614174000').isValid).toBe(true);
    });

    it('should invalidate incorrect UUIDs', () => {
      expect(isUUID('invalid-uuid').isValid).toBe(false);
    });
  });

  describe('isBase64', () => {
    it('should validate correct Base64 strings', () => {
      expect(isBase64('dGVzdA==').isValid).toBe(true);
    });

    it('should invalidate incorrect Base64 strings', () => {
      expect(isBase64('invalid-base64').isValid).toBe(false);
    });
  });

  describe('isHexColor', () => {
    it('should validate correct hex color codes', () => {
      expect(isHexColor('#FF0000').isValid).toBe(true);
      expect(isHexColor('#F00').isValid).toBe(true);
    });

    it('should invalidate incorrect hex color codes', () => {
      expect(isHexColor('invalid-hex-color').isValid).toBe(false);
    });
  });

  describe('isRGBColor', () => {
    it('should validate correct RGB color codes', () => {
      expect(isRGBColor('rgb(255, 0, 0)').isValid).toBe(true);
    });

    it('should invalidate incorrect RGB color codes', () => {
      expect(isRGBColor('invalid-rgb-color').isValid).toBe(false);
    });
  });

  describe('isRGBAColor', () => {
    it('should validate correct RGBA color codes', () => {
      expect(isRGBAColor('rgba(255, 0, 0, 0.5)').isValid).toBe(true);
    });

    it('should invalidate incorrect RGBA color codes', () => {
      expect(isRGBAColor('invalid-rgba-color').isValid).toBe(false);
    });
  });

  describe('isCreditCard', () => {
    it('should validate correct credit card numbers', () => {
      expect(isCreditCard('1234 5678 9012 3456').isValid).toBe(true);
      expect(isCreditCard('1234-5678-9012-3456').isValid).toBe(true);
    });

    it('should invalidate incorrect credit card numbers', () => {
      expect(isCreditCard('invalid-credit-card').isValid).toBe(false);
    });
  });

  describe('isChineseID', () => {
    it('should validate correct Chinese ID numbers', () => {
      expect(isChineseID('123456789012345678').isValid).toBe(true);
    });

    it('should invalidate incorrect Chinese ID numbers', () => {
      expect(isChineseID('invalid-chinese-id').isValid).toBe(false);
    });
  });

  describe('isChinesePostcode', () => {
    it('should validate correct Chinese postcodes', () => {
      expect(isChinesePostcode('123456').isValid).toBe(true);
    });

    it('should invalidate incorrect Chinese postcodes', () => {
      expect(isChinesePostcode('invalid-postcode').isValid).toBe(false);
    });
  });

  describe('isUsername', () => {
    it('should validate correct usernames', () => {
      expect(isUsername('valid_username').isValid).toBe(true);
      expect(isUsername('valid-username').isValid).toBe(true);
    });

    it('should invalidate incorrect usernames', () => {
      expect(isUsername('in valid').isValid).toBe(false);
    });
  });

  describe('isIPv4', () => {
    it('should validate correct IPv4 addresses', () => {
      expect(isIPv4('192.168.1.1').isValid).toBe(true);
    });

    it('should invalidate incorrect IPv4 addresses', () => {
      expect(isIPv4('999.999.999.999').isValid).toBe(false);
      expect(isIPv4('invalid-ipv4').isValid).toBe(false);
    });
  });

  describe('isIPv6', () => {
    it('should validate correct IPv6 addresses', () => {
      expect(isIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334').isValid).toBe(true);
    });

    it('should invalidate incorrect IPv6 addresses', () => {
      expect(isIPv6('invalid-ipv6').isValid).toBe(false);
    });
  });

  describe('isNumericString', () => {
    it('should validate numeric strings', () => {
      expect(isNumericString('123').isValid).toBe(true);
      expect(isNumericString('123.45').isValid).toBe(true);
    });

    it('should invalidate non-numeric strings', () => {
      expect(isNumericString('abc').isValid).toBe(false);
    });

    it('should fail validation for non-string values', () => {
      const result = isNumericString(123);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].errorCode).toBe('VALIDATION_TYPE_NOT_STRING');
    });
  });

  describe('isIntegerString', () => {
    it('should validate integer strings', () => {
      expect(isIntegerString('123').isValid).toBe(true);
    });

    it('should invalidate non-integer strings', () => {
      expect(isIntegerString('123.45').isValid).toBe(false);
      expect(isIntegerString('abc').isValid).toBe(false);
    });

    it('should fail validation for non-string values', () => {
      const result = isIntegerString(123);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].errorCode).toBe('VALIDATION_TYPE_NOT_STRING');
    });
  });

  describe('hasPasswordStrength', () => {
    it('should validate password with default requirements', () => {
      const rule = hasPasswordStrength();
      expect(rule('Password123').isValid).toBe(true);
    });

    it('should invalidate password without uppercase letter', () => {
      const rule = hasPasswordStrength({ requireUppercase: true });
      expect(rule('password123').isValid).toBe(false);
    });

    it('should invalidate password without lowercase letter', () => {
      const rule = hasPasswordStrength({ requireLowercase: true });
      expect(rule('PASSWORD123').isValid).toBe(false);
    });

    it('should invalidate password without digit', () => {
      const rule = hasPasswordStrength({ requireDigits: true });
      expect(rule('Password').isValid).toBe(false);
    });

    it('should invalidate password without special character', () => {
      const rule = hasPasswordStrength({ requireSpecial: true });
      expect(rule('Password123').isValid).toBe(false);
    });

    it('should invalidate password that is too short', () => {
      const rule = hasPasswordStrength({ minLength: 10 });
      expect(rule('Pass1').isValid).toBe(false);
    });
  });
});