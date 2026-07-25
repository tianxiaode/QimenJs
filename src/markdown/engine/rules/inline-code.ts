import type { InlineRule } from './index';

export const inlineCodeRule: InlineRule = {
    name: 'inline_code',
    priority: 10,
    replace(text) {
        return text.replace(/``(.+?)``/g, '<code>$1</code>').replace(/`(.+?)`/g, '<code>$1</code>');
    },
};
