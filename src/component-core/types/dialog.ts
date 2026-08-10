import { IComponentBase } from './component';

/**
 * Dialog 快捷配置
 *
 * 通过 props.dialog 声明式挂载对话框浮层，与 tooltip 模式对称。
 * float 选项（mask/closeOnEscape 等）提取到 FloatDecl，剩余作为 data 传给 DialogComponent。
 *
 * @example
 * ```ts
 * new ButtonComponent({
 *     dialog: {
 *         title: '确认删除',
 *         confirm: true,
 *         cancel: true,
 *     }
 * });
 * // → 自动创建 { type: 'Dialog', trigger: 'manual', placement: 'center', mask: true, data: { title, confirm, cancel } }
 * ```
 */
export type DialogDecl =
    | {
          // ── 内容 ──
          title?: string;
          icon?: string;
          subtitle?: string;
          toolsLeft?: Record<string, any>;
          toolsRight?: Record<string, any>;

          // ── 底部按钮 ──
          confirm?: boolean | { order?: number; text?: string };
          cancel?: boolean | { order?: number; text?: string };
          ok?: boolean | { order?: number; text?: string };
          save?: boolean | { order?: number; text?: string };
          close?: boolean | { order?: number; text?: string };
          apply?: boolean | { order?: number; text?: string };
          reset?: boolean | { order?: number; text?: string };
          footerItems?: Record<string, any>[];

          // ── 尺寸 ──
          width?: string;
          resizable?: boolean;

          // ── Float 选项（提取到 FloatDecl，不进 data）──
          mask?: boolean | string;
          closeOnEscape?: boolean;
          closeOnClickOutside?: boolean;
          emits?: Record<string, string>;
      }
    | IComponentBase;
