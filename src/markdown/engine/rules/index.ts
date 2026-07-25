export interface BlockRule {
    name: string;
    priority?: number;
    match(lines: string[], index: number): { token: BlockToken; nextIndex: number } | null;
}

export interface InlineRule {
    name: string;
    priority?: number;
    replace(text: string): string;
}

export interface BlockToken {
    type: 'heading' | 'paragraph' | 'code_block' | 'blockquote' | 'list' | 'hr' | 'html';
    raw: string;
    text?: string;
    depth?: number;
    lang?: string;
    ordered?: boolean;
    items?: string[];
    children?: BlockToken[];
}

export { headingRule } from './heading';
export { codeBlockRule } from './code';
export { blockquoteRule } from './blockquote';
export { listRule } from './list';
export { hrRule } from './hr';
export { htmlBlockRule } from './html-block';

export { emphasisRule } from './emphasis';
export { inlineCodeRule } from './inline-code';
export { linkRule } from './link';
export { imageRule } from './image';

import { headingRule } from './heading';
import { codeBlockRule } from './code';
import { blockquoteRule } from './blockquote';
import { listRule } from './list';
import { hrRule } from './hr';
import { htmlBlockRule } from './html-block';

import { emphasisRule } from './emphasis';
import { inlineCodeRule } from './inline-code';
import { linkRule } from './link';
import { imageRule } from './image';

export const blockRules: BlockRule[] = [
    codeBlockRule,
    headingRule,
    hrRule,
    blockquoteRule,
    listRule,
    htmlBlockRule,
];

export const inlineRules: InlineRule[] = [inlineCodeRule, imageRule, linkRule, emphasisRule];
