export interface ClickOptions {
    preventDefault?: boolean;   // 是否阻止默认行为
    stopPropagation?: boolean;  // 是否停止事件冒泡
    capture?: boolean;          // 是否使用捕获阶段
    once?: boolean;             // 是否只执行一次
}

export interface ClickOutsideOptions {
    exclude?: string[];  // 排除的选择器列表
    capture?: boolean;
}