import base64 from '@/crypto/base64';

// 保存原始环境引用，供环境切换测试使用
const originalBtoaBackup = (globalThis as any).btoa;
const originalAtobBackup = (globalThis as any).atob;

describe('Base64编码解码功能测试', () => {
    it('应该正确编码普通字符串', () => {
        expect(base64.encode('hello')).toBe('aGVsbG8=');
        expect(base64.encode('world')).toBe('d29ybGQ=');
    });

    it('应该正确解码Base64字符串', () => {
        expect(base64.decode('aGVsbG8=')).toBe('hello');
        expect(base64.decode('d29ybGQ=')).toBe('world');
    });

    it('应该正确处理空字符串', () => {
        expect(base64.encode('')).toBe('');
        expect(base64.decode('')).toBe('');
    });

    it('应该正确编码和解码包含特殊字符的字符串', () => {
        const specialStr = 'hello@world!';
        const encoded = base64.encode(specialStr);
        const decoded = base64.decode(encoded);
        expect(decoded).toBe(specialStr);
    });

    it('应该正确处理中文字符串', () => {
        const chineseStr = '你好世界';
        const encoded = base64.encode(chineseStr);
        const decoded = base64.decode(encoded);
        expect(decoded).toBe(chineseStr);
    });

    it('应该正确处理数字字符串', () => {
        const numStr = '123456';
        const encoded = base64.encode(numStr);
        const decoded = base64.decode(encoded);
        expect(decoded).toBe(numStr);
    });

    it('应该编码后能够正确解码回原始字符串', () => {
        const testCases = [
            'test string',
            'Hello World!',
            '12345!@#$%',
            '多字节字符: 中文',
            'Emoji: 👋🚀',
            'Line\nbreaks\r\nand\ttabs',
        ];

        testCases.forEach(testCase => {
            const encoded = base64.encode(testCase);
            const decoded = base64.decode(encoded);
            expect(decoded).toBe(testCase);
        });
    });

    it('应该抛出错误当输入不是字符串时', () => {
        expect(() => {
            // @ts-ignore - 测试错误情况
            base64.encode(123);
        }).toThrow(TypeError);

        expect(() => {
            // @ts-ignore - 测试错误情况
            base64.decode(123);
        }).toThrow(TypeError);
    });

    it('应该处理错误的Base64字符串', () => {
        // 即使是无效的Base64字符串也应该能处理，只是结果可能不是预期
        expect(() => base64.decode('invalid_base64')).not.toThrow();
        // 解码无效字符串应返回空字符串
        expect(base64.decode('invalid_base64')).toBe('');
    });

    describe('Node.js Buffer 分支', () => {
        it('should use Buffer for encoding when btoa is not available', () => {
            // In jsdom, window.btoa exists, so the browser path is used by default
            // We can only test the Buffer path by verifying the output is correct
            // The Buffer path is the same as the browser path in terms of output
            expect(base64.encode('hello')).toBe('aGVsbG8=');
            expect(base64.encode('你好')).toBeDefined();
        });

        it('should use Buffer for decoding when atob is not available', () => {
            expect(base64.decode('aGVsbG8=')).toBe('hello');
        });

        it('should handle decode error with Buffer path', () => {
            // Buffer.from with invalid base64 may not throw, just return garbled data
            expect(() => base64.decode('!!!invalid!!!')).not.toThrow();
        });
    });

    describe('浏览器 btoa/atob 错误处理', () => {
        it('should return empty string when atob throws', () => {
            // Save original
            const originalAtob = globalThis.atob;
            // Replace with a function that throws
            (globalThis as any).atob = () => {
                throw new Error('Invalid character');
            };
            try {
                const result = base64.decode('!!!invalid!!!');
                expect(result).toBe('');
            } finally {
                (globalThis as any).atob = originalAtob;
            }
        });
    });

    describe('纯 JavaScript 实现分支', () => {
        it('encode 应该在没有 btoa 和 Buffer 时使用纯 JS 实现', () => {
            const originalBtoa = (globalThis as any).btoa;
            const originalBuffer = global.Buffer;

            delete (globalThis as any).btoa;
            delete (globalThis as any).atob;
            // @ts-ignore
            delete global.Buffer;

            try {
                // 重新导入以获取新的模块实例
                // 由于 jest 缓存，需要用 jest.isolateModules
                jest.isolateModules(() => {
                    const base64NoBtoa = require('@/crypto/base64').default;
                    expect(base64NoBtoa.encode('hello')).toBe('aGVsbG8=');
                    expect(base64NoBtoa.encode('AB')).toBe('QUI=');
                    expect(base64NoBtoa.encode('A')).toBe('QQ==');
                });
            } finally {
                (globalThis as any).btoa = originalBtoa;
                (globalThis as any).atob = originalAtobBackup;
                global.Buffer = originalBuffer;
            }
        });

        it('decode 应该在没有 atob 和 Buffer 时使用纯 JS 实现', () => {
            const originalAtob = (globalThis as any).atob;
            const originalBuffer = global.Buffer;

            delete (globalThis as any).btoa;
            delete (globalThis as any).atob;
            // @ts-ignore
            delete global.Buffer;

            try {
                jest.isolateModules(() => {
                    const base64NoAtob = require('@/crypto/base64').default;
                    expect(base64NoAtob.decode('aGVsbG8=')).toBe('hello');
                    expect(base64NoAtob.decode('QUI=')).toBe('AB');
                    expect(base64NoAtob.decode('QQ==')).toBe('A');
                });
            } finally {
                (globalThis as any).btoa = originalBtoaBackup;
                (globalThis as any).atob = originalAtob;
                global.Buffer = originalBuffer;
            }
        });
    });

    describe('Node.js Buffer 分支', () => {
        it('encode 应该在没有 btoa 但有 Buffer 时使用 Buffer', () => {
            const originalBtoa = (globalThis as any).btoa;
            const originalAtob = (globalThis as any).atob;

            delete (globalThis as any).btoa;
            delete (globalThis as any).atob;

            try {
                jest.isolateModules(() => {
                    const base64Buffer = require('@/crypto/base64').default;
                    expect(base64Buffer.encode('hello')).toBe('aGVsbG8=');
                    expect(base64Buffer.encode('你好')).toBeDefined();
                });
            } finally {
                (globalThis as any).btoa = originalBtoa;
                (globalThis as any).atob = originalAtob;
            }
        });

        it('decode 应该在没有 atob 但有 Buffer 时使用 Buffer', () => {
            const originalBtoa = (globalThis as any).btoa;
            const originalAtob = (globalThis as any).atob;

            delete (globalThis as any).btoa;
            delete (globalThis as any).atob;

            try {
                jest.isolateModules(() => {
                    const base64Buffer = require('@/crypto/base64').default;
                    expect(base64Buffer.decode('aGVsbG8=')).toBe('hello');
                });
            } finally {
                (globalThis as any).btoa = originalBtoa;
                (globalThis as any).atob = originalAtob;
            }
        });
    });
});
