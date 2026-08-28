import { skeletonCSS } from '@qimenjs/theme';
import { ShowcaseApp } from './ShowcaseApp';
import { lightThemeCSS, darkThemeCSS } from '@qimenjs/theme';
import { LoadingComponent, TooltipComponent } from '@qimenjs/component-core';
const skeletonStyle = document.createElement('style');
skeletonStyle.textContent = skeletonCSS;
document.head.appendChild(skeletonStyle);

const app = document.getElementById('app')!;
const shell = new ShowcaseApp();
app.appendChild(shell.el);
