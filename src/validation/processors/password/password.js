"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordProcessor = void 0;
const utils_1 = require("../../utils");
const types_1 = require("../../types");
const registry_1 = require("@orbitjs/registry");
const PasswordProcessor = async (context) => {
    const { value, rule } = context;
    //不要做任何防御，要相信上一处理器
    const patterns = [
        types_1.ValidationPatternType.UPPERCASE,
        types_1.ValidationPatternType.LOWERCASE,
        types_1.ValidationPatternType.DIGIT,
        types_1.ValidationPatternType.SPECIAL_CHAR,
    ];
    for (const name of patterns) {
        if (rule[name] === true) {
            const regex = registry_1.Registry.pattern.get(name);
            (0, utils_1.validatePattern)(value, regex, context, name);
        }
    }
};
exports.PasswordProcessor = PasswordProcessor;
//# sourceMappingURL=password.js.map