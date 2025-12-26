/**
 * 创建焦点陷阱，将焦点限制在特定元素内
 * 常用于模态框、对话框等组件
 * 
 * @param scope - 事件作用域
 * @param container - 容器元素
 * @param onEscape - 按下ESC键时的回调（可选）
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const modal = document.getElementById('modal');
 * 
 * bindFocusTrap(scope, modal, () => {
 *   console.log('按下ESC，关闭模态框');
 *   closeModal();
 * });
 * ```
 */
import { EventScope } from "@orbitjs/event-core";

export function bindFocusTrap(
    scope: EventScope<any>,
    container: HTMLElement,
    onEscape?: () => void
) {
    // 保存当前焦点元素
    let previousActiveElement: HTMLElement | null = null;
    
    // 获取所有可聚焦元素
    const getFocusableElements = (): HTMLElement[] => {
        return Array.from(container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => 
            !el.hasAttribute('disabled') && 
            el.getAttribute('tabindex') !== '-1'
        ) as HTMLElement[];
    };
    
    // 监听焦点进入容器
    const focusListener = (e: FocusEvent) => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;
        
        // 如果焦点移出容器，将其移回第一个可聚焦元素
        if (!container.contains(e.target as Node)) {
            focusableElements[0].focus();
        }
    };
    
    // 监听Tab键
    const keydownListener = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onEscape) {
            onEscape();
            return;
        }
        
        if (e.key !== 'Tab') return;
        
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Shift + Tab：向前循环
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } 
        // Tab：向后循环
        else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };
    
    // 保存之前的焦点元素
    previousActiveElement = document.activeElement as HTMLElement;
    
    // 添加事件监听
    container.addEventListener('focusin', focusListener);
    container.addEventListener('keydown', keydownListener);
    
    // 将焦点移动到容器内的第一个可聚焦元素
    setTimeout(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }, 0);
    
    // 清理函数：恢复之前的焦点
    scope.addCleanup(() => {
        container.removeEventListener('focusin', focusListener);
        container.removeEventListener('keydown', keydownListener);
        
        if (previousActiveElement && document.body.contains(previousActiveElement)) {
            previousActiveElement.focus();
        }
    });
}