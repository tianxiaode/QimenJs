import type { DragOptions } from './component';
import type { DropOptions } from './options';

/** 拖拽实例内部结构（单源：一个组件一个拖动源） */
export interface DragInstance {
    el: HTMLElement;
    component: any;
    config: DragOptions;
    /** 拖拽影子组件实例（配置了 ghost 时，dragStart 创建 / dragEnd 销毁） */
    ghostComponent?: any;
}

/** 放置区实例内部结构（纯登记，事件由调度中心 hit-testing 合成，零 DOM 监听） */
export interface DropZoneInstance {
    el: HTMLElement;
    component: any;
    zone: string;
    config: DropOptions;
}
