import type { InlineRule } from './index';

export const imageRule: InlineRule = {
    name: 'image',
    priority: 20,
    replace(text) {
        return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    },
};
