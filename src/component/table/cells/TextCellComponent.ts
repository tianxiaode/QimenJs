/**
 * TextCellComponent 文本单元格组件
 *
 * 在 BaseCell 基础上增加格式化支持。
 * format 通过 initConfig 编译时传入，运行时 update() 内应用。
 *
 * @example
 * ```ts
 * // 纯文本
 * const cell = new TextCellComponent({ align: 'left' });
 * cell.update({ value: '张三' });
 *
 * // 格式化数字
 * const cell = new TextCellComponent({ align: 'right', format: 'currency' });
 * cell.update({ value: 12345.67 });  // → ¥12,345.67
 *
 * // 自定义格式化
 * const cell = new TextCellComponent({ format: (v) => v ? '是' : '否' });
 * cell.update({ value: true });  // → 是
 * ```
 */

import { BaseCellComponent } from './BaseCellComponent';
import type { ColumnAlign, ColumnFormat, TextCellData } from '../column-types';

export interface TextCellProps {
    align?: ColumnAlign;
    format?: ColumnFormat;
}

export let TextCellComponent = BaseCellComponent.replace({
    type: 'TextCell',

    body: {
        onInitState() {
            return {
                _format: undefined as ColumnFormat | undefined,
            };
        },

        onAfterInit(props?: TextCellProps): void {
            const self = this as any;
            if (props?.format) self._format = props.format;
        },

        get format(): ColumnFormat | undefined {
            const self = this as any;
            return self._format;
        },
        set format(v: ColumnFormat | undefined) {
            const self = this as any;
            self._format = v;
        },

        update(data: TextCellData): void {
            const self = this as any;
            const raw = data.value;
            const display = self._formatValue(raw);
            self.setNodeProp('text', display, 'content');
        },

        _formatValue(value: any): string {
            const self = this as any;
            if (self._format === undefined) return String(value ?? '');
            if (typeof self._format === 'function') return self._format(value);
            return self._applyFormatPreset(value, self._format);
        },

        _applyFormatPreset(value: any, preset: string): string {
            if (value == null) return '';
            switch (preset) {
                case 'number':
                    return Number(value).toLocaleString();
                case 'integer':
                    return Math.round(Number(value)).toLocaleString();
                case 'currency':
                    return Number(value).toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'CNY',
                    });
                case 'percent':
                    return `${Number(value).toLocaleString()}%`;
                case 'date':
                    return new Date(value).toLocaleDateString();
                default:
                    return String(value);
            }
        },
    },
});

export type TextCellComponent = InstanceType<typeof TextCellComponent>;
