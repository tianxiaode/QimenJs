import { getLocale } from "./locale";
import { getTimezone } from "./timezone";
import { getPlatform } from "./platform";

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
export function getRuntimeEnv() {
    return {
        locale: getLocale(),
        timezone: getTimezone(),
        platform: getPlatform(),
    };
}