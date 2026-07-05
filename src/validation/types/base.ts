// 从ValidationRule联合类型中提取所有可能的type值作为ValidationTag
export type ValidationTag =
    | 'string'
    | 'number'
    | 'boolean'
    | 'date'
    | 'array'
    | 'object'
    | 'password'
    | 'compare'
    | 'file'
    | 'split'
    | 'format';

/** * 预定义的全类型数组
 * 专门给 required, default, nullable 等"通吃型"处理器使用
 */
export const allValidateTypes: ValidationTag[] = [
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
    'format',
] as const;

export const formatTypes = [
    'email',
    'url',
    'phone',
    'uuid',
    'ipv4',
    'ipv6',
    'macAddress',
    'hexColor',
    'rgbColor',
    'rgbaColor',
] as const;
