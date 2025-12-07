// 常用验证组合
export const ValidationUtils = {
  // 类型检查
  isArray: (v: any) => Array.isArray(v),
  isObject: (v: any) => v !== null && typeof v === 'object' && !Array.isArray(v),
  isFunction: (v: any) => typeof v === 'function',
  isString: (v: any) => typeof v === 'string',
  isNumber: (v: any) => typeof v === 'number' && !isNaN(v),
  isBoolean: (v: any) => typeof v === 'boolean',
  isDate: (v: any) => v instanceof Date && !isNaN(v.getTime()),
  isNil: (v: any) => v === null || v === undefined,
  
  // 验证器
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  },
  
  validateURL: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  validateJSON: (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
};