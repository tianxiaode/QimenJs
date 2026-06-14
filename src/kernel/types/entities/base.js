"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionCategory = void 0;
/**
 * 处理器类别：定义处理器的核心职责
 */
var ActionCategory;
(function (ActionCategory) {
    /** 01-PREPARE: 请求构建阶段 (参数对齐、URL拼接、Header注入) */
    ActionCategory[ActionCategory["PREPARE"] = 4000] = "PREPARE";
    /** 02-EXCHANGE: 物理交换阶段 (Fetch/XHR 发送、Failure Guard) */
    ActionCategory[ActionCategory["EXCHANGE"] = 3000] = "EXCHANGE";
    /** 03-PROCESS: 内容识别阶段 (状态码分析、数据反序列化/Parse) */
    ActionCategory[ActionCategory["PROCESS"] = 2000] = "PROCESS";
    /** 04-ALIGN: 业务对齐阶段 (数据提取、错误拦截、全局结算) */
    ActionCategory[ActionCategory["ALIGN"] = 1000] = "ALIGN";
})(ActionCategory || (exports.ActionCategory = ActionCategory = {}));
//# sourceMappingURL=base.js.map