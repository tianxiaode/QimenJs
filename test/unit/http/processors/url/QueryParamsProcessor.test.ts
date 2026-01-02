import { QueryParamsProcessor } from '@/http/processors/url/QueryParamsProcessor';

describe('QueryParamsProcessor', () => {
  it('should return original URL when no queryParams provided', () => {
    const url = 'https://api.example.com/users';
    const options = {};

    const result = QueryParamsProcessor(url, options);

    expect(result).toBe(url);
  });

  it('should return original URL when queryParams is empty object', () => {
    const url = 'https://api.example.com/users';
    const options = { queryParams: {} };

    const result = QueryParamsProcessor(url, options);

    expect(result).toBe(url);
  });

  it('should append single query parameter to URL', () => {
    const url = 'https://api.example.com/users';
    const options = { queryParams: { id: '123' } };

    const result = QueryParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/users?id=123');
  });

  it('should append multiple query parameters to URL', () => {
    const url = 'https://api.example.com/users';
    const options = { queryParams: { id: '123', name: 'test', active: 'true' } };

    const result = QueryParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/users?id=123&name=test&active=true');
  });

  it('should handle URL that already has query parameters', () => {
    const url = 'https://api.example.com/users?existing=param';
    const options = { queryParams: { id: '123', name: 'test' } };

    const result = QueryParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/users?existing=param&id=123&name=test');
  });

  it('should handle query parameters with special characters', () => {
    const url = 'https://api.example.com/search';
    const options = { queryParams: { q: 'hello world', filter: 'type=a&status=active' } };

    const result = QueryParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/search?q=hello world&filter=type=a&status=active');
  });

  it('should handle numeric and boolean values as query parameters', () => {
    const url = 'https://api.example.com/data';
    const options = { queryParams: { page: 1, active: true, limit: 10 } };

    const result = QueryParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/data?page=1&active=true&limit=10');
  });

  it('should handle null and undefined values as query parameters', () => {
    const url = 'https://api.example.com/data';
    // @ts-ignore - testing edge case with null/undefined values
    const options = { queryParams: { valid: 'value', nullValue: null, undefinedValue: undefined } };

    const result = QueryParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/data?valid=value&nullValue=null&undefinedValue=undefined');
  });

  it('should preserve other options properties', () => {
    const url = 'https://api.example.com/users';
    const options = { 
      queryParams: { id: '123' }, 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    const result = QueryParamsProcessor(url, options);

    // The function only processes URL and queryParams, so options is unchanged
    expect(options).toEqual({ 
      queryParams: { id: '123' }, 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  });
});