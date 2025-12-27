/**
 * 监听输入元素的变化事件
 * 当值改变且元素失去焦点时触发（或选择框、单选按钮改变时）
 * 
 * @param scope - 事件作用域
 * @param target - 输入元素
 * @param handler - 变化时的回调函数
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const emailInput = document.getElementById('email');
 * 
 * bindChange(scope, emailInput, (value) => {
 *   console.log('邮箱已确认:', value);
 *   // 验证邮箱格式
 *   validateEmail(value);
 * });
 * 
 * // 对于选择框
 * const countrySelect = document.getElementById('country');
 * bindChange(scope, countrySelect, (value) => {
 *   console.log('国家已选择:', value);
 *   updateShippingInfo(value);
 * });
 * ```
 */
import { EventScope } from "@/event";

export function bindChange(
    scope: EventScope<any>,
    target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    handler: (value: string, event: Event) => void
) {
    const changeListener = (e: Event) => {
        handler((e.target as HTMLInputElement).value, e);
    };

    target.addEventListener("change", changeListener);
    
    scope.addCleanup(() => {
        target.removeEventListener("change", changeListener);
    });
}