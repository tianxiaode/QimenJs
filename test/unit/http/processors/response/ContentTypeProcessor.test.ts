import { ContentTypeProcessor } from '@/http/processors/response/ContentTypeProcessor';

describe('ContentTypeProcessor', () => {
  it('should extract JSON content type and set appropriate metadata', async () => {
    const context = {
      headers: { 'content-type': 'application/json; charset=utf-8' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: '{}',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await ContentTypeProcessor(context, options);

    expect(result.metadata.contentType).toBe('application/json');
    expect(result.metadata.isJson).toBe(true);
    expect(result.metadata.isText).toBe(false);
    expect(result.metadata.isBlob).toBe(false);
  });

  it('should extract text content type and set appropriate metadata', async () => {
    const context = {
      headers: { 'Content-Type': 'text/plain; charset=iso-8859-1' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: 'plain text',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await ContentTypeProcessor(context, options);

    expect(result.metadata.contentType).toBe('text/plain');
    expect(result.metadata.isJson).toBe(false);
    expect(result.metadata.isText).toBe(true);
    expect(result.metadata.isBlob).toBe(false);
  });

  it('should extract image content type and set appropriate metadata', async () => {
    const context = {
      headers: { 'content-type': 'image/png' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: 'binary',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await ContentTypeProcessor(context, options);

    expect(result.metadata.contentType).toBe('image/png');
    expect(result.metadata.isJson).toBe(false);
    expect(result.metadata.isText).toBe(false);
    expect(result.metadata.isBlob).toBe(true);
  });

  it('should extract audio content type and set appropriate metadata', async () => {
    const context = {
      headers: { 'Content-Type': 'audio/mpeg' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: 'binary',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await ContentTypeProcessor(context, options);

    expect(result.metadata.contentType).toBe('audio/mpeg');
    expect(result.metadata.isJson).toBe(false);
    expect(result.metadata.isText).toBe(false);
    expect(result.metadata.isBlob).toBe(true);
  });

  it('should extract video content type and set appropriate metadata', async () => {
    const context = {
      headers: { 'content-type': 'video/mp4' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: 'binary',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await ContentTypeProcessor(context, options);

    expect(result.metadata.contentType).toBe('video/mp4');
    expect(result.metadata.isJson).toBe(false);
    expect(result.metadata.isText).toBe(false);
    expect(result.metadata.isBlob).toBe(true);
  });

  it('should extract application/octet-stream and set appropriate metadata', async () => {
    const context = {
      headers: { 'Content-Type': 'application/octet-stream' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: 'binary',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await ContentTypeProcessor(context, options);

    expect(result.metadata.contentType).toBe('application/octet-stream');
    expect(result.metadata.isJson).toBe(false);
    expect(result.metadata.isText).toBe(false);
    expect(result.metadata.isBlob).toBe(true);
  });

  it('should handle empty headers', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: '{}',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await ContentTypeProcessor(context, options);

    expect(result.metadata.contentType).toBe('');
    expect(result.metadata.isJson).toBe(false);
    expect(result.metadata.isText).toBe(false);
    expect(result.metadata.isBlob).toBe(false);
  });

  it('should handle undefined headers by treating as empty object', async () => {
    // 创建一个 headers 为 undefined 的 context，但通过类型断言来绕过 TypeScript 检查
    const context: any = {
      headers: undefined,
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: '{}',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await ContentTypeProcessor(context, options);

    expect(result.metadata.contentType).toBe('');
    expect(result.metadata.isJson).toBe(false);
    expect(result.metadata.isText).toBe(false);
    expect(result.metadata.isBlob).toBe(false);
  });

  it('should preserve original context properties', async () => {
    const context = {
      headers: { 'content-type': 'application/json' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: '{"key": "value"}',
      status: 201,
      options: {}
    };
    const options = {};

    const result = await ContentTypeProcessor(context, options);

    expect(result.data).toBe('{"key": "value"}');
    expect(result.status).toBe(201);
    expect(result.metadata.contentType).toBe('application/json');
  });
});