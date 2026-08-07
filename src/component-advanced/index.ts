/**
 * @qimenjs/component-advanced
 *
 * 高级UI组件 - 不常用组件集合
 */

// Step 步骤条
export {
    StepComponent,
    type StepStatus,
    type StepItemProps,
    type StepProps,
} from './step/StepComponent';
export { StepItemComponent } from './step/StepItemComponent';
export { stepCSS } from './step/step.css';

// Timeline 时间线
export {
    TimelineComponent,
    type TimelineColor,
    type TimelineItem,
    type TimelineProps,
} from './timeline/TimelineComponent';
export { TimelineItemComponent, type TimelineItemProps } from './timeline/TimelineItemComponent';
export { timelineCSS } from './timeline/timeline.css';

// Rating 评分
export { RatingComponent, type RatingProps } from './rating/RatingComponent';
export { ratingCSS } from './rating/rating.css';

// PropertyGrid 属性网格
export {
    PropertyGridComponent,
    type PropertyGridProps,
} from './property-grid/PropertyGridComponent';
export { PropertyFieldComponent, type PropertyField } from './property-grid/PropertyFieldComponent';
export { propertyGridCSS } from './property-grid/property-grid.css';

// OneTimePassword 一次性密码
export {
    OneTimePasswordComponent,
    ONE_TIME_PASSWORD_TPL,
    type OneTimePasswordProps,
    type OneTimePasswordComponentInstance,
} from './one-time-password';
export { oneTimePasswordCSS } from './one-time-password/one-time-password.css';
