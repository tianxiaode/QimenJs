/**
 * Spring 域 EntityManager 定义
 *
 * 基于 RemoteCrudEntityManager，连接 Spring 后端
 */
import { RemoteCrudEntityManager } from '@orbitjs/entity';
import { FlatRemoteEntityState } from '@orbitjs/entity';
import { OrderSchema, ItemSchema } from '../domains';

/**
 * Spring 订单管理器
 *
 * 能力：list / getAll / get / query / create / update / delete / toggle
 * 接口：GET /api/orders
 */
export class SpringOrderManager extends RemoteCrudEntityManager {
    domain = 'spring';
    entityName = 'Order';
    url = '/api/orders';
    schema = OrderSchema;
    state!: FlatRemoteEntityState;

    constructor() {
        super();
        this.state = new FlatRemoteEntityState(this.compiledSchema, 300000);
    }
}

/**
 * Spring 商品管理器
 *
 * 能力：list / getAll / get / query / create / update / delete / toggle
 * 接口：GET /api/items
 */
export class SpringItemManager extends RemoteCrudEntityManager {
    domain = 'spring';
    entityName = 'Item';
    url = '/api/items';
    schema = ItemSchema;
    state!: FlatRemoteEntityState;

    constructor() {
        super();
        this.state = new FlatRemoteEntityState(this.compiledSchema, 300000);
    }
}
