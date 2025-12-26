import { EventScope } from "@orbitjs/event-core";

/**
 * 监听文件输入变化
 * 
 * @param scope - 事件作用域
 * @param target - 文件输入元素
 * @param handler - 文件选择时的回调
 * 
 * @example
 * ```ts
 * const scope = new EventScope();
 * const fileInput = document.getElementById('fileUpload');
 * 
 * bindFileChange(scope, fileInput, (files) => {
 *   console.log('选择了文件:', files);
 *   if (files[0]) {
 *     previewImage(files[0]);
 *   }
 * });
 * ```
 */
export function bindFileChange(
    scope: EventScope<any>,
    target: HTMLInputElement,
    handler: (files: FileList) => void
) {
    const changeListener = (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            handler(input.files);
        }
    };

    target.addEventListener("change", changeListener);
    
    scope.addCleanup(() => {
        target.removeEventListener("change", changeListener);
    });
}