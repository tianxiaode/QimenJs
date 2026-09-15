import type { DemoConfig } from './types';

export const BUTTON_GROUP_DEMO: DemoConfig = {
    title: 'ButtonGroup',
    description: '按钮组组件，基于 ItemGroup，单选/多选模式，支持 items/direction/gap 等 option',
    sections: [
        {
            label: 'Single (单选模式)',
            code: `{ type: 'button-group', options: {
    mode: 'single',
    items: [
        { text: 'Left', value: 'left' },
        { text: 'Center', value: 'center' },
        { text: 'Right', value: 'right' },
    ],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'button-group',
                        options: {
                            mode: 'single',
                            items: [
                                { text: 'Left', value: 'left' },
                                { text: 'Center', value: 'center' },
                                { text: 'Right', value: 'right' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: 'Multiple (多选模式)',
            code: `{ type: 'button-group', options: {
    mode: 'multiple',
    items: [
        { text: 'Bold', value: 'bold' },
        { text: 'Italic', value: 'italic' },
        { text: 'Underline', value: 'underline' },
    ],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'button-group',
                        options: {
                            mode: 'multiple',
                            items: [
                                { text: 'Bold', value: 'bold' },
                                { text: 'Italic', value: 'italic' },
                                { text: 'Underline', value: 'underline' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: 'SelectedIndex (初始选中)',
            code: `{ type: 'button-group', options: {
    mode: 'single',
    selectedIndex: 1,
    items: [
        { text: 'Left' },
        { text: 'Center' },
        { text: 'Right' },
    ],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'button-group',
                        options: {
                            mode: 'single',
                            selectedIndex: 1,
                            items: [{ text: 'Left' }, { text: 'Center' }, { text: 'Right' }],
                        },
                    },
                ],
            },
        },
        {
            label: 'SelectedIndices (多选初始)',
            code: `{ type: 'button-group', options: {
    mode: 'multiple',
    selectedIndices: [0, 2],
    items: [
        { text: 'Bold' },
        { text: 'Italic' },
        { text: 'Underline' },
    ],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'button-group',
                        options: {
                            mode: 'multiple',
                            selectedIndices: [0, 2],
                            items: [{ text: 'Bold' }, { text: 'Italic' }, { text: 'Underline' }],
                        },
                    },
                ],
            },
        },
        {
            label: 'Size',
            code: `{ type: 'button-group', options: {
    size: 'md',
    items: [{ text: 'A' }, { text: 'B' }, { text: 'C' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'button-group',
                        options: {
                            size: 'sm',
                            items: [{ text: 'SM' }, { text: 'SM' }, { text: 'SM' }],
                        },
                    },
                    {
                        type: 'button-group',
                        options: {
                            size: 'md',
                            items: [{ text: 'MD' }, { text: 'MD' }, { text: 'MD' }],
                        },
                    },
                    {
                        type: 'button-group',
                        options: {
                            size: 'lg',
                            items: [{ text: 'LG' }, { text: 'LG' }, { text: 'LG' }],
                        },
                    },
                ],
            },
        },
        {
            label: 'Direction (方向)',
            code: `{ type: 'button-group', options: {
    mode: 'multiple',
    direction: 'vertical',
    gap: '4px',
    items: [{ text: 'Up' }, { text: 'Middle' }, { text: 'Down' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'button-group',
                        options: {
                            mode: 'multiple',
                            direction: 'vertical',
                            gap: '4px',
                            items: [{ text: 'Up' }, { text: 'Middle' }, { text: 'Down' }],
                        },
                    },
                ],
            },
        },
        {
            label: 'Color',
            code: `{ type: 'button-group', options: {
    color: 'success',
    items: [{ text: 'Yes' }, { text: 'No' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'button-group',
                        options: {
                            color: 'success',
                            items: [{ text: 'Yes' }, { text: 'No' }],
                        },
                    },
                ],
            },
        },
        {
            label: 'DefaultItemOption (统一子项属性)',
            code: `{ type: 'button-group', options: {
    mode: 'multiple',
    defaultItemOption: { size: 'lg', color: 'primary' },
    items: [{ text: 'A' }, { text: 'B' }, { text: 'C' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'button-group',
                        options: {
                            mode: 'multiple',
                            defaultItemOption: { size: 'lg', color: 'primary' },
                            items: [{ text: 'A' }, { text: 'B' }, { text: 'C' }],
                        },
                    },
                ],
            },
        },
    ],
};