import type { BlockRule } from './index';

export const listRule: BlockRule = {
    name: 'list',
    priority: 30,
    match(lines, index) {
        const line = lines[index];
        const unorderedMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
        const orderedMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);

        if (!unorderedMatch && !orderedMatch) return null;

        const ordered = !!orderedMatch;
        const items: string[] = [];
        let i = index;
        const pattern = ordered ? /^[\s]*\d+\.\s+(.+)$/ : /^[\s]*[-*+]\s+(.+)$/;

        while (i < lines.length) {
            const match = lines[i].match(pattern);
            if (match) {
                items.push(match[1]);
                i++;
            } else if (lines[i].trim() === '') {
                i++;
            } else {
                break;
            }
        }

        if (items.length === 0) return null;

        return {
            token: {
                type: 'list',
                raw: lines.slice(index, i).join('\n'),
                ordered,
                items,
            },
            nextIndex: i,
        };
    },
};
