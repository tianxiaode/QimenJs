/**
 * RouteNavComponent — 路由导航组件
 *
 * 继承 NavItemGroupComponent + RouteEventBusAbility，
 * 导航选中通过 select 事件触发 routeEmit switch，
 * 路由变化通过 routeOn 监听 change 事件自动切换高亮。
 */

import { NavItemGroupComponent } from './NavItemGroupComponent';
import { RouteEventBusAbility } from '@qimenjs/system-abilities';
import { EventContextBuilder } from '@qimenjs/context';

export interface RouteNavProps {
    direction?: 'horizontal' | 'vertical';
    gap?: string;
    cls?: string;
    itemsCls?: string;
    activeIndex?: number;
    pathIndex?: Record<string, number>;
    indexPath?: string[];
    items?: Record<string, any>[];
}

const RouteNavBase = (NavItemGroupComponent as any).with([RouteEventBusAbility]);

export let RouteNavComponent = class extends RouteNavBase {
    private _pathIndex: Record<string, number> = {};
    private _indexPath: string[] = [];
    private _lastNavigatedPath: string | null = null;

    constructor(props?: RouteNavProps) {
        super(props);

        this.type = 'RouteNav';

        this.logger.debug('[RouteNav] constructor, props =', props);

        if (props?.pathIndex) this._pathIndex = props.pathIndex;
        if (props?.indexPath) this._indexPath = props.indexPath;

        this.on('select', (data: any) => {
            this.onNavSelect(data);
        });

        const off = this.routeOn('router', 'change', (data: any) => {
            this.onRouteChange(data);
        });
        this.onCleanup(off);
    }

    onNavSelect(data: any): void {
        const index = data?.index ?? this.activeIndex;
        const path = this._indexPath[index];
        this.logger.debug(
            '[RouteNav] onNavSelect, index =',
            index,
            'path =',
            path,
            '_indexPath =',
            this._indexPath
        );
        if (!path) return;

        this.selectAt(index);
        this._lastNavigatedPath = path;

        this.routeEmit(
            EventContextBuilder.create()
                .withEvent('switch')
                .withType('switch')
                .withSource('router')
                .withData({ path })
                .build()
        );
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        this.logger.debug(
            '[RouteNav] onRouteChange, path =',
            path,
            '_lastNavigatedPath =',
            this._lastNavigatedPath
        );
        if (path) {
            if (path === this._lastNavigatedPath) {
                this.logger.debug('[RouteNav] onRouteChange skipped, same as last navigated path');
                const index = this._pathIndex[path];
                if (index !== undefined) this.selectAt(index);
                return;
            }
            const index = this._pathIndex[path];
            if (index !== undefined) this.selectAt(index);
        }
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        if (props?.pathIndex !== undefined) this._pathIndex = props.pathIndex;
        if (props?.indexPath !== undefined) this._indexPath = props.indexPath;
    }
};

export type RouteNavComponent = InstanceType<typeof RouteNavComponent>;
