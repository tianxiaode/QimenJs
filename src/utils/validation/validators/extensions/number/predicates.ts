import { NumberAdvanceRule, NumberRule } from '@/utils/validation/rules';

type Predicate = (value: number) => boolean;

export const numberPredicates: Record<
  keyof Omit<NumberAdvanceRule, keyof NumberRule | 'allowsValues' | 'disallowsValues'>,
  Predicate
> = {
  int: (v) => Number.isInteger(v),
  positive: (v) => v > 0,
  negative: (v) => v < 0,
  odd: (v) => Number.isInteger(v) && Math.abs(v % 2) === 1,
  even: (v) => Number.isInteger(v) && v % 2 === 0,
  finite: (v) => Number.isFinite(v),
  infinite: (v) => !Number.isFinite(v),
};
