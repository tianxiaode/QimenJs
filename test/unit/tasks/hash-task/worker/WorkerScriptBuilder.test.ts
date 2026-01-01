import { WorkerScriptBuilder } from '@/tasks/hash-task/worker/WorkerScriptBuilder';

describe('WorkerScriptBuilder', () => {
  let builder: WorkerScriptBuilder;

  beforeEach(() => {
    builder = new WorkerScriptBuilder();
  });

  test('should build script from a function', () => {
    const algorithm = (data: ArrayBuffer) => {
      return data.byteLength;
    };

    const result = builder.build(algorithm);

    expect(result).toContain(algorithm.toString());
    expect(result).toContain('self.onmessage');
    expect(result).toContain('userAlgorithm');
    // The placeholder should be replaced, not present in the final result
    expect(result).not.toContain('{{ALGORITHM_PLACEHOLDER}}');
  });

  test('should build script from a built-in algorithm name', () => {
    const result = builder.build('sha256');

    expect(result).toContain('SHA256');
    expect(result).toContain('self.crypto.subtle.digest');
  });

  test('should properly inject algorithm into template', () => {
    const algorithm = (data: ArrayBuffer) => {
      return 'computed hash';
    };

    const result = builder.build(algorithm);

    // Check that the template structure is preserved and algorithm is properly injected
    expect(result).toContain(algorithm.toString());
    expect(result).toContain('self.onmessage');
    expect(result).toContain('const { type, data, chunkId } = e.data;');
  });

  test('should handle different algorithm names', () => {
    const sha1Result = builder.build('sha1');
    const md5Result = builder.build('md5');

    expect(sha1Result).toContain('SHA1');
    expect(md5Result).toContain('MD5');
  });

  test('should build with different function types', () => {
    // Test with arrow function
    const arrowFn = (data: ArrayBuffer) => data;
    const arrowResult = builder.build(arrowFn);
    expect(arrowResult).toContain(arrowFn.toString());

    // Test with regular function
    function regularFn(data: ArrayBuffer) {
      return data;
    }
    const regularResult = builder.build(regularFn);
    expect(regularResult).toContain(regularFn.toString());
  });

  test('should handle async functions', () => {
    const asyncFn = async (data: ArrayBuffer) => {
      return Promise.resolve(data);
    };

    const result = builder.build(asyncFn);

    // The function should be properly converted to string
    expect(result).toContain('async (data) =>');
    expect(result).toContain('Promise.resolve(data)');
  });
});