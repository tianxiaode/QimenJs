import { ValidationWeight } from '../../types';
import { FileProcessor } from './file';

/** 文件验证处理器注册条目 */
export const FileProcessorEntry = {
    name: 'file',
    tags: ['file'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: FileProcessor,
};
