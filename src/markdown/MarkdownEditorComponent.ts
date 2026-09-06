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

import { FormFieldComponent } from '../component/form/FormFieldComponent';
import { MarkdownEngine } from './engine';
import { MARKDOWN_EDITOR_TPL } from './markdown-editor-tpl';
import { Definitions } from '@/composable';
import './MarkdownEditorFieldBodyComponent';
import './markdown-editor.css';

export type MarkdownEditMode = 'edit' | 'preview' | 'split';

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

const MarkdownEditorComponentDefs: Definitions = {
    options: {
        value: '',
        placeholder: null,
        rows: null,
        disabled: false,
        readonly: false,
        mode: 'edit',
        autoSize: false,
    },
} as const;

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
    _focused: boolean = false;
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

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-md-editor');
        this._initMarkdownEditor();
    }

    _initMarkdownEditor(): void {
        const editorEl = this.editor;

        const fieldBodyCmp = this.nodeMap?.fieldBody?.component;
        if (fieldBodyCmp) {
            fieldBodyCmp.on('input', () => this.onMdFieldInput());
            fieldBodyCmp.on('focus', () => this.onMdFieldFocus());
            fieldBodyCmp.on('blur', () => this.onMdFieldBlur());
            fieldBodyCmp.on('change', () => this.onMdFieldChange());
            fieldBodyCmp.on('keydown', (data: any) => this.onMdFieldKeydown(data));
        }

        if (this.value && editorEl) {
            editorEl.value = this.value;
            this._updatePreview();
        }
        if (this.placeholder && editorEl) {
            editorEl.setAttribute('placeholder', this.placeholder);
        }
        if (this.rows != null && editorEl) {
            editorEl.setAttribute('rows', String(this.rows));
        }
        if (this.disabled) this._applyDisabled(true);
        if (this.readonly) this._applyReadonly(true);

        if (this.autoSize) {
            if (typeof this.autoSize === 'object') {
                this._minRows = this.autoSize.minRows ?? 1;
                this._maxRows = this.autoSize.maxRows ?? Infinity;
            }
            this._autoResize();
        }

        this._applyState();
    }

    _onPlaceholderOptionChange(value: string): void {
        const editorEl = this.editor;
        if (editorEl) {
            if (value) editorEl.setAttribute('placeholder', value);
            else editorEl.removeAttribute('placeholder');
        }
    }

    _onRowsOptionChange(value: number): void {
        const editorEl = this.editor;
        if (editorEl && value != null) {
            editorEl.setAttribute('rows', String(value));
        }
    }

    _onValueOptionChange(value: string): void {
        const editorEl = this.editor;
        if (editorEl && editorEl.value !== value) {
            editorEl.value = value;
        }
        this._updatePreview();
        if (this.autoSize) this._autoResize();
    }

    _onDisabledOptionChange(value: boolean): void {
        this._applyDisabled(value);
    }

    _onReadonlyOptionChange(value: boolean): void {
        this._applyReadonly(value);
    }

    _onModeOptionChange(value: MarkdownEditMode): void {
        for (const cls of Object.values(MODE_CLS_MAP)) {
            this.toggleCls(cls, false);
        }
        this.toggleCls(MODE_CLS_MAP[value], true);
    }

    _onAutoSizeOptionChange(value: any): void {
        if (value) {
            if (typeof value === 'object') {
                this._minRows = value.minRows ?? 1;
                this._maxRows = value.maxRows ?? Infinity;
            }
            this._autoResize();
        }
    }

    _applyDisabled(v: boolean): void {
        const editorEl = this.editor;
        if (editorEl) {
            if (v) editorEl.setAttribute('disabled', 'true');
            else editorEl.removeAttribute('disabled');
        }
        this.toggleCls('q-md-editor--disabled', v);
    }

    _applyReadonly(v: boolean): void {
        const editorEl = this.editor;
        if (editorEl) {
            if (v) editorEl.setAttribute('readonly', 'true');
            else editorEl.removeAttribute('readonly');
        }
        this.toggleCls('q-md-editor--readonly', v);
    }

    _updatePreview(): void {
        const previewEl = this.preview;
        if (previewEl) {
            previewEl.innerHTML = this._engine.render(this.value);
        }
    }

    onMdFieldInput(): void {
        this.value = this.editor?.value ?? '';
        this._updatePreview();
        if (this.autoSize) this._autoResize();
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
        this.value = this.editor?.value ?? '';
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

    get defaultEventData(): Record<string, any> {
        return { ...super.defaultEventData, value: this.value };
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
        return this.value;
    }

    setFormValue(v: any): void {
        this.value = v;
    }

    getFormDisplayValue(): any {
        return this._engine.render(this.value);
    }

    formReset(defaultValue?: any): void {
        this.value = defaultValue ?? '';
        this.error = '';
    }

    update(props?: Record<string, any>): void {
        super.update(props);
    }
}

MarkdownEditorComponent.useTemplate(MARKDOWN_EDITOR_TPL);
MarkdownEditorComponent.define(MarkdownEditorComponentDefs);
export { MarkdownEditorComponent };
export type MarkdownEditorComponentInstance = InstanceType<typeof MarkdownEditorComponent>;
