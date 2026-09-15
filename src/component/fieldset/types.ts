import type { ComponentClass, TemplateDecl } from '@/component-core';

/**
 * 字段集内容区内容
 *
 * - string：HTML 字符串，直接注入节点
 * - 组件类：实例化后挂载到节点，随字段集销毁
 * - TemplateDecl：以临时插槽组件承载（走完整组件初始化流程），
 *   el 即 decl 根节点无额外包裹；内嵌组件节点必须带 name
 */
export type FieldsetContent = string | ComponentClass | TemplateDecl;
