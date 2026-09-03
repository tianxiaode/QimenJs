/**
 * component-core 组件集中注册入口
 *
 * 显式 import 并注册 component-core 包内所有组件，
 * 确保字符串 type 可被 ComponentRegistrar 解析。
 *
 * 使用方只需 `import '@qimenjs/component-core/register'` 即可完成全部注册。
 */

import { Component } from './Component';
import { FloatingComponent } from './overlay';
import { Toast } from './imperative';
import { Msgbox } from './imperative';
import { LoadingComponent } from './loading';
import { TooltipComponent } from './tooltip';

Component.register();
FloatingComponent.register();
Toast.register();
Msgbox.register();
LoadingComponent.register();
TooltipComponent.register();
