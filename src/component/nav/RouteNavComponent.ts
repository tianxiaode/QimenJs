/**
 * RouteNavComponent — 路由导航组件
 *
 * 继承 NavItemGroupComponent + RouteEmitAbility + RouteListenAbility，
 * 导航点击自动发路由，路由变化自动切换高亮。
 */

import { NavItemGroupComponent } from './NavItemGroupComponent';
import { RouteAbility, RouteEmitAbility, RouteListenAbility } from '@qimenjs/router';

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

const RouteNavBase = (NavItemGroupComponent as any).with([RouteAbility, RouteEmitAbility, RouteListenAbility]);

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
    }

    protected onForwardEvent(event: string, data: Record<string, any>): void {
        if (event === 'click') {
            this.onNavClick(data);
        } else {
            super.onForwardEvent(event, data);
        }
    }

    onNavClick(data: any): void {
        const index = data?.index ?? this.activeIndex;
        const path = this._indexPath[index];
        this.logger.debug('[RouteNav] onNavClick, index =', index, 'path =', path, '_indexPath =', this._indexPath);
        if (!path) return;

        this.selectAt(index);
        this._lastNavigatedPath = path;
        this.navigate(path);
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        this.logger.debug('[RouteNav] onRouteChange, path =', path, '_lastNavigatedPath =', this._lastNavigatedPath);
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
