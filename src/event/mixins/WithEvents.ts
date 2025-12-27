import { Constructor, DisposableBase } from '@orbitjs/utils';
import { globalEventBus } from '../core/GlobalEventBus';
import { EventHandler } from '../core/types';
import { BindOptions, createEventAdapter, EventAdapter } from '../adapters';
import { SemanticEvent } from '../semantic';
import { EventScope } from '../core';

export interface  WithEventsPublic  {
  on(event: string, handler: EventHandler): () => void;
  once(event: string, handler: EventHandler): void;
  emit(event: string, payload?: any): void;
  bind(
    target: any,
    semantic: SemanticEvent,
    options?: BindOptions
  ): void;
}

export function WithEvents<TBase extends Constructor>(Base: TBase): Constructor<InstanceType<TBase> & WithEventsPublic>  {
  return class extends Base {
    // ✅ 使用 Symbol 作为私有属性键
    private readonly [_eventScope] = globalEventBus.createEventScope();
    private readonly [_adapter] = createEventAdapter();

    private get scope() {
        if(this._eventScope === undefined){
            this._eventScope = globalEventBus.createEventScope();
        }
        return this._eventScope;
    }
    
    private  get adapter() {
        if(this._adapter === undefined){
            this._adapter = createEventAdapter();
        }
        return this._adapter;
    }


    on(event: string, handler: EventHandler): () => void {
      return this.scope.on(event, handler);
    }

    once(event: string, handler: EventHandler) {
      return this.scope.once(event, handler);
    }

    emit(event: string, payload?: any) {
      this.scope.emit(event, payload);
    }

    bind(
      target: any,
      semantic: SemanticEvent,
      options?: BindOptions
    ): void {
      this.adapter.bind(target, semantic, this.scope, options);
    }
    
    dispose() {
      super.dispose?.();
      this.scope.dispose();
    }
  };
}