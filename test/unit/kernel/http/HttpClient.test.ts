import { HttpClient } from '@/kernel/http/HttpClient';
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

describe('HttpClient', () => {
    let httpClient: HttpClient;
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

        httpClient = new HttpClient(domain);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with the provided domain', () => {
            const client = new HttpClient(domain);
            expect((client as any).domain).toBe(domain);
        });

        it('should initialize with default domain if none provided', () => {
            const client = new HttpClient();
            expect((client as any).domain).toBe('default');
        });
    });

    describe('request', () => {
        it('should create a request task with correct parameters', async () => {
            const mockPipeline: any[] = [];
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
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
            
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getHttpPipeline')
                .mockReturnValue(mockPipeline);
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const task = httpClient.request('GET', '/test');

            expect(task).toHaveProperty('context');
            expect(task).toHaveProperty('cancel');
            
            const context = await task.context;
            expect(context).toEqual(mockContext);
        });

        it('should allow cancellation of request', () => {
            const mockPipeline: any[] = [];
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
                    url: '/test',
                    status: 200,
                    isSuccess: true,
                    headers: {},
                    method: 'GET',
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
            
            jest.spyOn(EntityActionRegistrar.getInstance(), 'getHttpPipeline')
                .mockReturnValue(mockPipeline);
            (coreModule.createFlowContext as jest.Mock).mockReturnValue(mockContext);
            (coreModule.runPipeline as jest.Mock).mockResolvedValue(mockContext);

            const task = httpClient.request('GET', '/test');
            
            // Check that cancel method exists
            expect(typeof task.cancel).toBe('function');
            
            // Test that calling cancel doesn't throw an error
            expect(() => task.cancel()).not.toThrow();
        });
    });

    describe('get', () => {
        it('should call request with GET method', () => {
            const requestSpy = jest.spyOn(httpClient, 'request');
            
            httpClient.get('/test');
            
            expect(requestSpy).toHaveBeenCalledWith('GET', '/test', {});
        });

        it('should call request with GET method and options', () => {
            const requestSpy = jest.spyOn(httpClient, 'request');
            const options = { headers: { 'Content-Type': 'application/json' } };
            
            httpClient.get('/test', options);
            
            expect(requestSpy).toHaveBeenCalledWith('GET', '/test', options);
        });
    });

    describe('post', () => {
        it('should call request with POST method and body', () => {
            const requestSpy = jest.spyOn(httpClient, 'request');
            const body = { data: 'test' };
            
            httpClient.post('/test', body);
            
            expect(requestSpy).toHaveBeenCalledWith('POST', '/test', { body });
        });

        it('should call request with POST method, body and options', () => {
            const requestSpy = jest.spyOn(httpClient, 'request');
            const body = { data: 'test' };
            const options = { headers: { 'Content-Type': 'application/json' } };
            
            httpClient.post('/test', body, options);
            
            expect(requestSpy).toHaveBeenCalledWith('POST', '/test', { ...options, body });
        });
    });

    describe('put', () => {
        it('should call request with PUT method and body', () => {
            const requestSpy = jest.spyOn(httpClient, 'request');
            const body = { data: 'test' };
            
            httpClient.put('/test', body);
            
            expect(requestSpy).toHaveBeenCalledWith('PUT', '/test', { body });
        });
    });

    describe('patch', () => {
        it('should call request with PATCH method and body', () => {
            const requestSpy = jest.spyOn(httpClient, 'request');
            const body = { data: 'test' };
            
            httpClient.patch('/test', body);
            
            expect(requestSpy).toHaveBeenCalledWith('PATCH', '/test', { body });
        });
    });

    describe('delete', () => {
        it('should call request with DELETE method', () => {
            const requestSpy = jest.spyOn(httpClient, 'request');
            
            httpClient.delete('/test');
            
            expect(requestSpy).toHaveBeenCalledWith('DELETE', '/test', {});
        });
    });

    describe('upload', () => {
        it('should call request with POST method and upload options', () => {
            const requestSpy = jest.spyOn(httpClient, 'request');
            const body = { file: 'test' };
            const onProgress = jest.fn();
            const options = { headers: { 'Content-Type': 'multipart/form-data' } };
            
            httpClient.upload('/upload', body, onProgress, options);
            
            expect(requestSpy).toHaveBeenCalledWith('POST', '/upload', { 
                ...options, 
                body, 
                onProgress, 
                isUpload: true 
            });
        });
    });

    describe('download', () => {
        it('should call request with GET method and download options', () => {
            const requestSpy = jest.spyOn(httpClient, 'request');
            const onProgress = jest.fn();
            const options = { headers: { 'Accept': 'application/octet-stream' } };
            
            httpClient.download('/download', onProgress, options);
            
            expect(requestSpy).toHaveBeenCalledWith('GET', '/download', { 
                ...options, 
                onProgress, 
                isDownload: true 
            });
        });
    });
});