import { Ability } from '@qimenjs/component-core';
import type { DomEventDecl } from '@qimenjs/component-core';
import { getId } from '@/utils/string/id';
import type { DefaultItemConfig, OverflowMode } from './ItemGroupComponent';

/**
 * ItemGroupAbility 项组能力
 * 
 * 提供项组的公共功能，包括：
 * - 项组初始化
 * - 项组样式应用
 * - 项组溢出模式处理
 * - 项组DOM操作
 */
export class ItemGroupAbility extends Ability {
  protected _visibleNames: string[] = [];
  protected _hiddenNames: string[] = [];
  protected _direction: 'horizontal' | 'vertical' = 'horizontal';
  protected _itemType = '';
  protected _gap = '';
  protected _containerEl: HTMLElement | null = null;
  protected _defaultItem: DefaultItemConfig = {};
  protected _itemDestroy = true;
  protected _overflowMode: OverflowMode = 'none';

  /**
   * 初始化项组组件
   */
  initItemGroup(props?: any): void {
    if (props?.cls) {
      this.addCls(props.cls);
    }

    if (props?.itemsCls && this._containerEl) {
      this.itemContainer.addCls(props.itemsCls);
    }

    if (props?.direction) this.direction = props.direction;
    if (props?.gap) this.gap = props.gap;
    if (props?.itemType) this.itemType = props.itemType;
    if (props?.overflowMode) this.overflowMode = props.overflowMode;

    if (props?.defaultItem) this._defaultItem = props.defaultItem;
    if (props?.itemDestroy !== undefined) this._itemDestroy = props.itemDestroy;

    this._applyDirection();
    this._applyGap();

    if (props?.items?.length) {
      this.setItems(props.items);
    }

    if (this._overflowMode !== 'none') {
      this._applyOverflowMode();
    }
  }

  /**
   * 应用方向样式
   */
  protected _applyDirection(): void {
    this.el.classList.remove('q-itemgroup--horizontal', 'q-itemgroup--vertical');
    this.el.classList.add(`q-itemgroup--${this._direction}`);
  }

  /**
   * 应用间距样式
   */
  protected _applyGap(): void {
    if (this._containerEl) this._containerEl.style.gap = this._gap || '';
  }

  /**
   * 应用溢出模式
   */
  protected _applyOverflowMode(): void {
    if (this._overflowMode === 'none') return;
    this.overflowConfig = {
      type: this._overflowMode as 'scroll' | 'menu',
      direction: this._direction as 'horizontal' | 'vertical',
    };
  }

  /**
   * 清理溢出模式
   */
  protected _cleanupOverflow(): void {
    this.overflowConfig = undefined;
    if (this._containerEl) {
      for (const child of Array.from(this._containerEl.children) as HTMLElement[]) {
        child.hidden = false;
      }
    }
    this.el.classList.remove(
      'q-overflow-scroll',
      'q-overflow-scroll--horizontal',
      'q-overflow-scroll--vertical',
      'q-overflow-scroll--can-prev',
      'q-overflow-scroll--can-next',
      'q-overflow-scroll--overflowing',
      'q-overflow-menu-container',
      'q-overflow-menu-container--horizontal',
      'q-overflow-menu-container--vertical',
      'q-overflow-menu-container--overflowing'
    );
    if (this._containerEl)
      this._containerEl.classList.remove(
        'q-overflow-scroll__area',
        'q-overflow-menu__visible'
      );
  }

  /**
   * 获取可见项
   */
  get items(): readonly any[] {
    return this._visibleNames
      .map((name: string) => this.nodeMap[name]?.component)
      .filter(Boolean);
  }

  /**
   * 获取项数量
   */
  get count(): number {
    return this._visibleNames.length;
  }

  /**
   * 获取方向
   */
  get direction(): 'horizontal' | 'vertical' {
    return this._direction;
  }

  /**
   * 设置方向
   */
  set direction(value: 'horizontal' | 'vertical') {
    this._direction = value;
    this._applyDirection();
  }

  /**
   * 获取项类型
   */
  get itemType(): string {
    return this._itemType;
  }

  /**
   * 设置项类型
   */
  set itemType(value: string) {
    this._itemType = value;
  }

  /**
   * 获取间距
   */
  get gap(): string {
    return this._gap;
  }

  /**
   * 设置间距
   */
  set gap(value: string) {
    this._gap = value;
    this._applyGap();
  }

  /**
   * 获取默认项配置
   */
  get defaultItem(): DefaultItemConfig {
    return this._defaultItem;
  }

  /**
   * 获取是否销毁项
   */
  get itemDestroy(): boolean {
    return this._itemDestroy;
  }

  /**
   * 获取溢出模式
   */
  get overflowMode(): OverflowMode {
    return this._overflowMode;
  }

  /**
   * 设置溢出模式
   */
  set overflowMode(value: OverflowMode) {
    this._overflowMode = value;
    this._applyOverflowMode();
  }

  /**
   * 设置项数据
   */
  setItems(datas: Record<string, any>[]): void {
    for (let i = 0; i < datas.length; i++) {
      if (i < this._visibleNames.length) {
        const name = this._visibleNames[i];
        const component = this.nodeMap[name]?.component;
        if (component && typeof component.update === 'function') {
          component.update(datas[i]);
        }
        const el = this.nodeMap[name]?.el;
        if (el) el.hidden = false;
      } else {
        this._createAndRegister(datas[i]);
      }
    }

    if (this._itemDestroy) {
      for (let i = datas.length; i < this._visibleNames.length; i++) {
        const name = this._visibleNames[i];
        this._destroyItem(name);
      }
      this._visibleNames.length = datas.length;
    } else {
      for (let i = datas.length; i < this._visibleNames.length; i++) {
        const name = this._visibleNames[i];
        const el = this.nodeMap[name]?.el;
        if (el) el.hidden = true;
        this._hiddenNames.push(name);
      }
      this._visibleNames.length = datas.length;
    }
  }

  /**
   * 添加项
   */
  add(data: Record<string, any>): any {
    const name = this._createAndRegister(data);
    return name ? this.nodeMap[name]?.component : null;
  }

  /**
   * 在指定位置插入项
   */
  insert(index: number, data: Record<string, any>): any {
    const clampedIndex = Math.min(Math.max(0, index), this._visibleNames.length);
    const name = this._createAndRegister(data);
    if (!name) return null;

    this._visibleNames.splice(clampedIndex, 1);
    this._visibleNames.splice(clampedIndex, 0, name);
    this._insertDOMAt(clampedIndex, this.nodeMap[name]?.el);
    return this.nodeMap[name]?.component;
  }

  /**
   * 移除指定位置的项
   */
  removeAt(index: number): any {
    if (index < 0 || index >= this._visibleNames.length) return undefined;
    const name = this._visibleNames[index];
    const component = this.nodeMap[name]?.component;
    this._visibleNames.splice(index, 1);

    if (this._itemDestroy) {
      this._destroyItem(name);
    } else {
      const el = this.nodeMap[name]?.el;
      if (el) el.hidden = true;
      this._hiddenNames.push(name);
    }
    return component;
  }

  /**
   * 更新指定位置的项
   */
  updateAt(index: number, data: Record<string, any>): void {
    if (index < 0 || index >= this._visibleNames.length) return;
    const name = this._visibleNames[index];
    const component = this.nodeMap[name]?.component;
    if (component && typeof component.update === 'function') component.update(data);
  }

  /**
   * 清空所有项
   */
  clear(): void {
    for (const name of this._visibleNames) {
      if (this._itemDestroy) {
        this._destroyItem(name);
      } else {
        const el = this.nodeMap[name]?.el;
        if (el) el.hidden = true;
        this._hiddenNames.push(name);
      }
    }
    this._visibleNames.length = 0;

    if (this._itemDestroy) {
      for (const name of this._hiddenNames) {
        this._destroyItem(name);
      }
      this._hiddenNames.length = 0;
    }
  }

  /**
   * 获取项的索引
   */
  indexOf(instance: any): number {
    for (let i = 0; i < this._visibleNames.length; i++) {
      if (this.nodeMap[this._visibleNames[i]]?.component === instance) return i;
    }
    return -1;
  }

  /**
   * 获取指定位置的项
   */
  getAt(index: number): any {
    if (index < 0 || index >= this._visibleNames.length) return null;
    return this.nodeMap[this._visibleNames[index]]?.component;
  }

  /**
   * 排序项
   */
  sort(compareFn?: (a: any, b: any) => number): void {
    const defaultCompare = (nameA: string, nameB: string): number => {
      const a = this.nodeMap[nameA]?.component;
      const b = this.nodeMap[nameB]?.component;
      const orderA = a?.order ?? a?.props?.order ?? 0;
      const orderB = b?.order ?? b?.props?.order ?? 0;
      return orderA - orderB;
    };
    this._visibleNames.sort(
      compareFn
        ? (a: string, b: string) => {
            const compA = this.nodeMap[a]?.component;
            const compB = this.nodeMap[b]?.component;
            return compareFn(compA, compB);
          }
        : defaultCompare
    );
    this._flushDOMOrder();
  }

  /**
   * 移动项
   */
  move(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this._visibleNames.length) return;
    if (toIndex < 0 || toIndex >= this._visibleNames.length) return;
    if (fromIndex === toIndex) return;
    const [name] = this._visibleNames.splice(fromIndex, 1);
    this._visibleNames.splice(toIndex, 0, name);
    this._flushDOMOrder();
  }

  /**
   * 创建并注册项
   */
  protected _createAndRegister(data: Record<string, any>): string | null {
    const itemType = data.type ?? this._itemType;
    if (!itemType) return null;

    const ItemClass = this.getComponentRegistrar().get(itemType);
    if (!ItemClass) return null;

    const mergedEvents = this._mergeEvents(data, itemType);
    const name = data.name ?? getId('item');
    const props = { ...data };
    delete props.name;
    delete props.events;

    const instance = new ItemClass(props);

    this.nodeMap[name] = {
      name,
      el: instance.el,
      component: instance,
      events: mergedEvents,
    };

    this._mountItem(instance);

    if (mergedEvents && Object.keys(mergedEvents).length > 0) {
      this._bindItemNodeEvents(name);
    }

    this._visibleNames.push(name);
    return name;
  }

  /**
   * 合并事件
   */
  protected _mergeEvents(
    data: Record<string, any>,
    itemType: string
  ): Record<string, DomEventDecl> | undefined {
    const itemEvents = data.events as Record<string, DomEventDecl> | undefined;
    const defaultDef = this._defaultItem[itemType];
    if (!defaultDef?.events && !itemEvents) return undefined;
    if (!defaultDef?.events) return itemEvents;
    if (!itemEvents) return defaultDef.events;

    const merged: Record<string, DomEventDecl> = { ...defaultDef.events };
    for (const [event, decl] of Object.entries(itemEvents)) {
      if (merged[event]) {
        merged[event] = { ...merged[event], ...decl };
      } else {
        merged[event] = decl;
      }
    }
    return merged;
  }

  /**
   * 绑定项节点事件
   */
  protected _bindItemNodeEvents(name: string): void {
    const node = this.nodeMap[name];
    if (!node?.component || !node.events) return;

    for (const [domEvent, decl] of Object.entries(node.events)) {
      if (typeof this._bindComponentEvent === 'function') {
        this._bindComponentEvent(node.component, name, domEvent, decl);
      }
    }
  }

  /**
   * 解绑项节点事件
   */
  protected _unbindItemNodeEvents(name: string): void {
    const node = this.nodeMap[name];
    if (!node?.component) return;

    if (typeof this.onCleanup === 'function') {
      const unsubKey = `_itemUnsub_${name}`;
      const unsub = (this as any)[unsubKey];
      if (typeof unsub === 'function') {
        unsub();
        delete (this as any)[unsubKey];
      }
    }
  }

  /**
   * 销毁项
   */
  protected _destroyItem(name: string): void {
    this._unbindItemNodeEvents(name);
    const node = this.nodeMap[name];
    if (node?.component) {
      this._unmountItem(node.component);
    }
    delete this.nodeMap[name];
  }

  /**
   * 挂载项
   */
  protected _mountItem(instance: any): void {
    if (this._containerEl && instance?.el) this._containerEl.appendChild(instance.el);
  }

  /**
   * 卸载项
   */
  protected _unmountItem(instance: any): void {
    if (instance?.el) instance.el.remove();
    if (typeof instance?.dispose === 'function') instance.dispose();
  }

  /**
   * 在指定位置插入DOM
   */
  protected _insertDOMAt(index: number, el?: HTMLElement): void {
    if (!this._containerEl || !el) return;
    const refNode = this._containerEl.children[index];
    if (refNode) this._containerEl.insertBefore(el, refNode);
    else this._containerEl.appendChild(el);
  }

  /**
   * 刷新DOM顺序
   */
  protected _flushDOMOrder(): void {
    if (!this._containerEl) return;
    const fragment = document.createDocumentFragment();
    for (const name of this._visibleNames) {
      const el = this.nodeMap[name]?.el;
      if (el) fragment.appendChild(el);
    }
    this._containerEl.appendChild(fragment);
  }

  /**
   * 更新项组
   */
  update(props?: Record<string, any>): void {
    if (props?.direction !== undefined) {
      this._direction = props.direction;
      this._applyDirection();
    }
    if (props?.gap !== undefined) {
      this._gap = props.gap;
      this._applyGap();
    }
    if (props?.itemType !== undefined) this._itemType = props.itemType;
    if (props?.overflowMode !== undefined) {
      this._overflowMode = props.overflowMode;
      this._applyOverflowMode();
    }
    if (typeof this.onUpdated === 'function') this.onUpdated(props);
  }

  /**
   * 销毁前处理
   */
  onBeforeDispose(): void {
    this._cleanupOverflow();
    this.clear();
  }
}
