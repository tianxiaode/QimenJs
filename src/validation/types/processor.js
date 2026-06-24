"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationWeight = void 0;
/**
 * 验证阶段基准权重
 * 数值越小，执行越早
 */
var ValidationWeight;
(function (ValidationWeight) {
    /** 准备阶段：填充默认值、初步物理转换 (default, transform, trim) */
    ValidationWeight[ValidationWeight["PREPARATION"] = 0] = "PREPARATION";
    /** 存在性检查：拦截必填或放行空值 (required, nullable) */
    ValidationWeight[ValidationWeight["PRESENCE"] = 1000] = "PRESENCE";
    /** 身份确认：物理类型校验 (typeof value)。
     * 这是所有业务逻辑的基石，不通过则必须 Terminate。 */
    ValidationWeight[ValidationWeight["IDENTITY"] = 1500] = "IDENTITY";
    /** 类型与格式：基础身份校验 (type, format, pattern) */
    ValidationWeight[ValidationWeight["SEMANTIC"] = 2000] = "SEMANTIC";
    /** 物理约束：数值大小、长度、正则 (min, max, exact) */
    ValidationWeight[ValidationWeight["QUANTITY"] = 3000] = "QUANTITY";
    /** 逻辑关联：枚举、跨字段比对 (enum, operator, target) */
    ValidationWeight[ValidationWeight["RELATION"] = 4000] = "RELATION";
    /** 结构递归：对象属性、数组项 (properties, children) */
    ValidationWeight[ValidationWeight["STRUCTURAL"] = 5000] = "STRUCTURAL";
})(ValidationWeight || (exports.ValidationWeight = ValidationWeight = {}));
//# sourceMappingURL=processor.js.map