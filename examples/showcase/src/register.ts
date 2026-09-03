/**
 * showcase 组件注册入口
 *
 * component-core 包内组件通过集中注册入口完成注册，
 * component 包内组件按需 import 并显式注册。
 *
 * !! 规则：showcase 新增组件用法时，必须在此文件补充对应注册，
 * 否则 `type: 'xxx'` 无法解析。使用深路径导入，避免全量打包。
 */

// component-core 全部组件集中注册
import '@qimenjs/component-core/register';

// component 包组件按需注册（深路径导入，避免全量打包）
import { ButtonComponent } from '@qimenjs/component';
ButtonComponent.register();
