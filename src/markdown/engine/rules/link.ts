import type { InlineRule } from './index';

export const linkRule: InlineRule = {
    name: 'link',
    priority: 30,
    replace(text) {
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    },
};
