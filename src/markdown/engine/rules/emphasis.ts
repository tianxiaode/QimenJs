import type { InlineRule } from './index';

export const emphasisRule: InlineRule = {
    name: 'emphasis',
    priority: 50,
    replace(text) {
        let result = text;

        result = result.replace(/(?<!\*)\*\*\*(.+?)\*\*\*(?!\*)/g, '<strong><em>$1</em></strong>');
        result = result.replace(/(?<!\*)\*\*(.+?)\*\*(?!\*)/g, '<strong>$1</strong>');
        result = result.replace(/(?<!\*)\*(.+?)\*(?!\*)/g, '<em>$1</em>');
        result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');
        result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
        result = result.replace(/_(.+?)_/g, '<em>$1</em>');

        return result;
    },
};
