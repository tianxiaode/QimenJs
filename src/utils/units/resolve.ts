import { parseLength } from './parse';
import { toPx } from './length';

export function resolveLengthToPx(input: string | number, element?: HTMLElement): number {
    if (typeof input === 'number') {
        return input;
    }

    const parsed = parseLength(input);
    if (!parsed) {
        throw new Error(`Invalid length: ${input}`);
    }

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

    const fontSize = element ? parseFloat(getComputedStyle(element).fontSize) : rootFontSize;

    const ctx = {
        rootFontSize,
        fontSize,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
    };

    return toPx(parsed, ctx);
}

function resolveByBrowser(value: string, el: HTMLElement): number {
    const div = document.createElement('div');
    div.style.width = value;
    el.appendChild(div);
    const px = div.getBoundingClientRect().width;
    el.removeChild(div);
    return px;
}
