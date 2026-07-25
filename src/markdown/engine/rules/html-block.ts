import type { BlockRule } from './index';

export const htmlBlockRule: BlockRule = {
    name: 'html_block',
    priority: 15,
    match(lines, index) {
        const line = lines[index];
        if (!line.match(/^<[a-zA-Z][^>]*>/)) return null;

        const tagMatch = line.match(/^<([a-zA-Z]+)/);
        if (!tagMatch) return null;

        const tagName = tagMatch[1].toLowerCase();
        const voidTags = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);
        if (voidTags.has(tagName)) {
            return {
                token: {
                    type: 'html',
                    raw: line,
                    text: line,
                },
                nextIndex: index + 1,
            };
        }

        const closeTag = `</${tagName}>`;
        const htmlLines: string[] = [line];
        let i = index + 1;

        if (line.includes(closeTag)) {
            return {
                token: {
                    type: 'html',
                    raw: line,
                    text: line,
                },
                nextIndex: index + 1,
            };
        }

        while (i < lines.length) {
            htmlLines.push(lines[i]);
            if (lines[i].includes(closeTag)) {
                i++;
                break;
            }
            i++;
        }

        return {
            token: {
                type: 'html',
                raw: htmlLines.join('\n'),
                text: htmlLines.join('\n'),
            },
            nextIndex: i,
        };
    },
};
