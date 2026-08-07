/**
 * QimenJS Showcase - 应用入口
 *
 * CSS由Vite插件自动按需注入，无需手动导入
 */
import { skeletonCSS, lightTheme, ThemeRegistrar } from '@qimenjs/theme';
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
console.log('[Showcase] CSS由Vite插件自动注入');
const app = document.getElementById('app');
const shell = new ShowcaseApp();
app.appendChild(shell.el);
