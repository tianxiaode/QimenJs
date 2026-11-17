import type { TemplateDecl } from '@/component-core';
import { DayGridComponent } from './DayGridComponent';

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
                        {
                            tag: 'div',
                            name: 'yearGroup',
                            classes: 'q-dtpanel__field-group',
                            children: [
                                { tag: 'span', name: 'yearLabel', classes: 'q-dtpanel__field-label' },
                                {
                                    tag: 'div',
                                    name: 'yearArrows',
                                    classes: 'q-dtpanel__field-arrows',
                                    children: [
                                        { tag: 'button', name: 'prev1y', classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--up' },
                                        { tag: 'button', name: 'next1y', classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--down' },
                                    ],
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            name: 'monthGroup',
                            classes: 'q-dtpanel__field-group',
                            children: [
                                { tag: 'span', name: 'monthLabel', classes: 'q-dtpanel__field-label' },
                                {
                                    tag: 'div',
                                    name: 'monthArrows',
                                    classes: 'q-dtpanel__field-arrows',
                                    children: [
                                        { tag: 'button', name: 'prev1m', classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--up' },
                                        { tag: 'button', name: 'next1m', classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--down' },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                { tag: 'span', name: 'viewLabel', classes: 'q-dtpanel__view-label hidden' },
                { tag: 'button', name: 'confirmBtn', classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--confirm q-dtpanel__nav-confirm q-check hidden' },
                { tag: 'button', name: 'cancelBtn', classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--cancel q-dtpanel__nav-cancel q-close hidden' },
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
                        { name: 'dayGrid', type: DayGridComponent },
                    ],
                },
                { tag: 'div', name: 'subPanelContainer', classes: 'q-dtpanel__sub-panel hidden', children: [
                    { tag: 'div', name: 'subPanelContent', classes: 'q-dtpanel__sub-panel-content' },
                    { tag: 'div', name: 'subPanelFooter', classes: 'q-dtpanel__sub-panel-footer', children: [
                        { tag: 'button', name: 'subConfirmBtn', classes: 'q-dtpanel__sub-btn q-dtpanel__sub-btn--confirm' },
                        { tag: 'button', name: 'subCancelBtn', classes: 'q-dtpanel__sub-btn q-dtpanel__sub-btn--cancel' },
                    ]},
                ]},
            ],
        },
        {
            tag: 'div',
            name: 'bottom',
            classes: 'q-dtpanel__bottom',
            children: [
                { tag: 'button', name: 'todayBtn', classes: 'q-dtpanel__quick-btn q-dtpanel__quick-btn--today hidden' },
                {
                    tag: 'div',
                    name: 'timeBar',
                    classes: 'q-dtpanel__time-bar hidden',
                    children: [
                        {
                            tag: 'div',
                            classes: 'q-dtpanel__time-group',
                            children: [
                                { tag: 'button', name: 'hourBtn', classes: 'q-dtpanel__time-btn' },
                                {
                                    tag: 'div',
                                    classes: 'q-dtpanel__time-arrows',
                                    children: [
                                        { tag: 'button', name: 'hourUp', classes: 'q-dtpanel__time-arrow' },
                                        { tag: 'button', name: 'hourDown', classes: 'q-dtpanel__time-arrow' },
                                    ],
                                },
                            ],
                        },
                        { tag: 'span', name: 'timeSep1', classes: 'q-dtpanel__time-sep', options: { text: ':' } },
                        {
                            tag: 'div',
                            classes: 'q-dtpanel__time-group',
                            children: [
                                { tag: 'button', name: 'minuteBtn', classes: 'q-dtpanel__time-btn' },
                                {
                                    tag: 'div',
                                    classes: 'q-dtpanel__time-arrows',
                                    children: [
                                        { tag: 'button', name: 'minuteUp', classes: 'q-dtpanel__time-arrow' },
                                        { tag: 'button', name: 'minuteDown', classes: 'q-dtpanel__time-arrow' },
                                    ],
                                },
                            ],
                        },
                        { tag: 'span', name: 'timeSep2', classes: 'q-dtpanel__time-sep', options: { text: ':' } },
                        {
                            tag: 'div',
                            name: 'secondGroup',
                            classes: 'q-dtpanel__time-group',
                            children: [
                                { tag: 'button', name: 'secondBtn', classes: 'q-dtpanel__time-btn' },
                                {
                                    tag: 'div',
                                    classes: 'q-dtpanel__time-arrows',
                                    children: [
                                        { tag: 'button', name: 'secondUp', classes: 'q-dtpanel__time-arrow' },
                                        { tag: 'button', name: 'secondDown', classes: 'q-dtpanel__time-arrow' },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
