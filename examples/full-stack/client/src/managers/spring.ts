/**
 * Spring 域 EntityManager 定义
 *
 * 基于 RemoteCrudEntityManager 和 RemoteReadonlyEntityManager，连接 Spring 后端
 */
import { RemoteCrudEntityManager, RemoteReadonlyEntityManager } from '@qimenjs/entity';
import { OrderSchema, ItemSchema } from '../domains';

/**
 * Spring 订单管理器（CRUD）
 *
 * 能力：list / getAll / get / query / create / update / delete / toggle
 * 接口：GET /api/orders
 */
export class SpringOrderManager extends RemoteCrudEntityManager {
    domain = 'spring';
    entityName = 'Order';
    url = '/api/orders';
    schema = OrderSchema;
}

/**
 * Spring 商品管理器（只读）
 *
 * 基于 RemoteReadonlyEntityManager，只具备查询能力
 * 能力：list / getAll / get / query / prev / next / jump / filter / sort
 * 无 create / update / delete / toggle
 * 接口：GET /api/items
 */
export class SpringItemManager extends RemoteReadonlyEntityManager {
    domain = 'spring';
    entityName = 'Item';
    url = '/api/items';
    schema = ItemSchema;
}
