// src/utils/validation/adapters/rule-adapter.ts
import { allRules } from '../composition';
import { ValidationResult } from '../core';
import { getRuleFunctions } from '../rules';

// 定义转换器接口，便于扩展
interface RuleConverter {
  canHandle(externalRule: any): boolean;
  convert(externalRule: any): Array<(value: any) => ValidationResult>;
}

// 默认转换器
class DefaultRuleConverter {
  canHandle(externalRule: any): boolean {
    return typeof externalRule === 'object' && externalRule !== null;
  }

  convert(externalRule: any): Array<(value: any) => ValidationResult> {
    // 直接使用已有的映射工厂函数
    return getRuleFunctions(externalRule);
  }
}

// 转换器管理器
class RuleAdapterManager {
  private converters: RuleConverter[] = [];
  private customKeywordMap: Record<string, Function> = {};
  
  constructor() {
    this.converters.push(new DefaultRuleConverter());
  }
  
  registerConverter(converter: RuleConverter) {
    this.converters.unshift(converter);
  }
  
  // 注册自定义关键词
  registerKeyword(keyword: string, validatorFactory: Function) {
    this.customKeywordMap[keyword] = validatorFactory;
    
    // 如果还没有自定义转换器，则创建一个
    if (!this.converters.some(c => c instanceof CustomRuleConverter)) {
      this.converters.unshift(new CustomRuleConverter(this.customKeywordMap));
    }
  }
  
  convert(externalRule: any) {
    for (const converter of this.converters) {
      if (converter.canHandle(externalRule)) {
        const validators = converter.convert(externalRule);
        return allRules(...validators);
      }
    }
    
    return () => ({ isValid: true, errors: [] });
  }
}

// 自定义规则转换器
class CustomRuleConverter {
  private customKeywordMap: Record<string, Function>;
  
  constructor(customKeywordMap: Record<string, Function>) {
    this.customKeywordMap = customKeywordMap;
  }
  
  canHandle(externalRule: any): boolean {
    return typeof externalRule === 'object' && externalRule !== null;
  }

  convert(externalRule: any): Array<(value: any) => ValidationResult> {
    const validators: Array<(value: any) => ValidationResult> = [];
    
    // 先使用标准规则
    const standardValidators = getRuleFunctions(externalRule);
    validators.push(...standardValidators);
    
    // 再处理自定义规则
    for (const [keyword, ruleValue] of Object.entries(externalRule)) {
      if (keyword in this.customKeywordMap) {
        const validatorFactory = this.customKeywordMap[keyword];
        if (typeof validatorFactory === 'function') {
          try {
            const validator = ruleValue !== undefined ? validatorFactory(ruleValue) : validatorFactory();
            if (typeof validator === 'function') {
              validators.push(validator);
            }
          } catch (error) {
            console.warn(`Failed to create custom validator for keyword: ${keyword}`, error);
          }
        }
      }
    }
    
    return validators;
  }
}

// 创建全局实例
const adapterManager = new RuleAdapterManager();

// 导出公共方法
export function convertExternalRules(externalRule: any) {
  return adapterManager.convert(externalRule);
}

// 导出自定义关键词注册方法
export function registerCustomKeyword(keyword: string, validatorFactory: Function) {
  adapterManager.registerKeyword(keyword, validatorFactory);
}

export function registerRuleConverter(converter: RuleConverter) {
  adapterManager.registerConverter(converter);
}

// 快捷转换函数
export function createValidator(externalRules: any) {
  return convertExternalRules(externalRules);
}