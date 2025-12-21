import { CompareRuleOptions } from "../common";

export interface EqualRule extends Omit<CompareRuleOptions, 'type'> {
    type: 'eq';
    operator: 'eq';
    strict: true;
}

export interface NotEqualRule extends Omit<CompareRuleOptions, 'type'> {
    type: 'neq';
    operator: 'neq';
    strict: true;
}

export interface GreaterThanRule extends Omit<CompareRuleOptions, 'type'> {
    type: 'gt';
    operator: 'gt';
    strict: false;
}

export interface GreaterThanOrEqualRule extends Omit<CompareRuleOptions, 'type'> {
    type: 'gte';
    operator: 'gte';
    strict: false;
}

export interface LessThanRule extends Omit<CompareRuleOptions, 'type'> {
    type: 'lt';
    operator: 'lt';
    strict: false;
}

export interface LessThanOrEqualRule extends Omit<CompareRuleOptions, 'type'> {
    type: 'lte';
    operator: 'lte';
    strict: false;
}

