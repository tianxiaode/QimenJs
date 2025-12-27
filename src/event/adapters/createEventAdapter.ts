import { EventAdapter } from './base/EventAdapter';
import { DomEventAdapter } from './dom/DomEventAdapter';

export function createEventAdapter(): EventAdapter {
  // 现在只有 DOM，将来可扩展
  return new DomEventAdapter();
}
