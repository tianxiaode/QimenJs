import { prepareRequest, combineBaseUrl } from '@/http/core/request-helper';
import { HttpMethod, RequestOptions } from '@/http/types';

describe('prepareRequest', () => {
  it('should process URL with provided processors', () => {
    const mockUrlProcessor: (url: string, options: RequestOptions) => string = jest
      .fn()
      .mockImplementation((url) => `${url}/processed`);

    const result = prepareRequest(
      'https://api.example.com',
      '/users',
      'GET',
      {},
      [mockUrlProcessor],
      []
    );

    expect(mockUrlProcessor).toHaveBeenCalledWith('https://api.example.com/users', {});
    expect(result.finalUrl).toBe('https://api.example.com/users/processed');
  });

  it('should process headers with provided processors', () => {
    const mockHeaderProcessor: (headers: Record<string, string>, url: string, method: string, options: RequestOptions) => Record<string, string> = jest
      .fn()
      .mockImplementation((headers) => ({ ...headers, processed: 'true' }));

    const options: RequestOptions = { headers: { 'Content-Type': 'application/json' } };

    const result = prepareRequest(
      '',
      '/test',
      'POST',
      options,
      [],
      [mockHeaderProcessor]
    );

    expect(mockHeaderProcessor).toHaveBeenCalledWith(
      { 'Content-Type': 'application/json' },
      '/test',
      'POST',
      options
    );
    expect(result.finalHeaders).toEqual({
      'Content-Type': 'application/json',
      processed: 'true',
    });
  });

  it('should create a new AbortController when no signal is provided', () => {
    const result = prepareRequest('', '/test', 'GET', {}, [], []);
    
    expect(result.controller).toBeDefined();
    expect(result.signal).toBe(result.controller!.signal);
  });

  it('should use provided signal and not create a new controller', () => {
    const controller = new AbortController();
    const options: RequestOptions = { signal: controller.signal };

    const result = prepareRequest('', '/test', 'GET', options, [], []);
    
    expect(result.controller).toBeUndefined();
    expect(result.signal).toBe(controller.signal);
  });

  it('should apply all processors in sequence', () => {
    const urlProcessor1: (url: string, options: RequestOptions) => string = (url) => `${url}/step1`;
    const urlProcessor2: (url: string, options: RequestOptions) => string = (url) => `${url}/step2`;
    
    const headerProcessor1: (headers: Record<string, string>, url: string, method: string, options: RequestOptions) => Record<string, string> = (headers) => ({ ...headers, step1: 'true' });
    const headerProcessor2: (headers: Record<string, string>, url: string, method: string, options: RequestOptions) => Record<string, string> = (headers) => ({ ...headers, step2: 'true' });

    const result = prepareRequest(
      'https://api.example.com',
      '/users',
      'GET',
      { headers: { 'X-Test': 'value' } },
      [urlProcessor1, urlProcessor2],
      [headerProcessor1, headerProcessor2]
    );

    expect(result.finalUrl).toBe('https://api.example.com/users/step1/step2');
    expect(result.finalHeaders).toEqual({
      'X-Test': 'value',
      step1: 'true',
      step2: 'true',
    });
  });
});

describe('combineBaseUrl', () => {
  it('should return relative URL if no base URL is provided', () => {
    expect(combineBaseUrl('', '/api/users')).toBe('/api/users');
  });

  it('should return relative URL if it is an absolute URL', () => {
    expect(combineBaseUrl('https://api.example.com', 'https://other.com/users')).toBe(
      'https://other.com/users'
    );
  });

  it('should properly combine base URL with relative URL', () => {
    expect(combineBaseUrl('https://api.example.com', '/users')).toBe(
      'https://api.example.com/users'
    );
  });

  it('should handle trailing slash in base URL correctly', () => {
    expect(combineBaseUrl('https://api.example.com/', '/users')).toBe(
      'https://api.example.com/users'
    );
  });

  it('should handle leading slash in relative URL correctly', () => {
    expect(combineBaseUrl('https://api.example.com', 'users')).toBe(
      'https://api.example.com/users'
    );
  });

  it('should handle both slash cases correctly', () => {
    expect(combineBaseUrl('https://api.example.com/', 'users')).toBe(
      'https://api.example.com/users'
    );
  });
});