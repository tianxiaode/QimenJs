import { ShowcaseApp } from './ShowcaseApp';
import './register';
import '@/theme/theme.css';
import './showcase.css';
// import { Component } from '@qimenjs/component-core';
// Component.useRadius(false);
const app = document.getElementById('app')!;
const shell = new ShowcaseApp();
app.appendChild(shell.el);
