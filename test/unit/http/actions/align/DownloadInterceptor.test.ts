/**
 * DownloadInterceptor 处理器单元测试
 */

import { DownloadInterceptorHandler } from '@/http/actions/align/DownloadInterceptor';
import { RequestContextBuilder } from '@qimenjs/context';

function createContext(
    options: {
        isDownload?: boolean;
        error?: any;
        raw?: any;
        fileName?: string;
    } = {}
) {
    const context = RequestContextBuilder.create()
        .withDomain('test')
        .withUrl('/api/download')
        .withMethod('GET')
        .build();

    if (options.isDownload) context.metadata.isDownload = true;
    if (options.error) context.error = options.error;
    if (options.raw !== undefined) context.data.raw = options.raw;
    if (options.fileName) context.metadata.fileName = options.fileName;

    return context;
}

// Setup URL.createObjectURL mock
beforeAll(() => {
    (URL as any).createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    (URL as any).revokeObjectURL = jest.fn();
});

afterAll(() => {
    delete (URL as any).createObjectURL;
    delete (URL as any).revokeObjectURL;
});

describe('DownloadInterceptor', () => {
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;

    beforeEach(() => {
        appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(node => node);
        removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(node => node);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should skip if not a download', async () => {
        const context = createContext({ isDownload: false });
        await DownloadInterceptorHandler(context);
        expect(context.metadata.isDownloadHandled).toBeUndefined();
    });

    it('should skip if there is an error', async () => {
        const blob = new Blob(['test']);
        const context = createContext({
            isDownload: true,
            error: new Error('failed'),
            raw: blob,
        });
        await DownloadInterceptorHandler(context);
        expect(context.metadata.isDownloadHandled).toBeUndefined();
    });

    it('should skip if raw data is not a Blob', async () => {
        const context = createContext({
            isDownload: true,
            raw: 'not a blob',
        });
        await DownloadInterceptorHandler(context);
        expect(context.metadata.isDownloadHandled).toBeUndefined();
    });

    it('should trigger download for valid Blob response', async () => {
        const blob = new Blob(['file content']);
        const mockAnchor = {
            href: '',
            download: '',
            click: jest.fn(),
        };
        jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

        const context = createContext({
            isDownload: true,
            raw: blob,
            fileName: 'report.pdf',
        });

        await DownloadInterceptorHandler(context);

        expect((URL as any).createObjectURL).toHaveBeenCalledWith(blob);
        expect(mockAnchor.href).toBe('blob:mock-url');
        expect(mockAnchor.download).toBe('report.pdf');
        expect(mockAnchor.click).toHaveBeenCalled();
        expect(appendChildSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();
        expect((URL as any).revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
        expect(context.metadata.isDownloadHandled).toBe(true);
    });

    it('should use default filename when not specified', async () => {
        const blob = new Blob(['file content']);
        const mockAnchor = {
            href: '',
            download: '',
            click: jest.fn(),
        };
        jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

        const context = createContext({
            isDownload: true,
            raw: blob,
        });

        await DownloadInterceptorHandler(context);

        expect(mockAnchor.download).toBe('download');
    });

    it('should skip if no raw data', async () => {
        const context = createContext({ isDownload: true });
        await DownloadInterceptorHandler(context);
        expect(context.metadata.isDownloadHandled).toBeUndefined();
    });
});
