/**
 * @file ResponseAnalyzer.ts
 * @description
 * 该文件实现了响应分析处理器，负责分析HTTP响应的状态和头部信息。
 * 它会识别响应类型（JSON、Blob、文本）、判断是否为下载内容、解析文件名等，
 * 并设置相应的元数据标志供后续处理步骤使用。
 */
import type { RequestContext } from '@orbitjs/context';
export declare const ResponseAnalyzerHandler: (context: RequestContext) => Promise<void>;
//# sourceMappingURL=ResponseAnalyzer.d.ts.map