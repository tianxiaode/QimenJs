/**
 * TextCellComponent 文本单元格组件
 *
 * 在 BaseCell 基础上增加格式化支持。
 * format 通过 initConfig 编译时传入，运行时 update() 内应用。
 * 继承父类模板（content 占位节点），仅扩展格式化逻辑。
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
import type { BaseCellProps } from './BaseCellComponent';
import type { ColumnFormat, TextCellData } from '../column-types';

/** 文本单元格属性接口 */
export interface TextCellProps extends BaseCellProps {
    format?: ColumnFormat;
}

class TextCellComponent extends BaseCellComponent {
    _format: ColumnFormat | undefined = undefined;

    onAfterInit(props?: TextCellProps): void {
        super.onAfterInit(props);
        if (props?.format) this._format = props.format;
    }

    get format(): ColumnFormat | undefined {
        return this._format;
    }
    set format(v: ColumnFormat | undefined) {
        this._format = v;
    }

    update(data: TextCellData): void {
        const raw = data.value;
        const display = this._formatValue(raw);
        this.setNodeProp('text', display, 'content');
    }

    _formatValue(value: any): string {
        if (this._format === undefined) return String(value ?? '');
        if (typeof this._format === 'function') return this._format(value, undefined);
        return this._applyFormatPreset(value, this._format);
    }

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
    }
}

export { TextCellComponent };
/** 文本单元格实例类型 */
export type TextCellComponentInstance = InstanceType<typeof TextCellComponent>;
