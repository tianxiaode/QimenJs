import type { TemplateDecl } from '@/component-core';

export const DATETIME_PANEL_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-dtpanel q-dtpanel--datetime',
    children: [
        {
            tag: 'div',
            name: 'nav',
            classes: 'q-dtpanel__nav',
            children: [
                {
                    tag: 'div',
                    name: 'dateNav',
                    classes: 'q-dtpanel__date-nav',
                    children: [
                        { tag: 'span', name: 'yearLabel', classes: 'q-dtpanel__field-label' },
                        {
                            tag: 'div',
                            name: 'yearArrows',
                            classes: 'q-dtpanel__field-arrows',
                            children: [
                                { tag: 'button', name: 'yearUp', classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--up' },
                                { tag: 'button', name: 'yearDown', classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--down' },
                            ],
                        },
                        { tag: 'span', name: 'dateSep1', classes: 'q-dtpanel__field-sep', options: { text: '-' } },
                        { tag: 'span', name: 'monthLabel', classes: 'q-dtpanel__field-label' },
                        {
                            tag: 'div',
                            name: 'monthArrows',
                            classes: 'q-dtpanel__field-arrows',
                            children: [
                                { tag: 'button', name: 'monthUp', classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--up' },
                                { tag: 'button', name: 'monthDown', classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--down' },
                            ],
                        },
                        { tag: 'span', name: 'dateSep2', classes: 'q-dtpanel__field-sep', options: { text: '-' } },
                        { tag: 'span', name: 'dayLabel', classes: 'q-dtpanel__field-label' },
                    ],
                },
                {
                    tag: 'button',
                    name: 'confirmBtn',
                    classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--confirm hidden',
                },
            ],
        },
        {
            tag: 'div',
            name: 'body',
            classes: 'q-dtpanel__body',
            children: [
                {
                    tag: 'div',
                    name: 'dateView',
                    classes: 'q-dtpanel__date-view',
                    children: [
                        { tag: 'div', name: 'weekdayRow', classes: 'q-dtpanel__weekday-row' },
                        { tag: 'div', name: 'dayGrid', classes: 'q-dtpanel__day-grid' },
                    ],
                },
                { tag: 'div', name: 'yearPanel', classes: 'q-dtpanel__panel-view hidden' },
                { tag: 'div', name: 'monthPanel', classes: 'q-dtpanel__panel-view hidden' },
                { tag: 'div', name: 'hourPanel', classes: 'q-dtpanel__panel-view hidden' },
                { tag: 'div', name: 'minutePanel', classes: 'q-dtpanel__panel-view hidden' },
                { tag: 'div', name: 'secondPanel', classes: 'q-dtpanel__panel-view hidden' },
            ],
        },
        {
            tag: 'div',
            name: 'bottom',
            classes: 'q-dtpanel__bottom',
            children: [
                {
                    tag: 'button',
                    name: 'todayBtn',
                    classes: 'q-dtpanel__quick-btn q-dtpanel__quick-btn--today hidden',
                },
                {
                    tag: 'div',
                    name: 'timeBar',
                    classes: 'q-dtpanel__time-bar hidden',
                    children: [
                        { tag: 'button', name: 'hourBtn', classes: 'q-dtpanel__time-btn' },
                        {
                            tag: 'span',
                            name: 'timeSep1',
                            classes: 'q-dtpanel__time-sep',
                            options: { text: ':' },
                        },
                        { tag: 'button', name: 'minuteBtn', classes: 'q-dtpanel__time-btn' },
                        {
                            tag: 'span',
                            name: 'timeSep2',
                            classes: 'q-dtpanel__time-sep',
                            options: { text: ':' },
                        },
                        {
                            tag: 'div',
                            name: 'secondGroup',
                            classes: 'q-dtpanel__time-group',
                            children: [
                                {
                                    tag: 'button',
                                    name: 'secondBtn',
                                    classes: 'q-dtpanel__time-btn',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
