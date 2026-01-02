import { PathParamsProcessor } from '@/http/processors/url/PathParamsProcessor';

describe('PathParamsProcessor', () => {
  it('should return original URL when no pathParams provided', () => {
    const url = 'https://api.example.com/users';
    const options = {};

    const result = PathParamsProcessor(url, options);

    expect(result).toBe(url);
  });

  it('should return original URL when pathParams is empty array', () => {
    const url = 'https://api.example.com/users';
    const options = { pathParams: [] };

    const result = PathParamsProcessor(url, options);

    expect(result).toBe(url);
  });

  it('should return original URL when pathParams is null', () => {
    const url = 'https://api.example.com/users';
    const options = { pathParams: null as any };

    const result = PathParamsProcessor(url, options);

    expect(result).toBe(url);
  });

  it('should append single path parameter to URL', () => {
    const url = 'https://api.example.com/users';
    const options = { pathParams: ['123'] };

    const result = PathParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/users/123');
  });

  it('should append multiple path parameters to URL', () => {
    const url = 'https://api.example.com/users';
    const options = { pathParams: ['123', 'posts', '456'] };

    const result = PathParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/users/123/posts/456');
  });

  it('should handle URL ending with slash correctly', () => {
    const url = 'https://api.example.com/users/';
    const options = { pathParams: ['123'] };

    const result = PathParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/users/123');
  });

  it('should handle URL with path parameters containing special characters', () => {
    const url = 'https://api.example.com/users';
    const options = { pathParams: ['user@domain.com', 'profile'] };

    const result = PathParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/users/user@domain.com/profile');
  });

  it('should handle URL with query parameters', () => {
    const url = 'https://api.example.com/users?sort=asc';
    const options = { pathParams: ['123'] };

    const result = PathParamsProcessor(url, options);

    expect(result).toBe('https://api.example.com/users?sort=asc/123');
  });

  it('should preserve other options properties', () => {
    const url = 'https://api.example.com/users';
    const options = { 
      pathParams: ['123'], 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    const result = PathParamsProcessor(url, options);

    // The function only processes URL and pathParams, so options is unchanged
    expect(options).toEqual({ 
      pathParams: ['123'], 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  });
});