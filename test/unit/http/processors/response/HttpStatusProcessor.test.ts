import { HttpStatusProcessor } from '@/http/processors/response/HttpStatusProcessor';

describe('HttpStatusProcessor', () => {
  it('should set isHttpSuccess to true for 2xx status codes', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: {},
      status: 200,
      options: {}
    };
    const options = {};

    const result = await HttpStatusProcessor(context, options);

    expect(result.metadata.isHttpSuccess).toBe(true);
  });

  it('should set isHttpSuccess to true for 201 status code', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: {},
      status: 201,
      options: {}
    };
    const options = {};

    const result = await HttpStatusProcessor(context, options);

    expect(result.metadata.isHttpSuccess).toBe(true);
  });

  it('should set isHttpSuccess to true for 299 status code', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: {},
      status: 299,
      options: {}
    };
    const options = {};

    const result = await HttpStatusProcessor(context, options);

    expect(result.metadata.isHttpSuccess).toBe(true);
  });

  it('should set isHttpSuccess to false for 400 status code', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: {},
      status: 400,
      options: {}
    };
    const options = {};

    const result = await HttpStatusProcessor(context, options);

    expect(result.metadata.isHttpSuccess).toBe(false);
  });

  it('should set isHttpSuccess to false for 500 status code', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: {},
      status: 500,
      options: {}
    };
    const options = {};

    const result = await HttpStatusProcessor(context, options);

    expect(result.metadata.isHttpSuccess).toBe(false);
  });

  it('should set isHttpSuccess to false for 300 status code', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: {},
      status: 300,
      options: {}
    };
    const options = {};

    const result = await HttpStatusProcessor(context, options);

    expect(result.metadata.isHttpSuccess).toBe(false);
  });

  it('should preserve original context properties', async () => {
    const context = {
      headers: { 'content-type': 'application/json' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        custom: 'value'
      },
      data: { message: 'test' },
      status: 200,
      options: {}
    };
    const options = {};

    const result = await HttpStatusProcessor(context, options);

    expect(result.headers).toEqual({ 'content-type': 'application/json' });
    expect(result.metadata.custom).toBe('value');
    expect(result.data).toEqual({ message: 'test' });
    expect(result.metadata.isHttpSuccess).toBe(true);
  });

  it('should return the same context object', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: {},
      status: 200,
      options: {}
    };
    const options = {};

    const result = await HttpStatusProcessor(context, options);

    expect(result).toBe(context);
  });
});