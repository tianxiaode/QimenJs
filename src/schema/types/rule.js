"use strict";
/**
 * 验证规则类型定义
 *
 * 这些类型定义了数据约束，是 Schema 的一部分
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationPatternType = void 0;
/**
 * 验证模式类型枚举
 * 定义了所有可用的验证模式类型常量
 */
var ValidationPatternType;
(function (ValidationPatternType) {
    ValidationPatternType["EMAIL"] = "email";
    ValidationPatternType["URL"] = "url";
    ValidationPatternType["IPV4"] = "ipv4";
    ValidationPatternType["IPV6"] = "ipv6";
    ValidationPatternType["MAC_ADDRESS"] = "mac";
    ValidationPatternType["PHONE"] = "phone";
    ValidationPatternType["UUID"] = "uuid";
    ValidationPatternType["BASE64"] = "base64";
    ValidationPatternType["HEX_COLOR"] = "hexColor";
    ValidationPatternType["RGB_COLOR"] = "rgbColor";
    ValidationPatternType["RGBA_COLOR"] = "rgbaColor";
    ValidationPatternType["CREDIT_CARD"] = "creditCard";
    ValidationPatternType["CHINESE_ID"] = "chineseId";
    ValidationPatternType["CHINESE_POSTCODE"] = "chinesePostcode";
    ValidationPatternType["USERNAME"] = "username";
    ValidationPatternType["UPPERCASE"] = "uppercase";
    ValidationPatternType["LOWERCASE"] = "lowercase";
    ValidationPatternType["DIGIT"] = "digit";
    ValidationPatternType["SPECIAL_CHAR"] = "specialChar";
})(ValidationPatternType || (exports.ValidationPatternType = ValidationPatternType = {}));
//# sourceMappingURL=rule.js.map