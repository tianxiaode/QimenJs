import { ShowcaseApp } from './ShowcaseApp';
import { LoadingComponent, TooltipComponent } from '@qimenjs/component-core';
import '@/theme/light.css';
import '@/theme/skeleton.css';
import '@/theme/layout.css';
import '@/theme/utility.css';
const app = document.getElementById('app')!;
const shell = new ShowcaseApp();
app.appendChild(shell.el);
