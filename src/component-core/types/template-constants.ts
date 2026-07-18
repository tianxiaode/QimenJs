/**
 * template-constants 类型定义
 */

export type AreaType =
    | 'button'
    | 'input'
    | 'select'
    | 'header'
    | 'body'
    | 'footer'
    | 'tips'
    | 'dropdown'
    | 'popover'
    | 'toast'
    | 'msgbox'
    | 'table'
    | 'dialog'
    | 'children'
    | 'panel'
    | 'itemgroup';

export type NameType =
    | 'default'
    | 'label'
    | 'prefix'
    | 'suffix'
    | 'error'
    | 'hint'
    | 'text'
    | 'icon'
    | 'message'
    | 'content'
    | 'close'
    | 'confirm'
    | 'cancel'
    | 'field'
    | 'headerRow'
    | 'bodyScroll';

export type EventType =
    | 'click'
    | 'input'
    | 'change'
    | 'scroll'
    | 'submit'
    | 'focus'
    | 'blur'
    | 'keydown'
    | 'keyup'
    | 'mouseenter'
    | 'mouseleave';

export type SlotType = `${AreaType}:${NameType}` | `${AreaType}:${string}`;
