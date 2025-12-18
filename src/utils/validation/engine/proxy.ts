// core/proxy.ts
import { Validator } from './validator';
import { Assert } from './assert';

const createValidatorProxy = (validator: Validator) => {
  return new Proxy(validator, {
    get(target, prop: string) {
      if (prop in target) {
        return target[prop];
      }
      // 当我们访问 `.string`, `.email` 等时，代理会自动调用 `validate` 方法
      return (value: any, rule: any) => target.validate(prop, value, rule);
    }
  });
};

const createAssertProxy = (assert: Assert) => {
  return new Proxy(assert, {
    get(target, prop: string) {
      if (prop in target) {
        return target[prop];
      }
      // 当我们访问 `.string`, `.email` 等时，代理会自动调用 `assert` 方法
      return (value: any, rule: any) => target.assert(prop, value, rule);
    }
  });
};

// 创建 validator 和 assert 实例
const validatorInstance = new Validator();
const assertInstance = new Assert();

// 创建代理对象
const validator = createValidatorProxy(validatorInstance);
const assert = createAssertProxy(assertInstance);

export { validator, assert };
