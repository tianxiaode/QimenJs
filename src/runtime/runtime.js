"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuntimeEnv = getRuntimeEnv;
const locale_1 = require("./locale");
const timezone_1 = require("./timezone");
const platform_1 = require("./platform");
/**
 * 获取当前运行时环境的综合信息
 *
 * 返回一个包含语言环境、时区和平台信息的对象
 *
 * @returns {Object} 包含以下属性的运行时环境信息对象:
 *   - locale: 语言环境字符串
 *   - timezone: 时区标识符
 *   - platform: 平台类型 ("browser", "node", "unknown")
 */
function getRuntimeEnv() {
    return {
        locale: (0, locale_1.getLocale)(),
        timezone: (0, timezone_1.getTimezone)(),
        platform: (0, platform_1.getPlatform)(),
    };
}
//# sourceMappingURL=runtime.js.map