import { RestErrorProcessor } from '@/http/processors/response/RestErrorProcessor';

describe('RestErrorProcessor', () => {
  it('should return context when isHttpSuccess is true', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: true,
        isAborted: false
      },
      data: { message: 'success' },
      status: 200,
      options: {}
    };
    const options = {};

    const result = await RestErrorProcessor(context, options);

    expect(result).toEqual(context);
  });

  it('should reject with REST_ERROR when isHttpSuccess is false', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: { error: 'Unauthorized', code: 40101 },
      status: 401,
      options: {}
    };
    const options = {};

    await expect(RestErrorProcessor(context, options)).rejects.toEqual({
      type: 'REST_ERROR',
      status: 401,
      details: { error: 'Unauthorized', code: 40101 },
      message: 'Request failed with status 401'
    });
  });

  it('should use message from data when available', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: { message: 'Custom error message' },
      status: 400,
      options: {}
    };
    const options = {};

    await expect(RestErrorProcessor(context, options)).rejects.toEqual({
      type: 'REST_ERROR',
      status: 400,
      details: { message: 'Custom error message' },
      message: 'Custom error message'
    });
  });

  it('should provide default message when no message in data', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: { error: 'Some error' },
      status: 500,
      options: {}
    };
    const options = {};

    await expect(RestErrorProcessor(context, options)).rejects.toEqual({
      type: 'REST_ERROR',
      status: 500,
      details: { error: 'Some error' },
      message: 'Request failed with status 500'
    });
  });

  it('should preserve original context when successful', async () => {
    const context = {
      headers: { 'content-type': 'application/json' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: true,
        isAborted: false,
        custom: 'value'
      },
      data: { id: 1, name: 'test' },
      status: 201,
      options: {}
    };
    const options = {};

    const result = await RestErrorProcessor(context, options);

    expect(result).toEqual(context);
  });

  it('should reject with complete error object when failing', async () => {
    const context = {
      headers: { 'content-type': 'application/json' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        custom: 'value'
      },
      data: { id: 1, error: 'Error occurred' },
      status: 404,
      options: {}
    };
    const options = {};

    await expect(RestErrorProcessor(context, options)).rejects.toEqual({
      type: 'REST_ERROR',
      status: 404,
      details: { id: 1, error: 'Error occurred' },
      message: 'Request failed with status 404'
    });
  });
});