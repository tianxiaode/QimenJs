import { CompareRule } from "../common";

export interface EqualRule extends Omit<CompareRule, 'type'> {
    type: 'eq';
    operator: 'eq';
    strict: true;
}

export interface NotEqualRule extends Omit<CompareRule, 'type'> {
    type: 'neq';
    operator: 'neq';
    strict: true;
}

export interface GreaterThanRule extends Omit<CompareRule, 'type'> {
    type: 'gt';
    operator: 'gt';
    strict: false;
}

export interface GreaterThanOrEqualRule extends Omit<CompareRule, 'type'> {
    type: 'gte';
    operator: 'gte';
    strict: false;
}

export interface LessThanRule extends Omit<CompareRule, 'type'> {
    type: 'lt';
    operator: 'lt';
    strict: false;
}

export interface LessThanOrEqualRule extends Omit<CompareRule, 'type'> {
    type: 'lte';
    operator: 'lte';
    strict: false;
}

