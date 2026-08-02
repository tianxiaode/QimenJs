/**
 * panel-preview.ts — 面板导航栏内预览渲染工具
 *
 * 各面板共用：根据 DateTimeValue 渲染导航栏 preview 区域的可点击字段。
 * DatePicker 通过 props 传入 previewData，面板在 onAfterInit 中调用 renderPreview。
 */

import type { DateTimeField, DateTimeValue } from '@/utils/date/datetime-picker';

export interface PanelPreviewData {
    value: DateTimeValue;
    activeField: DateTimeField;
    showSeconds: boolean;
}

const FIELD_CONFIG: { key: DateTimeField; sep: string }[] = [
    { key: 'year', sep: '-' },
    { key: 'month', sep: '-' },
    { key: 'day', sep: ' ' },
    { key: 'hour', sep: ':' },
    { key: 'minute', sep: ':' },
    { key: 'second', sep: '' },
];

const FIELD_TEXT: Record<DateTimeField, (v: DateTimeValue) => string> = {
    year: v => String(v.year).padStart(4, '0'),
    month: v => String(v.month).padStart(2, '0'),
    day: v => String(v.day).padStart(2, '0'),
    hour: v => String(v.hour).padStart(2, '0'),
    minute: v => String(v.minute).padStart(2, '0'),
    second: v => String(v.second).padStart(2, '0'),
};

export function renderPreview(
    previewEl: HTMLElement | null,
    data: PanelPreviewData,
    onFieldClick: (field: DateTimeField) => void
): void {
    if (!previewEl) return;
    previewEl.innerHTML = '';

    for (const cfg of FIELD_CONFIG) {
        if (cfg.key === 'second' && !data.showSeconds) continue;

        const span = document.createElement('span');
        span.className = 'q-dtpanel__preview-field';
        if (data.activeField === cfg.key) {
            span.classList.add('q-dtpanel__preview-field--active');
        }
        span.textContent = FIELD_TEXT[cfg.key](data.value);
        span.addEventListener('click', e => {
            e.stopPropagation();
            onFieldClick(cfg.key);
        });
        previewEl.appendChild(span);

        if (cfg.sep) {
            const sep = document.createElement('span');
            sep.className = 'q-dtpanel__preview-sep';
            sep.textContent = cfg.sep;
            previewEl.appendChild(sep);
        }
    }
}
