/**
 * 检测当前运行时环境支持的功能
 *
 * @property {boolean} fetch - 当前环境是否支持 fetch API
 * @property {boolean} localStorage - 当前环境是否支持 localStorage
 * @property {boolean} intersectionObserver - 当前环境是否支持 IntersectionObserver API
 */
export const runtimeFeatures = {
    fetch: typeof fetch === 'function',
    localStorage: typeof localStorage !== 'undefined',
    intersectionObserver: typeof IntersectionObserver !== 'undefined',
};
