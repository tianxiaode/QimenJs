"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordProcessorEntry = void 0;
const types_1 = require("@/validation/types");
const password_1 = require("./password");
exports.PasswordProcessorEntry = {
    name: "password",
    tags: ["password"],
    weight: types_1.ValidationWeight.SEMANTIC,
    offset: 70,
    processor: password_1.PasswordProcessor
};
//# sourceMappingURL=entries.js.map