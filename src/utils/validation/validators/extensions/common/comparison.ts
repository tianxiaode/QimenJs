import { validateCompare } from "../../common";

export const validateEq = (a: any, b: any, strict = true) =>
    validateCompare(a, b, { operator: 'eq', strict });

export const validateGt = (a: any, b: any) => validateCompare(a, b, { operator: 'gt' });

export const validateGte = (a: any, b: any) => validateCompare(a, b, { operator: 'gte' });

export const validateLt = (a: any, b: any) => validateCompare(a, b, { operator: 'lt' });

export const validateLte = (a: any, b: any) => validateCompare(a, b, { operator: 'lte' });

export const validateNeq = (a: any, b: any) => validateCompare(a, b, { operator: 'neq' });
