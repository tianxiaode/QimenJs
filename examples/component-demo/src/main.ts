/**
 * QimenJS Component Demo - 应用入口
 *
 * 负责初始化：
 * 1. 注册所有组件
 * 2. 初始化路由系统
 * 3. 挂载 AppShell 到 #app
 */

import '@qimenjs/component';
import { Router, type RouteMap } from '@qimenjs/router';
import { systemEventBus, SYSTEM_EVENTS } from '@qimenjs/events';
import { EventContextBuilder } from '@qimenjs/context';

import './styles.css';
import { AppShell } from './AppShell';

const router = Router.getInstance();

const routes: RouteMap = {
    '/': 'home',
    '/components': 'components',
    '/templates': 'templates',
    '/login': 'login',
};

router.register(routes);
router.start(true);

const app = document.getElementById('app')!;
const shell = new AppShell();

app.appendChild(shell.el);

systemEventBus.emit(
    SYSTEM_EVENTS.APP_READY,
    EventContextBuilder.create()
        .withEvent(SYSTEM_EVENTS.APP_READY)
        .withType(SYSTEM_EVENTS.APP_READY)
        .withSource('app')
        .withData({ time: Date.now() })
        .build()
);
