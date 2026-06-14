"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapValidators = void 0;
//导出核心函数和错误
__exportStar(require("./core"), exports);
//导出全部验证规则
__exportStar(require("./types"), exports);
const AllEntries = __importStar(require("./processors"));
const core_1 = require("./core");
const registry_1 = require("@orbitjs/registry");
const bootstrapValidators = () => {
    // AllEntries 现在是一个对象，Key 是变量名，Value 是 Entry 对象
    Object.values(AllEntries).forEach((entry) => {
        // 简单的健壮性检查：确保它是一个有效的 Entry 对象
        if (entry && entry.name && entry.execute) {
            core_1.ValidatorRegistrar.getInstance().register(entry);
        }
    });
};
exports.bootstrapValidators = bootstrapValidators;
__exportStar(require("./errors"), exports);
__exportStar(require("./engine"), exports);
registry_1.RegistryHub.use(core_1.ValidatorRegistrar.getInstance());
//# sourceMappingURL=index.js.map