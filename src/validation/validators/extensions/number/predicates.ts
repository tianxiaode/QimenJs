import { NumberExtensionRule } from '../../../rules';

// 定义谓词函数类型，接受一个数字参数并返回布尔值
type Predicate = (value: number) => boolean;

// 数字验证谓词映射对象，将 NumberAdvanceRule 中的规则映射为具体的验证函数
export const numberPredicates: Record<keyof NumberExtensionRule, Predicate> = {
    // 验证数字是否为正数 (> 0)
    positive: (v: any) => v > 0,
    
    // 验证数字是否为负数 (< 0)
    negative: (v: any) => v < 0,
    
    // 验证数字是否为奇数（必须是整数且除以2的绝对值余数为1）
    odd: (v: any) => Number.isInteger(v) && Math.abs(v % 2) === 1,
    
    // 验证数字是否为偶数（必须是整数且能被2整除）
    even: (v: any) => Number.isInteger(v) && v % 2 === 0,
    
    // 验证数字是否为有限数
    finite: (v: any) => Number.isFinite(v),
    
    // 验证数字是否为无限数
    infinite: (v: any) => !Number.isFinite(v),
};