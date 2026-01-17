import { StreamClient } from '@/kernel/http/StreamClient';
import { EntityActionRegistrar } from '@/kernel/registrars';
import { DomainRegistrar } from '@orbitjs/registry';
import * as coreModule from '@/kernel/core';
import { FlowContext } from '@/kernel/types';

// Mock Logger module to prevent initialization issues during tests
jest.mock('@/logger', () => {
    return {
        Logger: {
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            }))
        }
    };
});

// Mock core module functions to prevent redefinition issues
jest.mock('@/kernel/core', () => {
    const originalModule = jest.requireActual('@/kernel/core');
    return {
        ...originalModule,
        createFlowContext: jest.fn(),
        runPipeline: jest.fn(),
    };
});

describe('StreamClient', () => {
    let streamClient: StreamClient;
    const domain = 'test-domain';

    beforeEach(() => {
        // Mock DomainRegistrar
        jest.spyOn(DomainRegistrar.getInstance(), 'get').mockReturnValue({
            name: domain,
            baseUrl: 'https://api.example.com',
            preset: 'default',
            pageSize: 10,
            pagesizes: [10, 20, 50]
        } as any);

        streamClient = new StreamClient(domain);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with the provided domain', () => {
            const client = new StreamClient(domain);
            expect((client as any).domain).toBe(domain);
        });

        it('should initialize with default domain if none provided', () => {
            const client = new StreamClient();
            expect((client as any).domain).toBe('default');
        });
    });

    describe('chatStream', () => {
        it('should return a StreamTask with stream, cancel, and context properties', () => {
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target // 添加缺失的方法
            };
            
            // Mock the modules correctly
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
                
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline')
                .mockReturnValue([]);
                
            // 修复 mockResolvedValue 的值，返回正确的 FlowContext
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const body = { message: 'test' };
            const options = {};

            const task = streamClient.chatStream('/stream', body, options);

            expect(task).toHaveProperty('stream');
            expect(task).toHaveProperty('cancel');
            expect(task).toHaveProperty('context');
            expect(task.context).toEqual(mockContext);
        });

        it('should allow cancellation of stream', () => {
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target // 添加缺失的方法
            };
            
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
                
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline')
                .mockReturnValue([]);
                
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const body = { message: 'test' };
            const options = {};

            const task = streamClient.chatStream('/stream', body, options);

            expect(typeof task.cancel).toBe('function');
            
            // Test that calling cancel doesn't throw an error
            expect(() => task.cancel()).not.toThrow();
        });

        it('should handle streaming data correctly', async () => {
            // We can't fully test the async generator in a unit test
            // But we can at least ensure the structure is correct
            const mockContext: FlowContext = {
                domain: domain,
                config: {
                    name: domain,
                    baseUrl: 'https://api.example.com',
                    preset: 'default',
                    pageSize: 10,
                    pagesizes: [10, 20, 50]
                },
                params: {},
                error: null,
                isAborted: false,
                metadata: {
                    isTransportFailure: false,
                    hasError: false,
                    contentType: '',
                    isJson: false,
                    isText: false,
                    isBlob: false,
                    action: '',
                    isUpload: false,
                    isDownload: false,
                    isErrorHandled: false,
                },
                data: {
                    source: null,
                    parsed: null,
                    raw: null,
                    list: [],
                    item: null,
                    total: 0,
                },
                http: {
                    url: '/stream',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'POST',
                    pathParams: [],
                    timeout: 10000,
                    responseType: 'json',
                    signal: new AbortController().signal,
                    controller: new AbortController(),
                    responseHeaders: {}
                },
                steps: [],
                alignToFrontend: (target: any) => target // 添加缺失的方法
            };
            
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
                
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getPreparePipeline')
                .mockReturnValue([]);
                
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const body = { message: 'test' };
            const options = {};

            const task = streamClient.chatStream<{text: string}>('/stream', body, options);

            // Verify that the stream property is an async iterable
            expect(task.stream).toBeDefined();
            expect(typeof task.stream[Symbol.asyncIterator]).toBe('function');
        });
    });
});