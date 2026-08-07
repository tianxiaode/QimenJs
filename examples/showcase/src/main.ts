/**
 * QimenJS Showcase - 应用入口
 *
 * CSS由Vite插件自动按需注入，无需手动导入
 */

import { skeletonCSS, lightThemeCSS, darkThemeCSS } from '@qimenjs/theme';
import './styles/showcase.css';
import { ShowcaseApp } from './ShowcaseApp';

/** 注入骨架屏样式（框架必须） */
const skeletonStyle = document.createElement('style');
skeletonStyle.textContent = skeletonCSS;
document.head.appendChild(skeletonStyle);

/** 注入亮色主题 CSS 变量（默认主题） */
const lightThemeStyle = document.createElement('style');
lightThemeStyle.textContent = lightThemeCSS;
lightThemeStyle.setAttribute('data-theme', 'light');
document.head.appendChild(lightThemeStyle);

/** 注入暗色主题 CSS 变量（通过 .dark 类激活） */
const darkThemeStyle = document.createElement('style');
darkThemeStyle.textContent = `:root.dark {\n${darkThemeCSS.slice(6)}\n}`;
darkThemeStyle.setAttribute('data-theme', 'dark');
darkThemeStyle.media = '(prefers-color-scheme: dark)';
document.head.appendChild(darkThemeStyle);

/** 从 localStorage 读取主题偏好 */
const savedTheme = localStorage.getItem('qimenjs-theme');
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
} else {
    /** 跟随系统主题 */
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
}

console.log('[Showcase] CSS由Vite插件自动注入');

const app = document.getElementById('app')!;
const shell = new ShowcaseApp();
app.appendChild(shell.el);
