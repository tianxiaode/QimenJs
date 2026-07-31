/**
 * MarkdownEditorComponent Markdown 编辑器组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * 通过独立模板将 fieldBody 指定为 MarkdownEditorFieldBodyComponent。
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
import { MarkdownEngine } from './engine';
import { MARKDOWN_EDITOR_TPL } from './markdown-editor-tpl';
import './MarkdownEditorFieldBodyComponent';

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

class MarkdownEditorComponent extends FormFieldComponent {
    _value: string = '';
    _focused: boolean = false;
    _mode: MarkdownEditMode = 'edit';
    _autoSize: boolean | { minRows?: number; maxRows?: number } = false;
    _minRows: number = 1;
    _maxRows: number = Infinity;
    _engine: MarkdownEngine = new MarkdownEngine();
    _shortcuts: MarkdownShortcutAction[] = [...DEFAULT_SHORTCUTS];

    get editor(): HTMLTextAreaElement | undefined {
        return this.getNode('editor') as HTMLTextAreaElement | undefined;
    }

    get preview(): HTMLElement | undefined {
        return this.getNode('preview') as HTMLElement | undefined;
    }

    onAfterInit(props?: Record<string, any>): void {
        super.onAfterInit(props);
        this.addCls('q-md-editor q-md-editor--edit');
        this._initMarkdownEditor(props);
    }

    _initMarkdownEditor(props?: Record<string, any>): void {
        const editorEl = this.editor;

        const fieldBodyCmp = this.nodeMap?.fieldBody?.component;
        if (fieldBodyCmp) {
            fieldBodyCmp.on('input', () => this.onMdFieldInput());
            fieldBodyCmp.on('focus', () => this.onMdFieldFocus());
            fieldBodyCmp.on('blur', () => this.onMdFieldBlur());
            fieldBodyCmp.on('change', () => this.onMdFieldChange());
            fieldBodyCmp.on('keydown', (data: any) => this.onMdFieldKeydown(data));
        }

        if (props?.value !== undefined) {
            this._value = props.value;
            if (editorEl) editorEl.value = props.value;
            this._updatePreview();
        }
        if (props?.placeholder && editorEl) {
            editorEl.setAttribute('placeholder', props.placeholder);
        }
        if (props?.rows !== undefined && editorEl) {
            editorEl.setAttribute('rows', String(props.rows));
        }
        if (props?.disabled) this.disabled = true;
        if (props?.readonly) this.readonly = true;
        if (props?.mode) this._applyMode(props.mode);

        if (props?.autoSize) {
            this._autoSize = props.autoSize;
            if (typeof props.autoSize === 'object') {
                this._minRows = props.autoSize.minRows ?? 1;
                this._maxRows = props.autoSize.maxRows ?? Infinity;
            }
            this._autoResize();
        }

        this._applyState();
    }

    _applyMode(mode: MarkdownEditMode): void {
        this._mode = mode;
        for (const cls of Object.values(MODE_CLS_MAP)) {
            this.toggleCls(cls, false);
        }
        this.toggleCls(MODE_CLS_MAP[mode], true);
    }

    _updatePreview(): void {
        const previewEl = this.preview;
        if (previewEl) {
            previewEl.innerHTML = this._engine.render(this._value);
        }
    }

    onMdFieldInput(): void {
        this._value = this.editor?.value ?? '';
        this._updatePreview();
        if (this._autoSize) this._autoResize();
        if (this._shouldValidate('input')) this._doValidate();
    }

    onMdFieldFocus(): void {
        this._focused = true;
        this._applyState();
    }

    onMdFieldBlur(): void {
        this._focused = false;
        this._applyState();
        if (this._shouldValidate('blur')) this._doValidate();
    }

    onMdFieldChange(): void {
        this._value = this.editor?.value ?? '';
        if (this._shouldValidate('change')) this._doValidate();
    }

    onMdFieldKeydown(data: any): void {
        const editorEl = this.editor;
        if (!editorEl) return;

        const e: KeyboardEvent = data?.originalEvent ?? data;
        const key = e.key?.toLowerCase();

        if (key === 'tab') {
            e.preventDefault();
            this._handleTab(editorEl, e.shiftKey);
            this.onMdFieldInput();
            return;
        }

        if (!e.ctrlKey && !e.metaKey) return;

        const shortcut = this._shortcuts.find((s: MarkdownShortcutAction) => {
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
            this.onMdFieldInput();
        }
    }

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
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    _autoResize(): void {
        const editorEl = this.editor;
        if (!editorEl) return;

        editorEl.style.height = 'auto';
        const lineHeight = parseFloat(getComputedStyle(editorEl).lineHeight) || 20;
        const paddingTop = parseFloat(getComputedStyle(editorEl).paddingTop) || 0;
        const paddingBottom = parseFloat(getComputedStyle(editorEl).paddingBottom) || 0;
        const baseHeight = paddingTop + paddingBottom;

        const minH = baseHeight + lineHeight * this._minRows;
        const maxH =
            this._maxRows === Infinity ? Infinity : baseHeight + lineHeight * this._maxRows;

        const scrollH = editorEl.scrollHeight;
        const newH = Math.max(minH, Math.min(scrollH, maxH));

        editorEl.style.height = `${newH}px`;
        editorEl.style.overflow = scrollH > maxH ? 'auto' : 'hidden';
    }

    get value(): string {
        return this._value;
    }
    set value(v: string) {
        this._value = v;
        const editorEl = this.editor;
        if (editorEl && editorEl.value !== v) {
            editorEl.value = v;
        }
        this._updatePreview();
        if (this._autoSize) this._autoResize();
    }

    get disabled(): boolean {
        return this.el.classList.contains('q-md-editor--disabled');
    }
    set disabled(v: any) {
        const editorEl = this.editor;
        if (editorEl) {
            if (v) editorEl.setAttribute('disabled', 'true');
            else editorEl.removeAttribute('disabled');
        }
        this.toggleCls('q-md-editor--disabled', v);
    }

    get readonly(): boolean {
        return this.el.classList.contains('q-md-editor--readonly');
    }
    set readonly(v: any) {
        const editorEl = this.editor;
        if (editorEl) {
            if (v) editorEl.setAttribute('readonly', 'true');
            else editorEl.removeAttribute('readonly');
        }
        this.toggleCls('q-md-editor--readonly', v);
    }

    get mode(): MarkdownEditMode {
        return this._mode;
    }
    set mode(v: MarkdownEditMode) {
        this._applyMode(v);
    }

    focus(): void {
        this.editor?.focus();
    }

    blur(): void {
        this.editor?.blur();
    }

    _applyState(): void {
        this.toggleCls('q-md-editor--focused', this._focused);
        this.toggleCls('q-md-editor--error', !!this._error);
    }

    getFormValue(): any {
        return this._value;
    }

    setFormValue(v: any): void {
        this.value = v;
    }

    getFormDisplayValue(): any {
        return this._engine.render(this._value);
    }

    formReset(defaultValue?: any): void {
        this.value = defaultValue ?? '';
        this.error = '';
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        const editorEl = this.editor;

        if (props?.value !== undefined) this.value = props.value;
        if (props?.placeholder !== undefined && editorEl) {
            editorEl.setAttribute('placeholder', props.placeholder);
        }
        if (props?.rows !== undefined && editorEl) {
            editorEl.setAttribute('rows', String(props.rows));
        }
        if (props?.disabled !== undefined) this.disabled = props.disabled;
        if (props?.readonly !== undefined) this.readonly = props.readonly;
        if (props?.mode !== undefined) this._applyMode(props.mode);
        if (props?.autoSize !== undefined) {
            this._autoSize = props.autoSize;
            if (typeof props.autoSize === 'object') {
                this._minRows = props.autoSize.minRows ?? 1;
                this._maxRows = props.autoSize.maxRows ?? Infinity;
            }
            this._autoResize();
        }
    }
}

MarkdownEditorComponent.useTemplate(MARKDOWN_EDITOR_TPL);
export { MarkdownEditorComponent };
export type MarkdownEditorComponentInstance = InstanceType<typeof MarkdownEditorComponent>;
