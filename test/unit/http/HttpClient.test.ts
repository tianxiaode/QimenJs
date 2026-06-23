/**
 * HttpClient 单元测试
 */

import { HttpClient } from '@/http';

describe('HttpClient', () => {
    let client: HttpClient;
    
    beforeEach(() => {
        client = new HttpClient('user');
    });
    
    describe('constructor', () => {
        it('should create client with domain', () => {
            expect(client).toBeInstanceOf(HttpClient);
        });
        
        it('should create client with default domain', () => {
            const defaultClient = new HttpClient();
            expect(defaultClient).toBeInstanceOf(HttpClient);
        });
    });
    
    describe('HTTP methods', () => {
        it('should create GET request', async () => {
            const task = client.get('/api/users');
            const result = await task.context;
            
            expect(result.identity.domain).toBe('user');
            expect(result.request.url).toBe('/api/users');
            expect(result.request.method).toBe('GET');
        });
        
        it('should create POST request', async () => {
            const task = client.post('/api/users', { name: 'test' });
            const result = await task.context;
            
            expect(result.request.method).toBe('POST');
            expect(result.request.body).toEqual({ name: 'test' });
        });
        
        it('should create PUT request', async () => {
            const task = client.put('/api/users/1', { name: 'updated' });
            const result = await task.context;
            
            expect(result.request.method).toBe('PUT');
            expect(result.request.body).toEqual({ name: 'updated' });
        });
        
        it('should create PATCH request', async () => {
            const task = client.patch('/api/users/1', { name: 'patched' });
            const result = await task.context;
            
            expect(result.request.method).toBe('PATCH');
            expect(result.request.body).toEqual({ name: 'patched' });
        });
        
        it('should create DELETE request', async () => {
            const task = client.delete('/api/users/1');
            const result = await task.context;
            
            expect(result.request.method).toBe('DELETE');
        });
    });
    
    describe('request options', () => {
        it('should support headers', async () => {
            const task = client.get('/api/users', {
                headers: { 'Authorization': 'Bearer token' },
            });
            const result = await task.context;
            
            expect(result.request.headers).toEqual({ 'Authorization': 'Bearer token' });
        });
        
        it('should support query params', async () => {
            const task = client.get('/api/users', {
                queryParams: { page: 1, size: 10 },
            });
            const result = await task.context;
            
            expect(result.request.queryParams).toEqual({ page: 1, size: 10 });
        });
    });
    
    describe('cancel', () => {
        it('should support cancel', async () => {
            const task = client.get('/api/users');
            task.cancel('user cancelled');
            
            const result = await task.context;
            
            expect(result.metadata.isAborted).toBe(true);
        });
    });
});
