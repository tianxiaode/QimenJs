export function getLocaleFromNavigator(): string {
    return navigator?.language || 'zh-CN';
}
