/**
 * QimenJS Showcase - 应用入口
 */

import '@qimenjs/component';
import { skeletonCSS, lightTheme, ThemeRegistrar } from '@qimenjs/theme';
import {
    heroCSS,
    navbarCSS,
    buttonCSS,
    toggleIconCSS,
    spacerCSS,
    navCSS,
    alertCSS,
    badgeCSS,
    cardCSS,
    avatarCSS,
    tagCSS,
    tabsCSS,
    progressCSS,
    dividerCSS,
    accordionCSS,
    tooltipCSS,
    breadcrumbCSS,
    indicatorCSS,
    labelCSS,
    ratingCSS,
    fieldsetCSS,
    stepCSS,
    timelineCSS,
    iconCSS,
    hrefCSS,
    toggleCSS,
    buttonGroupCSS,
    tagsCSS,
    panelCSS,
    menuCSS,
    toolbarCSS,
    dialogCSS,
    itemgroupCSS,
    oneTimePasswordCSS,
    uploadButtonCSS,
    markdownEditorCSS,
    markdownViewerCSS,
} from '@qimenjs/component';

import './styles/showcase.css';
import { ShowcaseApp } from './ShowcaseApp';

/** 注入骨架屏样式（框架必须） */
const skeletonStyle = document.createElement('style');
skeletonStyle.textContent = skeletonCSS;
document.head.appendChild(skeletonStyle);

/** 注册并应用 light 主题（提供 CSS 变量） */
const themeRegistrar = ThemeRegistrar.getInstance();
themeRegistrar.register(lightTheme);
themeRegistrar.apply('light');

/** 在组件创建前注入所有组件 CSS */
const cssList = [
    heroCSS,
    navbarCSS,
    buttonCSS,
    toggleIconCSS,
    spacerCSS,
    navCSS,
    alertCSS,
    badgeCSS,
    cardCSS,
    avatarCSS,
    tagCSS,
    tabsCSS,
    progressCSS,
    dividerCSS,
    accordionCSS,
    tooltipCSS,
    breadcrumbCSS,
    indicatorCSS,
    labelCSS,
    ratingCSS,
    fieldsetCSS,
    stepCSS,
    timelineCSS,
    iconCSS,
    hrefCSS,
    toggleCSS,
    buttonGroupCSS,
    tagsCSS,
    panelCSS,
    menuCSS,
    toolbarCSS,
    dialogCSS,
    itemgroupCSS,
    oneTimePasswordCSS,
    uploadButtonCSS,
    markdownEditorCSS,
    markdownViewerCSS,
];
let cssCount = 0;
for (const css of cssList) {
    if (css && typeof css === 'string') {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        cssCount++;
    }
}
console.log(`[Showcase] Injected ${cssCount} component CSS files`);

const app = document.getElementById('app')!;
const shell = new ShowcaseApp();
app.appendChild(shell.el);

shell.ready
    .then(() => {
        console.log('[Showcase] ShowcaseApp ready');
    })
    .catch((err: any) => {
        console.error('[Showcase] ShowcaseApp failed:', err);
    });
