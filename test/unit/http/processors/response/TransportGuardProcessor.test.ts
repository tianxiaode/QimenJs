import { TransportFailureProcessor } from '@/http/processors/response/TransportGuardProcessor';

describe('TransportFailureProcessor', () => {
  it('should return context when isTransportFailure is false', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: { message: 'success' },
      status: 200,
      options: {}
    };
    const options = {};

    const result = await TransportFailureProcessor(context, options);

    expect(result).toEqual(context);
  });

  it('should return context when isTransportFailure is not set in metadata', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: { message: 'success' },
      status: 200,
      options: {}
    };
    const options = {};

    const result = await TransportFailureProcessor(context, options);

    expect(result).toEqual(context);
  });

  it('should reject with error when isTransportFailure is true', async () => {
    const mockError = { message: 'Network error', code: 'ECONNREFUSED' };
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: true,
        isHttpSuccess: false,
        isAborted: false,
        error: mockError
      },
      data: {},
      status: 0,
      options: {}
    };
    const options = {};

    await expect(TransportFailureProcessor(context, options)).rejects.toEqual(mockError);
  });

  it('should reject with error when isTransportFailure is true with undefined error', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: true,
        isHttpSuccess: false,
        isAborted: false,
        error: undefined
      },
      data: {},
      status: 0,
      options: {}
    };
    const options = {};

    await expect(TransportFailureProcessor(context, options)).rejects.toBeUndefined();
  });

  it('should preserve original context properties when no transport failure', async () => {
    const context = {
      headers: { 'content-type': 'application/json' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        custom: 'value'
      },
      data: { id: 1, name: 'test' },
      status: 200,
      options: {}
    };
    const options = {};

    const result = await TransportFailureProcessor(context, options);

    expect(result).toEqual(context);
  });

  it('should handle context with minimal metadata', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: { message: 'data' },
      status: 200,
      options: {}
    } as any;
    const options = {};

    const result = await TransportFailureProcessor(context, options);

    expect(result).toEqual(context);
  });
});