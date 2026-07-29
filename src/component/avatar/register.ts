import { AvatarComponent } from './AvatarComponent';
import { AVATAR_TPL } from './avatar-tpl';

export function registerAvatarTemplates(): void {
    AvatarComponent.register(AVATAR_TPL);
}