import type { BlockRule } from './index';

export const hrRule: BlockRule = {
    name: 'hr',
    priority: 8,
    match(lines, index) {
        const line = lines[index].trim();
        if (/^[-*_]{3,}$/.test(line) && !line.match(/^[-]{3,}.+/)) {
            return {
                token: {
                    type: 'hr',
                    raw: line,
                },
                nextIndex: index + 1,
            };
        }
        return null;
    },
};
