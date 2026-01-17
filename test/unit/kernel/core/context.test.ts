import { createFlowContext } from '@/kernel/core/context';
import { ENTITY_ACTION } from '@/kernel/types/base';
import { HttpMethod, RequestOptions } from '@/kernel/types/http';
import { Schema } from '@/kernel/types/entities/schema';
import { FlowContext } from '@/kernel/types/actions';
import { DomainConfig } from '@orbitjs/registry';

describe('context', () => {
  describe('createFlowContext', () => {
    const mockDomainConfig: DomainConfig = {
      baseUrl: 'https://api.example.com',
      preset: 'abp',
      pageSize: 10,
      pagesizes: [10, 20, 50],
      timeout: 5000,
      custom: {}
    };

    const mockRequestOptions: RequestOptions = {
      params: { id: '123' },
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'test' },
      pathParams: ['path', 'params'],
      queryParams: { q: 'value' }
    };

    it('should create a flow context with all required properties', () => {
      const context = createFlowContext(
        'GET',
        '/users',
        'users',
        mockDomainConfig,
        mockRequestOptions,
        'userEntity',
        'READ' as ENTITY_ACTION, // 使用字符串字面量类型，因为 ENTITY_ACTION 是一个联合类型
      );

      expect(context.domain).toBe('users');
      expect(context.entityName).toBe('userEntity');
      expect(context.action).toBe('READ');
      expect(context.config).toBe(mockDomainConfig);
      expect(context.isAborted).toBe(false);
      expect(context.params).toBe(mockRequestOptions.params);
      
      // Check metadata properties
      expect(context.metadata.isUpload).toBe(!!mockRequestOptions.isUpload);
      expect(context.metadata.isDownload).toBe(!!mockRequestOptions.isDownload);
      expect(context.metadata.silent).toBe(!!mockRequestOptions.silent);
      
      // Check http properties
      expect(context.http.url).toBe('/users');
      expect(context.http.method).toBe('GET');
      expect(context.http.headers).toBe(mockRequestOptions.headers);
      expect(context.http.body).toBe(mockRequestOptions.body);
      expect(context.http.pathParams).toBe(mockRequestOptions.pathParams);
      expect(context.http.queryParams).toBe(mockRequestOptions.queryParams);
      
      // Check data container
      expect(context.data.list).toEqual([]);
      expect(context.data.item).toBeNull();
      
      // Check steps
      expect(context.steps).toEqual([]);
    });

    it('should handle optional parameters correctly', () => {
      const context = createFlowContext(
        'POST',
        '/posts',
        'posts',
        mockDomainConfig,
        mockRequestOptions
      );

      expect(context.entityName).toBeUndefined();
      expect(context.action).toBeUndefined();
    });

    it('should handle schema mapping with alignToFrontend function', () => {
      const schema: Schema = {
        name: 'user',
        fields: [
          { name: 'firstName', mapping: 'first_name', type: 'string' },
          { name: 'lastName', mapping: 'last_name', type: 'string' },
          { name: 'email', type: 'string' }
        ]
      };

      const context = createFlowContext(
        'GET',
        '/users/1',
        'users',
        mockDomainConfig,
        mockRequestOptions,
        'userEntity',
        'READ' as ENTITY_ACTION, // 使用字符串字面量类型
        schema
      );

      const backendData = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      };

      const frontendData = context.alignToFrontend(backendData);

      expect(frontendData.id).toBe(1);
      expect(frontendData.firstName).toBe('John');
      expect(frontendData.lastName).toBe('Doe');
      expect(frontendData.email).toBe('john@example.com');
      expect(frontendData.first_name).toBeUndefined();
      expect(frontendData.last_name).toBeUndefined();
    });

    it('should handle array data with schema mapping', () => {
      const schema: Schema = {
        name: 'user',
        fields: [
          { name: 'firstName', mapping: 'first_name', type: 'string' },
          { name: 'lastName', mapping: 'last_name', type: 'string' }
        ]
      };

      const context = createFlowContext(
        'GET',
        '/users',
        'users',
        mockDomainConfig,
        mockRequestOptions,
        'userEntity',
        'READ' as ENTITY_ACTION, // 使用字符串字面量类型
        schema
      );

      const backendData = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' }
      ];

      const frontendData = context.alignToFrontend(backendData);

      expect(Array.isArray(frontendData)).toBe(true);
      expect(frontendData.length).toBe(2);
      expect(frontendData[0].firstName).toBe('John');
      expect(frontendData[0].lastName).toBe('Doe');
      expect(frontendData[1].firstName).toBe('Jane');
      expect(frontendData[1].lastName).toBe('Smith');
      expect(frontendData[0].first_name).toBeUndefined();
      expect(frontendData[1].last_name).toBeUndefined();
    });

    it('should return original data if no schema is provided', () => {
      const context = createFlowContext(
        'GET',
        '/users/1',
        'users',
        mockDomainConfig,
        mockRequestOptions
      );

      const originalData = { id: 1, name: 'Test User' };
      const result = context.alignToFrontend(originalData);

      expect(result).toBe(originalData);
    });

    it('should return original data if target is null or undefined', () => {
      const context = createFlowContext(
        'GET',
        '/users/1',
        'users',
        mockDomainConfig,
        mockRequestOptions
      );

      expect(context.alignToFrontend(null)).toBeNull();
      expect(context.alignToFrontend(undefined)).toBeUndefined();
    });
  });
});