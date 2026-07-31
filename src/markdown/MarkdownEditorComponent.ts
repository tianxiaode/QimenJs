/**
 * MarkdownEditorComponent Markdown 编辑器组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * 通过 nodes.fieldBody 指定为 MarkdownEditorFieldBodyComponent。
 *
 * 三封装结构（继承自 FormField）：
 * - labelGroup  标签封装：label + requiredMark + separator
 * - fieldBody   编辑器封装：textarea + preview
 * - infoGroup   信息封装：InputInfoGroupComponent (error/help/扩展信息)
 *
 * MarkdownEditor 特有功能：
 * - value/disabled/readonly 属性
 * - mode 编辑模式：edit（纯编辑）/ preview（纯预览）/ split（分栏）
 * - 内置 MarkdownEngine 渲染预览
 * - rows/autoSize 控制
 * - field 事件处理（input/focus/blur/change）
 *
 * 事件：input / focus / blur / change。
 *
 * @example
 * ```ts
 * new MarkdownEditorComponent({ value: '# Hello', mode: 'split' })
 * new MarkdownEditorComponent({ label: '内容', required: true, mode: 'edit' })
 * editor.on('input', ({ value }) => { ... })
 * ```
 */

import { FormFieldComponent, type FormFieldProps } from '../component/form/FormFieldComponent';
import { MarkdownEditorFieldBodyComponent } from './MarkdownEditorFieldBodyComponent';
import { MarkdownEngine } from './engine';
import { MARKDOWN_EDITOR_FIELD_BODY_TPL } from './markdown-editor-field-body-tpl';

export type MarkdownEditMode = 'edit' | 'preview' | 'split';

export interface MarkdownEditorProps extends FormFieldProps {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    mode?: MarkdownEditMode;
    rows?: number;
    autoSize?: boolean | { minRows?: number; maxRows?: number };
}

export interface MarkdownShortcutAction {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    handler: (ctx: ShortcutContext) => void;
}

export interface ShortcutContext {
    editor: HTMLTextAreaElement;
    wrap: (before: string, after: string, placeholder?: string) => void;
    insertLine: (prefix: string) => void;
}

const MODE_CLS_MAP: Record<MarkdownEditMode, string> = {
    edit: 'q-md-editor--edit',
    preview: 'q-md-editor--preview',
    split: 'q-md-editor--split',
};

function getEditorEl(cmp: any): HTMLTextAreaElement | null {
    return cmp.nodeMap?.editor?.el as HTMLTextAreaElement | null;
}

function getPreviewEl(cmp: any): HTMLElement | null {
    return cmp.nodeMap?.preview?.el as HTMLElement | null;
}

function wrapSelection(
    el: HTMLTextAreaElement,
    before: string,
    after: string,
    placeholder = ''
): void {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end);
    const text = selected || placeholder;
    const replacement = before + text + after;

    el.focus();
    document.execCommand('insertText', false, replacement);

    if (!selected && placeholder) {
        el.selectionStart = start + before.length;
        el.selectionEnd = start + before.length + placeholder.length;
    }
}

function insertLinePrefix(el: HTMLTextAreaElement, prefix: string): void {
    const start = el.selectionStart;
    const val = el.value;
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = val.indexOf('\n', start);
    const end = lineEnd === -1 ? val.length : lineEnd;
    const line = val.substring(lineStart, end);

    el.selectionStart = lineStart;
    el.selectionEnd = end;
    document.execCommand('insertText', false, prefix + line);
}

const DEFAULT_SHORTCUTS: MarkdownShortcutAction[] = [
    {
        key: 'b',
        ctrl: true,
        handler(ctx) {
            ctx.wrap('**', '**', 'bold');
        },
    },
    {
        key: 'i',
        ctrl: true,
        handler(ctx) {
            ctx.wrap('*', '*', 'italic');
        },
    },
    {
        key: 'd',
        ctrl: true,
        shift: true,
        handler(ctx) {
            ctx.wrap('~~', '~~', 'text');
        },
    },
    {
        key: '`',
        ctrl: true,
        handler(ctx) {
            ctx.wrap('`', '`', 'code');
        },
    },
    {
        key: 'k',
        ctrl: true,
        handler(ctx) {
            ctx.wrap('[', '](url)', 'link text');
        },
    },
    {
        key: 'k',
        ctrl: true,
        shift: true,
        handler(ctx) {
            ctx.insertLine('```\n');
        },
    },
    {
        key: 'h',
        ctrl: true,
        handler(ctx) {
            ctx.insertLine('## ');
        },
    },
    {
        key: 'q',
        ctrl: true,
        handler(ctx) {
            ctx.insertLine('> ');
        },
    },
    {
        key: 'u',
        ctrl: true,
        handler(ctx) {
            ctx.insertLine('- ');
        },
    },
    {
        key: 'o',
        ctrl: true,
        handler(ctx) {
            ctx.insertLine('1. ');
        },
    },
];

export let MarkdownEditorComponent = FormFieldComponent.replace({
    body: {
        _value: '' as string,
        _focused: false as boolean,
        _mode: 'edit' as MarkdownEditMode,
        _autoSize: false as boolean | { minRows?: number; maxRows?: number },
        _minRows: 1 as number,
        _maxRows: Infinity as number,
        _engine: new MarkdownEngine(),
        _shortcuts: [...DEFAULT_SHORTCUTS] as MarkdownShortcutAction[],

        nodes: {
            root: { addCls: 'q-md-editor q-md-editor--edit' },
            fieldBody: {
                type: MarkdownEditorFieldBodyComponent,
            },
        },

        onAfterInit(props?: MarkdownEditorProps): void {
            const self = this as any;
            self._initMarkdownEditor(props);
        },

        _initMarkdownEditor(props?: MarkdownEditorProps): void {
            const self = this as any;
            const editorEl = getEditorEl(self);

            const fieldBodyCmp = self.nodeMap?.fieldBody?.component;
            if (fieldBodyCmp) {
                fieldBodyCmp.on('input', () => self.onMdFieldInput());
                fieldBodyCmp.on('focus', () => self.onMdFieldFocus());
                fieldBodyCmp.on('blur', () => self.onMdFieldBlur());
                fieldBodyCmp.on('change', () => self.onMdFieldChange());
                fieldBodyCmp.on('keydown', (data: any) => self.onMdFieldKeydown(data));
            }

            if (props?.value !== undefined) {
                self._value = props.value;
                if (editorEl) editorEl.value = props.value;
                self._updatePreview();
            }
            if (props?.placeholder && editorEl) {
                editorEl.setAttribute('placeholder', props.placeholder);
            }
            if (props?.rows !== undefined && editorEl) {
                editorEl.setAttribute('rows', String(props.rows));
            }
            if (props?.disabled) self.disabled = true;
            if (props?.readonly) self.readonly = true;
            if (props?.mode) self._applyMode(props.mode);

            if (props?.autoSize) {
                self._autoSize = props.autoSize;
                if (typeof props.autoSize === 'object') {
                    self._minRows = props.autoSize.minRows ?? 1;
                    self._maxRows = props.autoSize.maxRows ?? Infinity;
                }
                self._autoResize();
            }

            self._applyState();
        },

        _applyMode(mode: MarkdownEditMode): void {
            const self = this as any;
            self._mode = mode;
            for (const cls of Object.values(MODE_CLS_MAP)) {
                self.toggleCls(cls, false);
            }
            self.toggleCls(MODE_CLS_MAP[mode], true);
        },

        _updatePreview(): void {
            const self = this as any;
            const previewEl = getPreviewEl(self);
            if (previewEl) {
                previewEl.innerHTML = self._engine.render(self._value);
            }
        },

        onMdFieldInput(): void {
            const self = this as any;
            self._value = getEditorEl(self)?.value ?? '';
            self._updatePreview();
            if (self._autoSize) self._autoResize();
            if (self._shouldValidate('input')) self._doValidate();
        },

        onMdFieldFocus(): void {
            const self = this as any;
            self._focused = true;
            self._applyState();
        },

        onMdFieldBlur(): void {
            const self = this as any;
            self._focused = false;
            self._applyState();
            if (self._shouldValidate('blur')) self._doValidate();
        },

        onMdFieldChange(): void {
            const self = this as any;
            self._value = getEditorEl(self)?.value ?? '';
            if (self._shouldValidate('change')) self._doValidate();
        },

        onMdFieldKeydown(data: any): void {
            const self = this as any;
            const editorEl = getEditorEl(self);
            if (!editorEl) return;

            const e: KeyboardEvent = data?.originalEvent ?? data;
            const key = e.key?.toLowerCase();

            if (key === 'tab') {
                e.preventDefault();
                self._handleTab(editorEl, e.shiftKey);
                self.onMdFieldInput();
                return;
            }

            if (!e.ctrlKey && !e.metaKey) return;

            const shortcut = self._shortcuts.find((s: MarkdownShortcutAction) => {
                return (
                    s.key === key &&
                    !!s.ctrl === (e.ctrlKey || e.metaKey) &&
                    !!s.shift === e.shiftKey &&
                    !!s.alt === e.altKey
                );
            });

            if (shortcut) {
                e.preventDefault();
                const ctx: ShortcutContext = {
                    editor: editorEl,
                    wrap(before, after, placeholder) {
                        wrapSelection(editorEl, before, after, placeholder);
                    },
                    insertLine(prefix) {
                        insertLinePrefix(editorEl, prefix);
                    },
                };
                shortcut.handler(ctx);
                self.onMdFieldInput();
            }
        },

        _handleTab(el: HTMLTextAreaElement, shift: boolean): void {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const val = el.value;

            if (shift) {
                const lineStart = val.lastIndexOf('\n', start - 1) + 1;
                const linePrefix = val.substring(lineStart, lineStart + 4);
                if (linePrefix === '    ' || linePrefix.startsWith('\t')) {
                    const removeLen = linePrefix === '    ' ? 4 : 1;
                    el.selectionStart = lineStart;
                    el.selectionEnd = lineStart + removeLen;
                    document.execCommand('delete');
                }
            } else {
                el.selectionStart = start;
                el.selectionEnd = end;
                document.execCommand('insertText', false, '    ');
            }
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            const self = this as any;
            return { value: self._value };
        },

        _autoResize(): void {
            const self = this as any;
            const editorEl = getEditorEl(self);
            if (!editorEl) return;

            editorEl.style.height = 'auto';
            const lineHeight = parseFloat(getComputedStyle(editorEl).lineHeight) || 20;
            const paddingTop = parseFloat(getComputedStyle(editorEl).paddingTop) || 0;
            const paddingBottom = parseFloat(getComputedStyle(editorEl).paddingBottom) || 0;
            const baseHeight = paddingTop + paddingBottom;

            const minH = baseHeight + lineHeight * self._minRows;
            const maxH =
                self._maxRows === Infinity ? Infinity : baseHeight + lineHeight * self._maxRows;

            const scrollH = editorEl.scrollHeight;
            const newH = Math.max(minH, Math.min(scrollH, maxH));

            editorEl.style.height = `${newH}px`;
            editorEl.style.overflow = scrollH > maxH ? 'auto' : 'hidden';
        },

        get value(): string {
            const self = this as any;
            return self._value;
        },
        set value(v: string) {
            const self = this as any;
            self._value = v;
            const editorEl = getEditorEl(self);
            if (editorEl && editorEl.value !== v) {
                editorEl.value = v;
            }
            self._updatePreview();
            if (self._autoSize) self._autoResize();
        },

        get disabled(): boolean {
            const self = this as any;
            return self.el.classList.contains('q-md-editor--disabled');
        },
        set disabled(v: boolean) {
            const self = this as any;
            const editorEl = getEditorEl(self);
            if (editorEl) {
                if (v) editorEl.setAttribute('disabled', 'true');
                else editorEl.removeAttribute('disabled');
            }
            self.toggleCls('q-md-editor--disabled', v);
        },

        get readonly(): boolean {
            const self = this as any;
            return self.el.classList.contains('q-md-editor--readonly');
        },
        set readonly(v: boolean) {
            const self = this as any;
            const editorEl = getEditorEl(self);
            if (editorEl) {
                if (v) editorEl.setAttribute('readonly', 'true');
                else editorEl.removeAttribute('readonly');
            }
            self.toggleCls('q-md-editor--readonly', v);
        },

        get mode(): MarkdownEditMode {
            const self = this as any;
            return self._mode;
        },
        set mode(v: MarkdownEditMode) {
            const self = this as any;
            self._applyMode(v);
        },

        focus(): void {
            getEditorEl(this)?.focus();
        },

        blur(): void {
            getEditorEl(this)?.blur();
        },

        _applyState(): void {
            const self = this as any;
            self.toggleCls('q-md-editor--focused', self._focused);
            self.toggleCls('q-md-editor--error', !!self._error);
        },

        getFormValue(): any {
            const self = this as any;
            return self._value;
        },

        setFormValue(v: any): void {
            const self = this as any;
            self.value = v;
        },

        getFormDisplayValue(): any {
            const self = this as any;
            return self._engine.render(self._value);
        },

        formReset(defaultValue?: any): void {
            const self = this as any;
            self.value = defaultValue ?? '';
            self.error = '';
        },

        update(props?: Partial<MarkdownEditorProps>): void {
            const self = this as any;
            const editorEl = getEditorEl(self);

            self._super.update(props);

            if (props?.value !== undefined) self.value = props.value;
            if (props?.placeholder !== undefined && editorEl) {
                editorEl.setAttribute('placeholder', props.placeholder);
            }
            if (props?.rows !== undefined && editorEl) {
                editorEl.setAttribute('rows', String(props.rows));
            }
            if (props?.disabled !== undefined) self.disabled = props.disabled;
            if (props?.readonly !== undefined) self.readonly = props.readonly;
            if (props?.mode !== undefined) self._applyMode(props.mode);
            if (props?.autoSize !== undefined) {
                self._autoSize = props.autoSize;
                if (typeof props.autoSize === 'object') {
                    self._minRows = props.autoSize.minRows ?? 1;
                    self._maxRows = props.autoSize.maxRows ?? Infinity;
                }
                self._autoResize();
            }
        },
    },
});

MarkdownEditorComponent.useTemplate(MARKDOWN_EDITOR_FIELD_BODY_TPL);

export type MarkdownEditorComponent = InstanceType<typeof MarkdownEditorComponent>;
