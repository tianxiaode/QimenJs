// src/utils/validation/adapters/rule-adapter.ts
import { allRules } from '../composition';
import { ValidationResult } from '../base';
import { PREDEFINED_KEYWORD_MAP, KEYWORD_ALIASES } from './predefined-maps';

// 定义转换器接口，便于扩展
interface RuleConverter {
  canHandle(externalRule: any): boolean;
  convert(externalRule: any): Array<(value: any) => ValidationResult>;
}

// 默认转换器
class DefaultRuleConverter {
  private keywordMap: Record<string, Function>;
  
  constructor(keywordMap: Record<string, Function>) {
    this.keywordMap = keywordMap;
  }
  
  canHandle(externalRule: any): boolean {
    return typeof externalRule === 'object' && externalRule !== null;
  }

  convert(externalRule: any): Array<(value: any) => ValidationResult> {
    const validators: Array<(value: any) => ValidationResult> = [];
    
    // 遍历规则对象的所有属性
    for (const [keyword, ruleValue] of Object.entries(externalRule)) {
      // 处理关键词别名
      const actualKeyword = KEYWORD_ALIASES[keyword as keyof typeof KEYWORD_ALIASES] || keyword;
      
      // 检查是否存在对应的验证函数
      if (actualKeyword in this.keywordMap) {
        const validatorFactory = this.keywordMap[actualKeyword];
        if (typeof validatorFactory === 'function') {
          try {
            // 根据参数创建具体的验证函数
            const validator = validatorFactory(ruleValue);
            if (typeof validator === 'function') {
              validators.push(validator);
            }
          } catch (error) {
            console.warn(`Failed to create validator for keyword: ${actualKeyword}`, error);
          }
        }
      }
      // 忽略未映射的关键词
    }
    
    return validators;
  }
}

// 转换器管理器
class RuleAdapterManager {
  private converters: any[] = [];
  private customKeywordMap: Record<string, Function> = {};
  
  constructor() {
    // 初始化时创建默认转换器，传入预定义关键词映射
    const initialKeywordMap = { ...PREDEFINED_KEYWORD_MAP };
    this.converters.push(new DefaultRuleConverter(initialKeywordMap));
  }
  
  registerConverter(converter: RuleConverter) {
    this.converters.unshift(converter);
  }
  
  // 注册自定义关键词
  registerKeyword(keyword: string, validatorFactory: Function) {
    this.customKeywordMap[keyword] = validatorFactory;
  }
  
  convert(externalRule: any) {
    // 合并预定义关键词和自定义关键词
    const extendedKeywordMap = {
      ...PREDEFINED_KEYWORD_MAP,
      ...this.customKeywordMap
    };
    
    // 更新默认转换器的关键词映射
    const defaultConverter = this.converters[0];
    if (defaultConverter instanceof DefaultRuleConverter) {
      // 重新创建转换器以使用扩展的关键词映射
      this.converters[0] = new DefaultRuleConverter(extendedKeywordMap);
    }
    
    for (const converter of this.converters) {
      if (converter.canHandle(externalRule)) {
        const validators = converter.convert(externalRule);
        return allRules(...validators);
      }
    }
    
    return () => ({ isValid: true, errors: [] });
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