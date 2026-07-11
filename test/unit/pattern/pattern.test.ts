import { PatternRegistrar } from '@/pattern/PatternRegistrar';
import { FORMAT_PATTERNS, PASSWORD_PATTERNS, VALIDATION_PATTERNS } from '@/pattern/presets';
import { registerValidationPatterns } from '@/pattern/register';

describe('PatternRegistrar', () => {
    let patternRegistrar: PatternRegistrar;

    beforeEach(() => {
        patternRegistrar = new PatternRegistrar();
    });

    describe('register', () => {
        it('应该能够注册单个模式', () => {
            patternRegistrar.register('email', /^[a-z]+$/);
            expect(patternRegistrar.get('email')).toEqual(/^[a-z]+$/);
        });

        it('应该能够批量注册', () => {
            patternRegistrar.register({
                email: /^[a-z]+$/,
                url: /^https?:\/\//,
            });
            expect(patternRegistrar.get('email')).toEqual(/^[a-z]+$/);
            expect(patternRegistrar.get('url')).toEqual(/^https?:\/\//);
        });

        it('当缺少正则参数时应该抛出错误', () => {
            expect(() => {
                (patternRegistrar as any).register('email');
            }).toThrow();
        });

        it('在锁定状态下应该抛出错误', () => {
            patternRegistrar.lock();
            expect(() => {
                patternRegistrar.register('email', /^[a-z]+$/);
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('unregister', () => {
        it('应该能够注销模式', () => {
            patternRegistrar.register('email', /^[a-z]+$/);
            expect(patternRegistrar.get('email')).toEqual(/^[a-z]+$/);
            patternRegistrar.unregister('email');
            expect(() => patternRegistrar.get('email')).toThrow();
        });

        it('在锁定状态下应该抛出错误', () => {
            patternRegistrar.lock();
            expect(() => {
                patternRegistrar.unregister('email');
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('get', () => {
        it('应该能够获取已注册的模式', () => {
            patternRegistrar.register('email', /^[a-z]+$/);
            expect(patternRegistrar.get('email')).toEqual(/^[a-z]+$/);
        });

        it('当模式不存在时应该抛出错误', () => {
            expect(() => {
                patternRegistrar.get('nonexistent');
            }).toThrow();
        });
    });

    describe('clear', () => {
        it('应该清空所有注册的模式', () => {
            patternRegistrar.register('email', /^[a-z]+$/);
            expect(patternRegistrar.get('email')).toEqual(/^[a-z]+$/);
            patternRegistrar.clear();
            expect(() => patternRegistrar.get('email')).toThrow();
        });

        it('在锁定状态下应该抛出错误', () => {
            patternRegistrar.lock();
            expect(() => {
                patternRegistrar.clear();
            }).toThrow('Registration failed: The registrar is locked');
        });
    });

    describe('lock', () => {
        it('应该锁定注册器', () => {
            patternRegistrar.lock();
            expect((patternRegistrar as any).isLocked).toBe(true);
        });
    });

    describe('inspect', () => {
        it('应该输出注册器状态', () => {
            patternRegistrar.register('email', /^[a-z]+$/);
            const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
            const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
            const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
            patternRegistrar.inspect();
            expect(consoleSpy).toHaveBeenCalledWith('🔍 Registrar: pattern [🔓]');
            expect(consoleTableSpy).toHaveBeenCalled();
            expect(consoleGroupEndSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
            consoleTableSpy.mockRestore();
            consoleGroupEndSpy.mockRestore();
        });
    });
});

describe('Pattern Presets', () => {
    it('FORMAT_PATTERNS 应包含全部 15 个格式模式', () => {
        const expectedKeys = [
            'email',
            'url',
            'ipv4',
            'ipv6',
            'mac',
            'phone',
            'uuid',
            'base64',
            'hexColor',
            'rgbColor',
            'rgbaColor',
            'creditCard',
            'chineseId',
            'chinesePostcode',
            'username',
        ];
        expect(Object.keys(FORMAT_PATTERNS).sort()).toEqual(expectedKeys.sort());
    });

    it('PASSWORD_PATTERNS 应包含全部 4 个密码模式', () => {
        const expectedKeys = ['uppercase', 'lowercase', 'digit', 'specialChar'];
        expect(Object.keys(PASSWORD_PATTERNS).sort()).toEqual(expectedKeys.sort());
    });

    it('VALIDATION_PATTERNS 应合并格式和密码模式（共 19 个）', () => {
        expect(Object.keys(VALIDATION_PATTERNS)).toHaveLength(19);
    });

    it('email 模式应匹配有效邮箱', () => {
        expect(FORMAT_PATTERNS.email.test('user@example.com')).toBe(true);
        expect(FORMAT_PATTERNS.email.test('invalid')).toBe(false);
    });

    it('url 模式应匹配有效 URL', () => {
        expect(FORMAT_PATTERNS.url.test('https://example.com')).toBe(true);
        expect(FORMAT_PATTERNS.url.test('not-a-url')).toBe(false);
    });

    it('ipv4 模式应匹配有效 IPv4', () => {
        expect(FORMAT_PATTERNS.ipv4.test('192.168.1.1')).toBe(true);
        expect(FORMAT_PATTERNS.ipv4.test('999.999.999.999')).toBe(false);
    });

    it('uuid 模式应匹配有效 UUID', () => {
        expect(FORMAT_PATTERNS.uuid.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
        expect(FORMAT_PATTERNS.uuid.test('not-a-uuid')).toBe(false);
    });

    it('phone 模式应匹配手机号', () => {
        expect(FORMAT_PATTERNS.phone.test('13800138000')).toBe(true);
        expect(FORMAT_PATTERNS.phone.test('abc')).toBe(false);
    });

    it('chineseId 模式应匹配中国身份证号', () => {
        expect(FORMAT_PATTERNS.chineseId.test('110101199001011234')).toBe(true);
        expect(FORMAT_PATTERNS.chineseId.test('1234')).toBe(false);
    });

    it('chinesePostcode 模式应匹配中国邮编', () => {
        expect(FORMAT_PATTERNS.chinesePostcode.test('100000')).toBe(true);
        expect(FORMAT_PATTERNS.chinesePostcode.test('12345')).toBe(false);
    });

    it('hexColor 模式应匹配十六进制颜色', () => {
        expect(FORMAT_PATTERNS.hexColor.test('#fff')).toBe(true);
        expect(FORMAT_PATTERNS.hexColor.test('#ffffff')).toBe(true);
        expect(FORMAT_PATTERNS.hexColor.test('red')).toBe(false);
    });

    it('uppercase 模式应匹配大写字母', () => {
        expect(PASSWORD_PATTERNS.uppercase.test('A')).toBe(true);
        expect(PASSWORD_PATTERNS.uppercase.test('a')).toBe(false);
    });

    it('lowercase 模式应匹配小写字母', () => {
        expect(PASSWORD_PATTERNS.lowercase.test('a')).toBe(true);
        expect(PASSWORD_PATTERNS.lowercase.test('A')).toBe(false);
    });

    it('digit 模式应匹配数字', () => {
        expect(PASSWORD_PATTERNS.digit.test('1')).toBe(true);
        expect(PASSWORD_PATTERNS.digit.test('a')).toBe(false);
    });

    it('specialChar 模式应匹配特殊字符', () => {
        expect(PASSWORD_PATTERNS.specialChar.test('!')).toBe(true);
        expect(PASSWORD_PATTERNS.specialChar.test('a')).toBe(false);
    });
});

describe('registerValidationPatterns', () => {
    it('应该将验证模式注册到 PatternRegistrar', () => {
        const registrar = new PatternRegistrar();
        registrar.register(VALIDATION_PATTERNS);
        // 格式模式
        expect(registrar.get('email')).toBeDefined();
        expect(registrar.get('url')).toBeDefined();
        expect(registrar.get('ipv4')).toBeDefined();
        expect(registrar.get('uuid')).toBeDefined();
        expect(registrar.get('phone')).toBeDefined();
        // 密码模式
        expect(registrar.get('uppercase')).toBeDefined();
        expect(registrar.get('lowercase')).toBeDefined();
        expect(registrar.get('digit')).toBeDefined();
        expect(registrar.get('specialChar')).toBeDefined();
    });

    it('应该支持额外模式', () => {
        const registrar = new PatternRegistrar();
        registrar.register(VALIDATION_PATTERNS);
        registrar.register({ custom: /^custom$/ });
        expect(registrar.get('custom')).toEqual(/^custom$/);
        expect(registrar.get('email')).toBeDefined();
    });

    it('extra 为 undefined 时不应注册额外模式', () => {
        const registrar = new PatternRegistrar();
        registrar.register(VALIDATION_PATTERNS);
        // No extra registered
        expect(() => registrar.get('custom')).toThrow();
    });

    it('extra 有值时应合并注册', () => {
        const registrar = new PatternRegistrar();
        const extra: Record<string, RegExp> = {
            custom: /^custom$/,
            another: /^another$/,
        };
        registrar.register(VALIDATION_PATTERNS);
        registrar.register(extra);
        expect(registrar.get('custom')).toEqual(/^custom$/);
        expect(registrar.get('another')).toEqual(/^another$/);
        expect(registrar.get('email')).toBeDefined();
    });
});
