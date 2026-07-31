/**
 * OneTimePassword 模板定义
 */

import type { TplNode } from '@/component-core/types/tpl-node-types';

export const ONE_TIME_PASSWORD_TPL: TplNode = {
    tag: 'div',
    cls: 'q-otp q-otp__container',
    children: [
        { tag: 'input', name: 'input0', cls: 'q-otp__input', attrs: { maxLength: '1', 'aria-label': 'Digit 1' } },
        { tag: 'input', name: 'input1', cls: 'q-otp__input', attrs: { maxLength: '1', 'aria-label': 'Digit 2' } },
        { tag: 'input', name: 'input2', cls: 'q-otp__input', attrs: { maxLength: '1', 'aria-label': 'Digit 3' } },
        { tag: 'input', name: 'input3', cls: 'q-otp__input', attrs: { maxLength: '1', 'aria-label': 'Digit 4' } },
        { tag: 'input', name: 'input4', cls: 'q-otp__input', attrs: { maxLength: '1', 'aria-label': 'Digit 5' } },
        { tag: 'input', name: 'input5', cls: 'q-otp__input', attrs: { maxLength: '1', 'aria-label': 'Digit 6' } },
        { tag: 'input', name: 'input6', cls: 'q-otp__input', attrs: { maxLength: '1', 'aria-label': 'Digit 7' } },
        { tag: 'input', name: 'input7', cls: 'q-otp__input', attrs: { maxLength: '1', 'aria-label': 'Digit 8' } },
    ],
};
