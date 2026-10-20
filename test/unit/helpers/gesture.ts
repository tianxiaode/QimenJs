/**
 * domEvents 手势模拟辅助
 *
 * 语义 click 不是原生事件监听，而是由 press→release 序列经 TapProcessor 合成
 * （见 semantic-map/gesture.ts 的 click 描述符）。
 * 直接派发裸 MouseEvent('click') 不会触发 domEvents 委托链，必须模拟完整按压序列。
 *
 * jsdom 特性：'ontouchstart' in window 为 true 但不提供 PointerEvent，
 * 引擎能力探测会误入 touch 模式（绑定 touchstart/touchend），而测试无法构造有效的
 * Touch 派发。因此本模块在加载时移除 ontouchstart，强制引擎走 mouse 模式
 * （press←mousedown / release←mouseup），之后再派发对应序列。
 * 组件 bind 发生在组件 init（晚于本模块 import），时机上保证生效。
 */

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if ('ontouchstart' in window) {
    delete (window as { ontouchstart?: unknown }).ontouchstart;
}

type PointerCtor = new (type: string, init?: MouseEventInit) => MouseEvent;

function pressRelease(): { Ctor: PointerCtor; down: string; up: string } {
    if (typeof window.PointerEvent !== 'undefined') {
        return {
            Ctor: window.PointerEvent as unknown as PointerCtor,
            down: 'pointerdown',
            up: 'pointerup',
        };
    }
    // jsdom 未提供 PointerEvent → 引擎能力探测走 mouse 模式
    return { Ctor: MouseEvent, down: 'mousedown', up: 'mouseup' };
}

/** 模拟一次完整按压（press→release），合成语义 click */
export function gestureClick(el: Element, clientX = 0, clientY = 0): void {
    const { Ctor, down, up } = pressRelease();
    const init: MouseEventInit = {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY,
        button: 0,
    };
    el.dispatchEvent(new Ctor(down, init));
    el.dispatchEvent(new Ctor(up, init));
}
