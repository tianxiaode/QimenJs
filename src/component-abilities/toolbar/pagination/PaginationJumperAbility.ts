/**
 * PaginationJumperAbility 分页页码输入框能力
 *
 * 渲染页码输入框，支持直接输入页码跳转。
 * 新增能力，从 PaginationAbility 扩展而来。
 *
 * 功能：
 * - 输入框类型为 number，min=1, max=totalPages
 * - Enter 键或失焦时校验并跳转
 * - 非法值恢复为当前页码
 * - 受 showJumper 配置控制，默认 false
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { PAGINATION_POSITIONS } from './pagination-positions';

export const PaginationJumperAbility: AbilityDefinition = {
    /**
     * 渲染页码输入框到 DocumentFragment
     */
    renderPaginationJumper(frag: DocumentFragment): void {
        if (!this.showJumper) return;

        const container = document.createElement('span');
        container.className = 'q-pagination__jumper';
        container.setAttribute('data-pagination', 'jumper');
        container.setAttribute('data-position', String(PAGINATION_POSITIONS.JUMPER));

        // "前往" 文本
        const prefix = document.createElement('span');
        prefix.className = 'q-pagination__jumper-prefix';
        prefix.textContent = '前往';
        container.appendChild(prefix);

        // 输入框
        const input = document.createElement('input');
        input.className = 'q-pagination__jumper-input';
        input.type = 'number';
        input.min = '1';
        input.max = String(this.totalPages);
        input.value = String(this.currentPage);
        container.appendChild(input);

        // "页" 文本
        const suffix = document.createElement('span');
        suffix.className = 'q-pagination__jumper-suffix';
        suffix.textContent = '页';
        container.appendChild(suffix);

        // 跳转处理
        const handleJump = () => {
            const value = parseInt(input.value, 10);
            if (isNaN(value) || value < 1 || value > this.totalPages) {
                // 非法值恢复为当前页码
                input.value = String(this.currentPage);
                return;
            }
            this.gotoPage(value);
        };

        input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleJump();
            }
        });

        input.addEventListener('blur', () => {
            handleJump();
        });

        frag.appendChild(container);
    },
};
