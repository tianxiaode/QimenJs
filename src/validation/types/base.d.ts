export type ValidationTag = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'password' | 'compare' | 'file' | 'split' | 'format';
/** * 预定义的全类型数组
 * 专门给 required, default, nullable 等"通吃型"处理器使用
 */
export declare const allValidateTypes: ValidationTag[];
export declare const formatTypes: readonly ["email", "url", "phone", "uuid", "ipv4", "ipv6", "macAddress", "hexColor", "rgbColor", "rgbaColor"];
//# sourceMappingURL=base.d.ts.map