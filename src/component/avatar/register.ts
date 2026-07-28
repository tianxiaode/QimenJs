/**
 * Avatar 模板注册
 */

import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { AVATAR_TPL } from './avatar-tpl';

export function registerAvatarTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Avatar', AVATAR_TPL);
}
