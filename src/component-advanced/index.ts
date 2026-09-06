/**
 * @qimenjs/component-advanced
 *
 * 高级UI组件 - 不常用组件集合
 */

// Step 步骤条
export { StepComponent, type StepStatus } from './step/StepComponent';
export { StepItemComponent } from './step/StepItemComponent';

// Timeline 时间线
export {
    TimelineComponent,
    type TimelineColor,
    type TimelineItem,
} from './timeline/TimelineComponent';
export { TimelineItemComponent } from './timeline/TimelineItemComponent';

// Rating 评分
export { RatingComponent } from './rating/RatingComponent';

// PropertyGrid 属性网格
export { PropertyGridComponent } from './property-grid/PropertyGridComponent';
export { PropertyFieldComponent, type PropertyField } from './property-grid/PropertyFieldComponent';

// OneTimePassword 一次性密码
export {
    OneTimePasswordComponent,
    ONE_TIME_PASSWORD_TPL,
    type OneTimePasswordComponentInstance,
} from './one-time-password';