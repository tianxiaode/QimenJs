/**
 * @file ContextMenuProcessor.ts
 * @description
 * ContextMenuProcessor 是处理上下文菜单事件的处理器类。它继承自GestureProcessor，
 * 主要用于处理右键点击或键盘上下文菜单键触发的事件。支持鼠标右键和键盘事件（如上下文菜单键或Shift+F10）。
 *
 * 该处理器检查鼠标按钮状态或特定键盘按键，以触发上下文菜单语义事件。
 */
import { GestureEventDescriptor, GestureSemantic, GestureEmit } from '../types';
import { GestureProcessor } from './GestureProcessor';
/**
 * ContextMenuProcessor类
 * 处理上下文菜单事件，支持鼠标右键和键盘快捷键（ContextMenu键或Shift+F10）
 */
export declare class ContextMenuProcessor extends GestureProcessor<'contextmenu'> {
    protected readonly semantic: GestureSemantic;
    protected readonly emit: (event: GestureEmit) => void;
    protected readonly constraints?: GestureEventDescriptor<'contextmenu'>['constraints'];
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，指定触发上下文菜单的条件
     */
    constructor(semantic: GestureSemantic, emit: (event: GestureEmit) => void, constraints?: GestureEventDescriptor<'contextmenu'>['constraints']);
}
//# sourceMappingURL=ContextMenuProcessor.d.ts.map