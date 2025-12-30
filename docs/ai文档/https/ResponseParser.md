是的，结合 **`DataExtractor`** 和 **`ErrorParser`** 确实可以避免两次后端数据解析，提高性能和代码简洁性。这种合并可以让我们在同一个解析器中同时处理错误和数据提取，避免重复处理响应体。

### 为什么合并：

1. **避免重复解析**：如果 `ErrorParser` 和 `DataExtractor` 分开处理，那么响应数据需要解析两次：一次检查错误，再次提取数据。将它们合并后，解析过程可以在一次遍历中同时完成。
2. **提高效率**：在一次遍历响应体时既可以处理错误，又可以提取数据，避免不必要的计算。
3. **一致性**：通过统一的解析流程，保持了错误处理和数据提取的协同一致性，便于后续的扩展和维护。

### 合并方案：

我们可以将 **`DataExtractor`** 和 **`ErrorParser`** 合并为一个统一的接口，命名为 `ResponseParser`，该接口既负责解析错误，也负责提取数据。

### 设计思路：

1. **`ResponseParser`** 接口：它包含了 `parseError` 和 `extractData` 两个方法，分别处理错误解析和数据提取。
2. **`ResponseParserFactory`**：负责管理和执行所有注册的 `ResponseParser`，它会一次性解析响应，既检查是否有错误，又提取有效数据。

### 调整后的架构设计

1. **`ResponseParser`**：合并了错误解析和数据提取。
2. **`ResponseParserFactory`**：负责注册和执行多个 `ResponseParser`。
3. **`HttpClient`**：统一处理错误和数据提取，调用 `ResponseParserFactory` 解析响应。

### 更新后的代码实现

#### 1. **`ResponseParser` 接口**

合并后的接口，既负责错误解析，也负责数据提取。

```typescript
import { HttpResponse, HttpError } from '../core/types';

export interface ResponseParser {
  parseError(response: HttpResponse): HttpError | null;   // 错误解析方法
  extractData(response: HttpResponse): any | null;         // 数据提取方法
}
```

#### 2. **`ResponseParserFactory`**

`ResponseParserFactory` 管理所有 `ResponseParser` 的注册和执行。它会依次调用每个注册的解析器，首先解析错误，如果没有错误再提取数据。

```typescript
import { ResponseParser } from './ResponseParser';
import { HttpResponse, HttpError } from '../core/types';
import { ResponseParserPipeline } from './ResponseParserPipeline';

export class ResponseParserFactory {
  private static pipeline = new ResponseParserPipeline();

  // 注册自定义解析器
  static registerParser(parser: ResponseParser): void {
    this.pipeline.addParser(parser);
  }

  // 解析错误和数据
  static parseResponse(response: HttpResponse): { error: HttpError | null, data: any } {
    const error = this.pipeline.parseError(response);
    const data = this.pipeline.extractData(response);
    return { error, data };  // 返回错误和提取的数据
  }
}
```

#### 3. **`ResponseParserPipeline`**

`ResponseParserPipeline` 会执行多个解析器，并分别处理错误解析和数据提取。

```typescript
import { ResponseParser } from './ResponseParser';
import { HttpResponse, HttpError } from '../core/types';

export class ResponseParserPipeline {
  private parsers: ResponseParser[] = [];

  // 向管道中添加解析器
  addParser(parser: ResponseParser): void {
    this.parsers.push(parser);
  }

  // 解析错误
  public parseError(response: HttpResponse): HttpError | null {
    for (const parser of this.parsers) {
      const error = parser.parseError(response);
      if (error) {
        return error;  // 如果某个解析器找到了错误，立即返回
      }
    }
    return null;  // 如果没有错误，返回 null
  }

  // 提取数据
  public extractData(response: HttpResponse): any {
    for (const parser of this.parsers) {
      const data = parser.extractData(response);
      if (data !== null) {
        return data;  // 如果某个解析器提取到了数据，立即返回
      }
    }
    return null;  // 如果没有数据，返回 null
  }
}
```

#### 4. **具体的响应解析器实现**

每个具体的解析器实现都会同时处理错误和数据提取。例如，`JsonResponseParser` 会解析 JSON 响应中的错误和数据。

```typescript
import { ResponseParser } from './ResponseParser';
import { HttpResponse, HttpError } from '../core/types';

export class JsonResponseParser implements ResponseParser {
  parseError(response: HttpResponse): HttpError | null {
    if (response.isJsonResponse()) {
      const body = response.getBody();
      if (body.errorCode || body.code || body.errorMessage || body.msg) {
        return new HttpError(response.statusCode, body.errorMessage || 'Unknown error', body);
      }
    }
    return null;  // 如果没有错误，返回 null
  }

  extractData(response: HttpResponse): any | null {
    if (response.isJsonResponse()) {
      const body = response.getBody();
      if (body && body.data) {
        return body.data;  // 提取数据字段
      }
    }
    return null;  // 如果没有数据，返回 null
  }
}
```

#### 5. **`HttpClient` 更新**

`HttpClient` 只负责发起请求，处理响应并通过 `ResponseParserFactory` 统一解析错误和提取数据。

```typescript
import { HttpRequest, HttpResponse } from './types';
import { ResponseParserFactory } from '../pipeline/ResponseParserFactory';
import { HttpTransport } from '../transport/HttpTransport';

export class HttpClient {
  constructor(
    private transport: HttpTransport,
    private middleware: Function[] = []
  ) {}

  public async request(request: HttpRequest): Promise<any> {
    // 发送请求并获取响应
    const modifiedRequest = this.applyMiddleware(request);
    const response = await this.transport.send(modifiedRequest);

    // 使用 ResponseParserFactory 解析响应
    const { error, data } = ResponseParserFactory.parseResponse(response);

    if (error) {
      throw error;  // 如果有错误，抛出错误
    }

    return data;  // 返回提取的数据
  }

  private applyMiddleware(request: HttpRequest): HttpRequest {
    // 这里可以依次执行中间件
    return request;
  }
}
```

### 总结：

1. **`ResponseParser`** 接口合并了错误解析和数据提取，避免重复解析响应体。
2. **`ResponseParserFactory`** 负责统一管理和执行所有的 `ResponseParser`，同时处理错误和数据提取。
3. **`HttpClient`** 发起请求后，通过 `ResponseParserFactory` 解析响应，返回提取的数据或抛出错误。
4. 每个具体的解析器（如 `JsonResponseParser`）负责解析不同的响应结构，提取数据并处理错误。

这样，我们实现了一个 **单次响应解析机制**，既能处理错误，又能提取数据，避免了多次解析，提高了性能和代码的简洁性。
