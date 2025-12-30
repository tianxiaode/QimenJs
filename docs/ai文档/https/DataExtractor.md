你提出的**数据提取**问题也是一个常见的挑战，尤其是当后端返回的数据结构不统一时。在这种情况下，我们不能总是返回原始的响应数据，因为每个后端的字段和结构可能都不相同。为了简化数据的处理和提取，尤其是在面对不同格式的响应时，**需要一个统一的提取机制**。

### 解决思路：

1. **数据提取接口（`DataExtractor`）**：类似于 `ErrorParser`，我们可以定义一个 `DataExtractor` 接口，用来处理不同格式的响应数据。每个数据提取器会负责根据特定的结构提取有效数据。

2. **自定义提取器的注册**：和 `ErrorParser` 一样，开发者可以在应用启动时注册不同的 **数据提取器**，然后 `HttpClient` 会使用 `DataExtractorFactory` 来统一提取数据。

3. **`HttpClient` 和 `DataExtractorFactory` 协同工作**：`HttpClient` 在收到响应后，先通过 `ErrorParserFactory` 判断是否有错误，然后通过 `DataExtractorFactory` 提取实际的数据。

4. **数据格式化和标准化**：为了保证统一性，所有的提取器都应该将提取的数据转化为一个标准格式，比如返回一个包含 `data` 和 `meta` 的结构，这样便于后续处理和使用。

### 调整后的架构设计

我们将增加一个 **`DataExtractor`** 机制，用来统一处理响应数据的提取。

### 目录结构调整

```text
src/http/
├── pipeline/                          # 错误解析和数据提取管道
│   ├── ErrorParser.ts                 # 错误解析器接口
│   ├── DataExtractor.ts               # 数据提取器接口
│   ├── ErrorParserFactory.ts          # 错误解析器工厂
│   ├── DataExtractorFactory.ts        # 数据提取器工厂
│   ├── ErrorParserPipeline.ts         # 错误解析管道
│   ├── DataExtractorPipeline.ts       # 数据提取管道
│   ├── JsonErrorParser.ts             # JSON 错误解析器
│   ├── CustomBackendErrorParser.ts    # 自定义后端错误解析器
│   ├── JsonDataExtractor.ts           # JSON 数据提取器
│   └── CustomDataExtractor.ts         # 自定义数据提取器
└── core/                              # 核心功能
    ├── HttpClient.ts                  # 核心 HTTP 请求客户端
    ├── HttpRequest.ts                 # 请求参数封装
    ├── HttpResponse.ts                # 响应数据封装
    ├── HttpError.ts                   # 错误处理类
    └── types.ts                       # 全局类型定义
```

### 1. **`DataExtractor` 接口**

`DataExtractor` 是一个通用接口，定义了从 `HttpResponse` 中提取数据的方法。每个具体的提取器都需要实现这个接口。

#### **`src/http/pipeline/DataExtractor.ts`**

```typescript
import { HttpResponse } from '../core/types';

export interface DataExtractor {
  extractData(response: HttpResponse): any;  // 提取数据的方法
}
```

### 2. **`DataExtractorFactory`**

`DataExtractorFactory` 管理数据提取器的注册和执行，它会根据管道顺序执行所有注册的提取器。

#### **`src/http/pipeline/DataExtractorFactory.ts`**

```typescript
import { DataExtractor } from './DataExtractor';
import { HttpResponse } from '../core/types';
import { DataExtractorPipeline } from './DataExtractorPipeline';

export class DataExtractorFactory {
  private static pipeline = new DataExtractorPipeline();

  // 注册自定义数据提取器
  static registerExtractor(extractor: DataExtractor): void {
    this.pipeline.addExtractor(extractor);
  }

  // 提取数据，统一处理
  static extractData(response: HttpResponse): any {
    return this.pipeline.extractData(response);  // 通过管道执行提取器
  }
}
```

### 3. **`DataExtractorPipeline`**

`DataExtractorPipeline` 管道负责按顺序执行所有注册的 `DataExtractor`，并最终提取出数据。如果有多个提取器，它们会依次执行直到某个提取器成功提取数据。

#### **`src/http/pipeline/DataExtractorPipeline.ts`**

```typescript
import { DataExtractor } from './DataExtractor';
import { HttpResponse } from '../core/types';

export class DataExtractorPipeline {
  private extractors: DataExtractor[] = [];

  // 向管道中添加数据提取器
  addExtractor(extractor: DataExtractor): void {
    this.extractors.push(extractor);
  }

  // 按顺序执行数据提取器
  public extractData(response: HttpResponse): any {
    for (const extractor of this.extractors) {
      const data = extractor.extractData(response);
      if (data !== null) {
        return data;  // 如果某个提取器提取到了数据，立即返回
      }
    }
    return null;  // 如果所有提取器都未能提取数据，返回 null
  }
}
```

### 4. **具体的数据提取器实现**

我们需要为不同的后端响应格式实现具体的数据提取器。例如，JSON 格式的数据提取器可以从响应中提取 `data` 字段，而某些自定义的后端可能需要特定的提取逻辑。

#### **`src/http/pipeline/JsonDataExtractor.ts`**

```typescript
import { DataExtractor } from './DataExtractor';
import { HttpResponse } from '../core/types';

export class JsonDataExtractor implements DataExtractor {
  extractData(response: HttpResponse): any {
    if (response.isJsonResponse()) {
      const body = response.getBody();
      // 假设成功的数据字段是 `data`
      if (body && body.data) {
        return body.data;  // 提取 data 字段
      }
    }
    return null;  // 如果没有数据，返回 null
  }
}
```

#### **`src/http/pipeline/CustomDataExtractor.ts`**

```typescript
import { DataExtractor } from './DataExtractor';
import { HttpResponse } from '../core/types';

export class CustomDataExtractor implements DataExtractor {
  extractData(response: HttpResponse): any {
    const body = response.getBody();
    // 假设自定义后端返回的数据结构是不同的
    if (body && body.result) {
      return body.result;  // 提取自定义的 result 字段
    }
    return null;  // 如果没有数据，返回 null
  }
}
```

### 5. **`HttpClient` 更新**

`HttpClient` 现在将通过 `DataExtractorFactory` 提取数据，而不直接返回原始响应数据。它会先调用 `ErrorParserFactory` 来处理错误，再通过 `DataExtractorFactory` 提取有效数据。

#### **`src/http/core/HttpClient.ts`**

```typescript
import { HttpRequest, HttpResponse } from './types';
import { ErrorParserFactory } from '../pipeline/ErrorParserFactory';
import { DataExtractorFactory } from '../pipeline/DataExtractorFactory';
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

    // 错误处理
    const error = ErrorParserFactory.parseError(response);
    if (error instanceof Error) {
      throw error;  // 如果是错误，抛出
    }

    // 提取有效数据
    const data = DataExtractorFactory.extractData(response);
    return data;  // 返回提取后的数据
  }

  private applyMiddleware(request: HttpRequest): HttpRequest {
    // 这里可以依次执行中间件
    return request;
  }
}
```

### 6. **`HttpError` 和 `HttpResponse` 更新**

为了与新的提取机制兼容，`HttpResponse` 需要提供一个标准化的 `getBody` 方法，确保它能够从响应中提取出数据，且 `HttpError` 依然是统一的错误处理类。

#### **`src/http/core/types.ts`**

```typescript
export interface HttpResponse {
  statusCode: number;
  headers: HttpHeaders;
  body: any;  // 响应体
  getBody(): any;  // 获取响应体的标准方法
  isJsonResponse(): boolean;  // 判断响应是否为 JSON 格式
  isCustomBackendError(): boolean;  // 判断是否为自定义的后端错误
}
```

### 总结

1. **`DataExtractor`** 接口定义了数据提取的标准方法，每个具体的数据提取器实现都根据后端的不同数据结构来提取数据。
2. **`DataExtractorFactory`** 管理数据提取器的注册与执行，统一提取数据的流程。
3. **`HttpClient`** 不再直接处理数据提取，而是通过 `DataExtractorFactory` 提取有效数据，
