import { LengthUnit } from './types';

export interface LengthValue {
    value: number;
    unit: LengthUnit;
}

const LENGTH_RE = /^(-?\d+(?:\.\d+)?)(px|em|rem|%|vw|vh)$/;

export function parseLength(input: string): LengthValue | null {
    const match = input.trim().match(LENGTH_RE);
    if (!match) return null;

    return {
        value: parseFloat(match[1]),
        unit: match[2] as LengthUnit,
    };
}
