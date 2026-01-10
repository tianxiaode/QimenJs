import { ValidationWeight } from '../../types';
import { NumberTypeProcessor } from './type';
import { NumberRangeProcessor } from './range';
import { NumberIsProcessor } from './is';
import { NumberIncludesProcessor } from './includes';
import { NumberExcludesProcessor } from './excludes';

// 注册数字类型验证处理器
export const NumberTypeEntry = {
  name: 'number-type',
  tags: ['number'],
  weight: ValidationWeight.IDENTITY,
  offset: 10,
  execute: NumberTypeProcessor,
};

// 注册数字范围验证处理器
export const NumberRangeEntry = {
  name: 'numner-range',
  tags: ['number'],
  weight: ValidationWeight.QUANTITY,
  offset: 50,
  execute: NumberRangeProcessor,
};

// 注册数字语义验证处理器
export const NumberIsEntry = {
  name: 'number.is',
  tags: ['number'],
  weight: ValidationWeight.SEMANTIC,
  offset: 100,
  execute: NumberIsProcessor,
};

// 注册数字包含验证处理器
export const NumberIncludesEntry = {
  name: 'number-includes',
  tags: ['number'],
  weight: ValidationWeight.SEMANTIC,
  offset: 110,
  execute: NumberIncludesProcessor,
};

// 注册数字排除验证处理器
export const NumberExcludesEntry = {
  name: 'number-excludes',
  tags: ['number'],
  weight: ValidationWeight.SEMANTIC,
  offset: 115,
  execute: NumberExcludesProcessor,
};

