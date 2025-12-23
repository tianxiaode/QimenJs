import { validateRequiredArray } from './src/utils/validation/validators/extensions/array/validateRequiredArray';

console.log('Testing empty array:');
const result = validateRequiredArray([], { itemRule: () => null });
console.log('Result:', JSON.stringify(result, null, 2));

console.log('\nTesting array with wrong item type:');
const itemRule = (value: any) => {
  if (typeof value !== 'number') {
    return [{
      code: 'INVALID_TYPE',
      params: { expected: 'number', actual: typeof value },
      context: undefined
    }];
  }
  return null;
};
const result2 = validateRequiredArray([1, 'string', 3], { 
  itemRule
});
console.log('Result2:', JSON.stringify(result2, null, 2));