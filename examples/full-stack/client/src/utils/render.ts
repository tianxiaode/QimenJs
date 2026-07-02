/**
 * 简易渲染工具
 * 
 * 不依赖任何框架，直接操作 DOM
 */

/**
 * 渲染到指定容器
 */
export function render(containerId: string, html: string): void {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = html;
    }
}

/**
 * 创建卡片 HTML
 */
export function card(title: string, content: string, color: string = '#333'): string {
    return `
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 8px 0; border-left: 4px solid ${color};">
            <h3 style="margin: 0 0 8px 0; color: ${color};">${title}</h3>
            <div>${content}</div>
        </div>
    `;
}

/**
 * 创建表格 HTML
 */
export function table(headers: string[], rows: any[][]): string {
    const ths = headers.map(h => `<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">${h}</th>`).join('');
    const trs = rows.map(row => {
        const tds = row.map(cell => `<td style="padding: 8px; border: 1px solid #ddd;">${cell ?? '-'}</td>`).join('');
        return `<tr>${tds}</tr>`;
    }).join('');
    return `<table style="border-collapse: collapse; width: 100%;"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}

/**
 * 创建按钮 HTML
 */
export function button(text: string, onClick: string, color: string = '#4CAF50'): string {
    return `<button onclick="${onClick}" style="padding: 8px 16px; background: ${color}; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 4px;">${text}</button>`;
}

/**
 * 创建状态标签
 */
export function badge(text: string, color: string): string {
    return `<span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background: ${color}; color: white;">${text}</span>`;
}

/**
 * 加载中
 */
export function loading(): string {
    return '<div style="text-align: center; padding: 20px; color: #999;">加载中...</div>';
}

/**
 * 错误提示
 */
export function error(message: string): string {
    return `<div style="padding: 12px; background: #ffebee; color: #c62828; border-radius: 4px; margin: 8px 0;">${message}</div>`;
}
