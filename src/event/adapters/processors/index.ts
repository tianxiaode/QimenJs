/**
 * @file index.ts
 * @description
 * 手势处理器模块的聚合导出文件。
 * 
 * 该文件统一导出手势处理器模块中的所有公共API，
 * 方便其他模块通过单一入口导入所需的手势处理器相关功能。
 */

// 导出工厂函数
export * from './factory';

// 导出类型定义
export * from './types';

// 导出手势处理器基类
export * from './GestureProcessor';

// 导出具体的手势处理器类
export * from './ContextMenuProcessor';
export * from './DoubleTapProcessor';
export * from './DragProcessor';
export * from './HoverProcessor';
export * from './LongPressProcessor';
export * from './SubmitProcessor';
export * from './SwipeProcessor';
export * from './TapProcessor';