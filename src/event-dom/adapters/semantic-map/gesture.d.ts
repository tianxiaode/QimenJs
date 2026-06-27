import { GestureEventMap } from '../../types';
/**
 * 手势事件映射配置
 *
 * ✔ 不涉及 DOM
 * ✔ 不涉及 mouse / touch / pointer
 * ✔ 只声明"我需要什么 + 谁来解释"
 *
 * @description 定义了高层语义化手势事件，将基础输入信号组合成有意义的手势行为，
 *              如点击、拖拽、长按等，并指定相应的处理器和约束条件
 */
export declare const gestureMap: Partial<GestureEventMap>;
/**
 * 键盘手势事件映射配置
 *
 * @description 定义了键盘相关的高层语义化事件，如回车提交等
 */
export declare const keyboardGestureMap: Partial<GestureEventMap>;
/**
 * 合并所有手势事件映射
 *
 * @description 将普通手势和键盘手势映射合并成一个完整的手势事件映射
 */
export declare const gestureEventMap: GestureEventMap;
//# sourceMappingURL=gesture.d.ts.map