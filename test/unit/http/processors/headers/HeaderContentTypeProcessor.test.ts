import { HeaderContentTypeProcessor } from '@/http/processors/headers/HeaderContentTypeProcessor';

describe('HeaderContentTypeProcessor', () => {
  it('should not override existing Content-Type header', () => {
    const headers = { 'Content-Type': 'application/json' };
    const options = { body: { name: 'test' } };
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual(headers);
  });

  it('should not override existing content-type header (lowercase)', () => {
    const headers = { 'content-type': 'text/plain' };
    const options = { body: 'hello' };
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual(headers);
  });

  it('should not set Content-Type for requests without body', () => {
    const headers = { 'X-Custom-Header': 'value' };
    const options = {};
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual(headers);
  });

  it('should not set Content-Type for FormData body', () => {
    const formData = new FormData();
    formData.append('key', 'value');
    const headers = {};
    const options = { body: formData };
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual({});
  });

  it('should set application/x-www-form-urlencoded for URLSearchParams body', () => {
    const params = new URLSearchParams();
    params.append('name', 'value');
    const headers = {};
    const options = { body: params };
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual({
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    });
  });

  it('should set correct Content-Type for Blob body', () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const headers = {};
    const options = { body: blob };
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual({
      'Content-Type': 'text/plain'
    });
  });

  it('should set application/octet-stream for Blob without type', () => {
    const blob = new Blob(['test']);
    const headers = {};
    const options = { body: blob };
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual({
      'Content-Type': 'application/octet-stream'
    });
  });

  it('should set application/json for object body', () => {
    const headers = {};
    const options = { body: { name: 'test' } };
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual({
      'Content-Type': 'application/json;charset=UTF-8'
    });
  });

  it('should set text/plain for string body', () => {
    const headers = {};
    const options = { body: 'hello world' };
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual({
      'Content-Type': 'text/plain;charset=UTF-8'
    });
  });

  it('should handle null body correctly', () => {
    const headers = {};
    const options = { body: null };
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual(headers);
  });

  it('should spread original headers when adding Content-Type', () => {
    const headers = { 'X-Custom': 'value' };
    const options = { body: { name: 'test' } };
    
    const result = HeaderContentTypeProcessor(headers, '', '', options);
    
    expect(result).toEqual({
      'X-Custom': 'value',
      'Content-Type': 'application/json;charset=UTF-8'
    });
  });
});