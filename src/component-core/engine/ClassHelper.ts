// utils/ClassHelper.ts

/**
 * ClassHelper — 类名工具静态类
 *
 * 统一处理类名的增删改查
 */
export class ClassHelper {
    /**
     * 获取类名数组
     */
    static getList(el: HTMLElement): string[] {
        return Array.from(el.classList);
    }

    /**
     * 获取类名字符串
     */
    static getString(el: HTMLElement): string {
        return el.className;
    }

    /**
     * 添加类名
     */
    static add(el: HTMLElement, ...classes: string[]): void {
        el.classList.add(...classes);
    }

    /**
     * 移除类名
     */
    static remove(el: HTMLElement, ...classes: string[]): void {
        el.classList.remove(...classes);
    }

    /**
     * 切换类名
     */
    static toggle(el: HTMLElement, cls: string, force?: boolean): boolean {
        return el.classList.toggle(cls, force);
    }

    /**
     * 检查类名是否存在
     */
    static contains(el: HTMLElement, cls: string): boolean {
        return el.classList.contains(cls);
    }

    /**
     * 替换类名
     */
    static replace(el: HTMLElement, oldCls: string, newCls: string): void {
        el.classList.replace(oldCls, newCls);
    }

    /**
     * 设置类名（替换全部）
     */
    static set(el: HTMLElement, classes: string | string[]): void {
        if (Array.isArray(classes)) {
            el.className = classes.join(' ');
        } else {
            el.className = classes;
        }
    }

    /**
     * 清空类名
     */
    static clear(el: HTMLElement): void {
        el.className = '';
    }
}
