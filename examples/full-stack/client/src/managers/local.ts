/**
 * 本地域 EntityManager 定义
 *
 * 演示 LocalReadonlyEntityManager 和 LocalCrudEntityManager
 * 纯前端数据管理，不需要后端 API
 */
import { LocalReadonlyEntityManager, LocalCrudEntityManager } from '@orbit-js/entity';
import { NotificationSchema, TagSchema } from '../domains';

/**
 * 本地通知管理器（只读）
 *
 * 能力：list / get（无 create/update/delete）
 * 数据来源：前端初始化时手动添加
 */
export class LocalNotificationManager extends LocalReadonlyEntityManager {
    domain = 'local';
    entityName = 'Notification';
    url = '';
    schema = NotificationSchema;
}

/**
 * 本地标签管理器（CRUD）
 *
 * 能力：list / get / create / update / delete
 * 数据来源：前端初始化时手动添加，支持增删改
 */
export class LocalTagManager extends LocalCrudEntityManager {
    domain = 'local';
    entityName = 'Tag';
    url = '';
    schema = TagSchema;
}
