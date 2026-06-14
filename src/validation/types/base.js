"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTypes = exports.allValidateTypes = void 0;
/** * 预定义的全类型数组
 * 专门给 required, default, nullable 等"通吃型"处理器使用
 */
exports.allValidateTypes = [
    'string',
    'number',
    'boolean',
    'date',
    'array',
    'object',
    'password',
    'compare',
    'file',
    'split',
    'format'
];
exports.formatTypes = ['email', 'url', 'phone', 'uuid', 'ipv4', 'ipv6', 'macAddress', 'hexColor', 'rgbColor', 'rgbaColor'];
//# sourceMappingURL=base.js.map