import { MimeTypeRegistrar } from '@/mime/MimeTypeRegistrar';
import { COMMON_MIMES, IMAGE_MIMES, DOCUMENT_MIMES } from '@/mime/presets';
import { registerCommonMimeTypes } from '@/mime/register';

/**
 * MIME类型注册器单元测试
 * 验证MimeTypeRegistrar类的各项功能是否正常工作
 */
describe('MimeTypeRegistrar', () => {
    let mimeTypeRegistrar: MimeTypeRegistrar;

    beforeEach(() => {
        mimeTypeRegistrar = new MimeTypeRegistrar();
    });

    describe('register', () => {
        it('应该能够注册单个扩展名和MIME类型的映射', () => {
            mimeTypeRegistrar.register('jpg', 'image/jpeg');
            const result = mimeTypeRegistrar.get('jpg');
            expect(result).toEqual(['image/jpeg']);
        });

        it('应该能够注册单个扩展名和多个MIME类型的映射', () => {
            mimeTypeRegistrar.register('js', ['text/javascript', 'application/javascript']);
            const result = mimeTypeRegistrar.get('js');
            expect(result).toEqual(['text/javascript', 'application/javascript']);
        });

        it('应该能够处理带点号的扩展名', () => {
            mimeTypeRegistrar.register('.png', 'image/png');
            const result = mimeTypeRegistrar.get('png');
            expect(result).toEqual(['image/png']);
        });

        it('应该能够批量注册', () => {
            mimeTypeRegistrar.register({
                jpg: 'image/jpeg',
                png: 'image/png',
                gif: 'image/gif',
            });
            expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);
            expect(mimeTypeRegistrar.get('png')).toEqual(['image/png']);
            expect(mimeTypeRegistrar.get('gif')).toEqual(['image/gif']);
        });

        it('当缺少MIME类型参数时应该抛出错误', () => {
            expect(() => {
                (mimeTypeRegistrar as any).register('jpg');
            }).toThrow();
        });
    });

    describe('unregister', () => {
        it('应该能够注销扩展名和MIME类型的映射', () => {
            mimeTypeRegistrar.register('jpg', 'image/jpeg');
            expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);
            mimeTypeRegistrar.unregister('jpg');
            expect(mimeTypeRegistrar.get('jpg')).toEqual([]);
        });

        it('应该能够处理带点号的扩展名', () => {
            mimeTypeRegistrar.register('.png', 'image/png');
            expect(mimeTypeRegistrar.get('png')).toEqual(['image/png']);
            mimeTypeRegistrar.unregister('.png');
            expect(mimeTypeRegistrar.get('png')).toEqual([]);
        });

        it('在锁定状态下应该抛出错误', () => {
            mimeTypeRegistrar.lock();
            expect(() => {
                mimeTypeRegistrar.unregister('jpg');
            }).toThrow('[Registrar: mimeType] modification denied: Locked.');
        });
    });

    describe('get', () => {
        it('应该能够获取单个扩展名对应的MIME类型', () => {
            mimeTypeRegistrar.register('jpg', 'image/jpeg');
            mimeTypeRegistrar.register('js', ['text/javascript', 'application/javascript']);
            expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);
            expect(mimeTypeRegistrar.get('js')).toEqual([
                'text/javascript',
                'application/javascript',
            ]);
        });

        it('应该能够获取多个扩展名对应的MIME类型', () => {
            mimeTypeRegistrar.register('jpg', 'image/jpeg');
            mimeTypeRegistrar.register('png', 'image/png');
            const result = mimeTypeRegistrar.get(['jpg', 'png']);
            expect(result).toEqual(new Set(['image/jpeg', 'image/png']));
        });

        it('应该能够处理包含带点号扩展名的数组查询', () => {
            mimeTypeRegistrar.register('.jpg', 'image/jpeg');
            mimeTypeRegistrar.register('png', 'image/png');
            const result = mimeTypeRegistrar.get(['.jpg', 'png']);
            expect(result).toEqual(new Set(['image/jpeg', 'image/png']));
        });

        it('应该能够处理包含不存在扩展名的数组查询', () => {
            mimeTypeRegistrar.register('jpg', 'image/jpeg');
            const result = mimeTypeRegistrar.get(['jpg', 'nonexistent']);
            expect(result).toEqual(new Set(['image/jpeg']));
        });

        it('应该能够处理空数组查询', () => {
            const result = mimeTypeRegistrar.get([]);
            expect(result).toEqual(new Set([]));
        });

        it('应该能够处理带点号的扩展名', () => {
            mimeTypeRegistrar.register('.jpg', 'image/jpeg');
            expect(mimeTypeRegistrar.get('.jpg')).toEqual(['image/jpeg']);
        });

        it('应该能够处理扩展名不存在的情况', () => {
            const result = mimeTypeRegistrar.get('nonexistent');
            expect(result).toEqual([]);
        });
    });

    describe('getByMime', () => {
        it('应该能够根据MIME类型获取扩展名', () => {
            mimeTypeRegistrar.register('jpg', 'image/jpeg');
            const ext = mimeTypeRegistrar.getByMime('image/jpeg');
            expect(ext).toBe('jpg');
        });

        it('当MIME类型不存在时应该返回空字符串', () => {
            const ext = mimeTypeRegistrar.getByMime('unknown/type');
            expect(ext).toBe('');
        });
    });

    describe('clear', () => {
        it('应该清空所有注册的映射', () => {
            mimeTypeRegistrar.register('jpg', 'image/jpeg');
            expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);
            mimeTypeRegistrar.clear();
            expect(mimeTypeRegistrar.get('jpg')).toEqual([]);
        });

        it('在锁定状态下应该抛出错误', () => {
            mimeTypeRegistrar.lock();
            expect(() => {
                mimeTypeRegistrar.clear();
            }).toThrow('[Registrar: mimeType] modification denied: Locked.');
        });
    });

    describe('lock', () => {
        it('应该锁定注册器', () => {
            mimeTypeRegistrar.lock();
            expect((mimeTypeRegistrar as any).isLocked).toBe(true);
        });
    });

    describe('inspect', () => {
        it('应该输出注册器状态', () => {
            mimeTypeRegistrar.register('jpg', 'image/jpeg');
            const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
            const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
            const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
            mimeTypeRegistrar.inspect();
            expect(consoleSpy).toHaveBeenCalledWith('🔍 Registrar: mimeType [🔓]');
            expect(consoleTableSpy).toHaveBeenCalled();
            expect(consoleGroupEndSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
            consoleTableSpy.mockRestore();
            consoleGroupEndSpy.mockRestore();
        });
    });
});

describe('MIME Presets', () => {
    it('IMAGE_MIMES 应包含常用图片类型', () => {
        expect(IMAGE_MIMES.jpg).toBe('image/jpeg');
        expect(IMAGE_MIMES.png).toBe('image/png');
        expect(IMAGE_MIMES.gif).toBe('image/gif');
        expect(IMAGE_MIMES.svg).toBe('image/svg+xml');
        expect(IMAGE_MIMES.webp).toBe('image/webp');
    });

    it('DOCUMENT_MIMES 应包含常用文档类型', () => {
        expect(DOCUMENT_MIMES.pdf).toBe('application/pdf');
        expect(DOCUMENT_MIMES.docx).toBe(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        expect(DOCUMENT_MIMES.xlsx).toBe(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
    });

    it('COMMON_MIMES 应合并所有类别', () => {
        expect(COMMON_MIMES.jpg).toBe('image/jpeg');
        expect(COMMON_MIMES.pdf).toBe('application/pdf');
        expect(COMMON_MIMES.mp3).toBe('audio/mpeg');
        expect(COMMON_MIMES.mp4).toBe('video/mp4');
        expect(COMMON_MIMES.zip).toBe('application/zip');
        expect(COMMON_MIMES.html).toBe('text/html');
        expect(COMMON_MIMES.woff2).toBe('font/woff2');
    });

    it('WEB_MIMES 中 js 应支持多个 MIME 类型', () => {
        const jsMimes = COMMON_MIMES.js;
        expect(Array.isArray(jsMimes)).toBe(true);
        expect(jsMimes).toContain('text/javascript');
        expect(jsMimes).toContain('application/javascript');
    });
});

describe('registerCommonMimeTypes', () => {
    it('应该将常用 MIME 类型注册到 MimeTypeRegistrar', () => {
        const registrar = new MimeTypeRegistrar();
        // 手动调用注册（不使用自动注册的单例）
        registrar.register(COMMON_MIMES);
        expect(registrar.get('jpg')).toEqual(['image/jpeg']);
        expect(registrar.get('png')).toEqual(['image/png']);
        expect(registrar.get('pdf')).toEqual(['application/pdf']);
    });

    it('应该支持额外 MIME 类型', () => {
        const registrar = new MimeTypeRegistrar();
        registrar.register(COMMON_MIMES);
        registrar.register({ custom: 'application/custom' });
        expect(registrar.get('custom')).toEqual(['application/custom']);
        expect(registrar.get('jpg')).toEqual(['image/jpeg']);
    });
});
