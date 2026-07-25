import type { BlockRule, BlockToken } from './index';

export const headingRule: BlockRule = {
    name: 'heading',
    priority: 10,
    match(lines, index) {
        const line = lines[index];
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (!match) return null;

        const depth = match[1].length;
        const text = match[2].trim();

        return {
            token: {
                type: 'heading',
                raw: line,
                text,
                depth,
            },
            nextIndex: index + 1,
        };
    },
};
