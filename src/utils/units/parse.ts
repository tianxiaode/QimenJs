import { LengthUnit } from './types';

/** 解析后的长度值，包含数值和单位 */
export interface LengthValue {
    value: number;
    unit: LengthUnit;
}

const LENGTH_RE = /^(-?\d+(?:\.\d+)?)(px|em|rem|%|vw|vh)$/;

/**
 * 解析长度字符串，提取数值和单位
 * @param input 长度字符串，如 "16px", "2rem"
 * @returns 解析后的长度值对象，如果解析失败则返回null
 */
export function parseLength(input: string): LengthValue | null {
    const match = input.trim().match(LENGTH_RE);
    if (!match) return null;

    return {
        value: parseFloat(match[1]),
        unit: match[2] as LengthUnit,
    };
}
