import type { BlockRule, BlockToken } from './index';

export const blockquoteRule: BlockRule = {
    name: 'blockquote',
    priority: 20,
    match(lines, index) {
        if (!lines[index].startsWith('>')) return null;

        const quoteLines: string[] = [];
        let i = index;

        while (i < lines.length && lines[i].startsWith('>')) {
            quoteLines.push(lines[i].replace(/^>\s?/, ''));
            i++;
        }

        return {
            token: {
                type: 'blockquote',
                raw: lines.slice(index, i).join('\n'),
                children: parseSubTokens(quoteLines.join('\n')),
            },
            nextIndex: i,
        };
    },
};

function parseSubTokens(src: string): BlockToken[] {
    const tokens: BlockToken[] = [];
    const lines = src.split('\n');
    let i = 0;

    while (i < lines.length) {
        const paraLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
            paraLines.push(lines[i]);
            i++;
        }
        if (paraLines.length > 0) {
            tokens.push({
                type: 'paragraph',
                raw: paraLines.join('\n'),
                text: paraLines.join('\n'),
            });
        } else {
            i++;
        }
    }

    return tokens;
}
