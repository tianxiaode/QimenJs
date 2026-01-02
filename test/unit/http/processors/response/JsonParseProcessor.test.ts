import { JsonParseProcessor } from '@/http/processors/response/JsonParseProcessor';

describe('JsonParseProcessor', () => {
  it('should parse JSON string when isJson is true and data is a string', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isJson: true
      },
      data: '{"name": "test", "value": 123}',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await JsonParseProcessor(context, options);

    expect(result).toEqual({
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isJson: true
      },
      data: { name: 'test', value: 123 },
      status: 200,
      options: {}
    });
  });

  it('should not parse when isJson is false', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isJson: false
      },
      data: '{"name": "test"}',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await JsonParseProcessor(context, options);

    expect(result).toEqual(context);
  });

  it('should not parse when data is not a string', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isJson: true
      },
      data: { name: 'test' },
      status: 200,
      options: {}
    };
    const options = {};

    const result = await JsonParseProcessor(context, options);

    expect(result).toEqual(context);
  });

  it('should not parse when data is an empty string', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isJson: true
      },
      data: '',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await JsonParseProcessor(context, options);

    expect(result).toEqual(context);
  });

  it('should return PARSE_ERROR when JSON parsing fails', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isJson: true
      },
      data: '{invalid json}',
      status: 200,
      options: {}
    };
    const options = {};

    await expect(JsonParseProcessor(context, options)).rejects.toEqual({
      type: 'PARSE_ERROR',
      message: 'Invalid JSON format'
    });
  });

  it('should handle nested JSON objects', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isJson: true
      },
      data: '{"level1": {"level2": {"level3": "value"}}}',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await JsonParseProcessor(context, options);

    expect(result.data).toEqual({
      level1: {
        level2: {
          level3: 'value'
        }
      }
    });
  });

  it('should handle JSON arrays', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isJson: true
      },
      data: '[1, 2, 3, {"key": "value"}]',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await JsonParseProcessor(context, options);

    expect(result.data).toEqual([1, 2, 3, { key: "value" }]);
  });

  it('should preserve other metadata properties', async () => {
    const context = {
      headers: {},
      metadata: {
        isTransportFailure: false,
        isHttpSuccess: false,
        isAborted: false,
        isJson: true,
        customProp: 'value'
      },
      data: '{"name": "test"}',
      status: 200,
      options: {}
    };
    const options = {};

    const result = await JsonParseProcessor(context, options);

    expect(result.metadata.customProp).toBe('value');
    expect(result.metadata.isJson).toBe(true);
  });
});