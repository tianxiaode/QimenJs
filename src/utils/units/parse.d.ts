import { LengthUnit } from './types';
export interface LengthValue {
    value: number;
    unit: LengthUnit;
}
/**
 * 解析长度字符串，提取数值和单位
 * @param input 长度字符串，如 "16px", "2rem"
 * @returns 解析后的长度值对象，如果解析失败则返回null
 */
export declare function parseLength(input: string): LengthValue | null;
//# sourceMappingURL=parse.d.ts.map