import { DataExtractorProcessor } from '@/http/processors/response/DataExtractorProcessor';

describe('DataExtractorProcessor', () => {
  it('should return context data directly', async () => {
    const context = {
      headers: { 'content-type': 'application/json' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isJson: true
      },
      data: { message: 'Hello World' },
      status: 200,
      options: {}
    };
    const options = {};

    const result = await DataExtractorProcessor(context, options);

    expect(result).toEqual(context.data);
    expect(result).toEqual({ message: 'Hello World' });
  });

  it('should return string data', async () => {
    const context = {
      headers: { 'content-type': 'text/plain' },
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isText: true
      },
      data: 'plain text response',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await DataExtractorProcessor(context, options);

    expect(result).toBe('plain text response');
  });

  it('should return number data', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: 42,
      status: 200,
      options: {}
    };
    const options = {};

    const result = await DataExtractorProcessor(context, options);

    expect(result).toBe(42);
  });

  it('should return array data', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: [1, 2, 3],
      status: 200,
      options: {}
    };
    const options = {};

    const result = await DataExtractorProcessor(context, options);

    expect(result).toEqual([1, 2, 3]);
  });

  it('should return null data', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: null,
      status: 200,
      options: {}
    };
    const options = {};

    const result = await DataExtractorProcessor(context, options);

    expect(result).toBeNull();
  });

  it('should return undefined data', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false
      },
      data: undefined,
      status: 200,
      options: {}
    };
    const options = {};

    const result = await DataExtractorProcessor(context, options);

    expect(result).toBeUndefined();
  });
});