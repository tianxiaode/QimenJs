import type { BlockRule, BlockToken } from './index';

export const codeBlockRule: BlockRule = {
    name: 'code_block',
    priority: 5,
    match(lines, index) {
        const line = lines[index];
        const fenceMatch = line.match(/^```(\w*)/);
        if (!fenceMatch) return null;

        const lang = fenceMatch[1] || '';
        const codeLines: string[] = [];
        let i = index + 1;

        while (i < lines.length && !lines[i].startsWith('```')) {
            codeLines.push(lines[i]);
            i++;
        }

        if (i < lines.length) i++;

        return {
            token: {
                type: 'code_block',
                raw: lines.slice(index, i).join('\n'),
                text: codeLines.join('\n'),
                lang,
            },
            nextIndex: i,
        };
    },
};
