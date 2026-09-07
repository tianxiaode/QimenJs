import type { TemplateDecl } from '@/component-core';

/** 一次性密码模板定义 */
export const ONE_TIME_PASSWORD_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-otp q-otp__container',
    children: [
        {
            tag: 'input',
            name: 'input0',
            classes: 'q-otp__input',
            attributes: { 'aria-label': 'Digit 1' },
            options: { maxLength: '1' },
        },
        {
            tag: 'input',
            name: 'input1',
            classes: 'q-otp__input',
            attributes: { 'aria-label': 'Digit 2' },
            options: { maxLength: '1' },
        },
        {
            tag: 'input',
            name: 'input2',
            classes: 'q-otp__input',
            attributes: { 'aria-label': 'Digit 3' },
            options: { maxLength: '1' },
        },
        {
            tag: 'input',
            name: 'input3',
            classes: 'q-otp__input',
            attributes: { 'aria-label': 'Digit 4' },
            options: { maxLength: '1' },
        },
        {
            tag: 'input',
            name: 'input4',
            classes: 'q-otp__input',
            attributes: { 'aria-label': 'Digit 5' },
            options: { maxLength: '1' },
        },
        {
            tag: 'input',
            name: 'input5',
            classes: 'q-otp__input',
            attributes: { 'aria-label': 'Digit 6' },
            options: { maxLength: '1' },
        },
        {
            tag: 'input',
            name: 'input6',
            classes: 'q-otp__input',
            attributes: { 'aria-label': 'Digit 7' },
            options: { maxLength: '1' },
        },
        {
            tag: 'input',
            name: 'input7',
            classes: 'q-otp__input',
            attributes: { 'aria-label': 'Digit 8' },
            options: { maxLength: '1' },
        },
    ],
};
