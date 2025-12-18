import { createPatternValidator } from './regex';
import {
    ValidationErrorCode,
    ValidationResult,
    IPV4_PATTERN,
    IPV6_PATTERN,
    MAC_ADDRESS_PATTERN,
} from '../../core';

// 对于IPv4这样需要额外验证的，传入额外验证函数
export const isIPv4 = createPatternValidator(
    IPV4_PATTERN,
    ValidationErrorCode.INVALID_FORMAT,
    (value: string) => {
        const parts = value.split('.');
        for (const part of parts) {
            const num = parseInt(part, 10);
            if (num < 0 || num > 255) {
                return false;
            }
        }
        return true;
    }
);

// IPv6保持简单形式
export const isIPv6 = createPatternValidator(IPV6_PATTERN, ValidationErrorCode.INVALID_FORMAT);

export const isMACAddress = createPatternValidator(
    MAC_ADDRESS_PATTERN,
    ValidationErrorCode.INVALID_FORMAT
);
