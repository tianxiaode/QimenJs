"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presenceProcessorEntry = exports.refreshContextStatusProcessorEntry = exports.trimProcessorEntry = exports.transformProcessorEntry = exports.ruleAlignmentProcessorEntry = void 0;
const context_1 = require("./context");
const rule_align_1 = require("./rule-align");
const transform_1 = require("./transform");
const trim_1 = require("./trim");
const presence_1 = require("./presence");
const types_1 = require("../../types");
exports.ruleAlignmentProcessorEntry = {
    name: 'common-rule-align',
    tags: types_1.allValidateTypes,
    weight: types_1.ValidationWeight.PREPARATION,
    offset: 0,
    execute: rule_align_1.RuleAlignmentProcessor,
};
exports.transformProcessorEntry = {
    name: 'common-transform',
    tags: types_1.allValidateTypes,
    weight: types_1.ValidationWeight.PREPARATION,
    offset: 10,
    execute: transform_1.TransformProcessor,
};
exports.trimProcessorEntry = {
    name: 'Trim',
    tags: types_1.allValidateTypes,
    weight: types_1.ValidationWeight.PREPARATION,
    offset: 20,
    execute: trim_1.TrimProcessor,
};
exports.refreshContextStatusProcessorEntry = {
    name: 'common-refrence-context-status',
    tags: types_1.allValidateTypes,
    weight: types_1.ValidationWeight.PREPARATION,
    offset: 30,
    execute: context_1.RefreshContextStatusProcessor,
};
exports.presenceProcessorEntry = {
    name: 'common-presence',
    tags: types_1.allValidateTypes,
    weight: types_1.ValidationWeight.PRESENCE,
    offset: 100,
    execute: presence_1.PresenceProcessor,
};
//# sourceMappingURL=entries.js.map