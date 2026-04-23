/**
 * @file index.ts
 * @description 
 * 该文件是kernel actions模块的入口文件，导出所有四个阶段的处理器。
 * 四个阶段分别是：
 * 1. Prepare (准备阶段) - 准备请求参数和URL
 * 2. Exchange (交换阶段) - 执行网络请求和响应
 * 3. Process (处理阶段) - 解析和分析响应数据
 * 4. Align (对齐阶段) - 最终处理和清理
 */

export * from './01-prepare';
export * from './02-exchange';
export * from './03-process';
export * from './04-align';