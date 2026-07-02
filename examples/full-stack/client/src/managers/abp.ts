/**
 * ABP 域 EntityManager 定义
 *
 * 基于 RemoteCrudEntityManager，连接 ABP 后端
 */
import { RemoteCrudEntityManager } from '@orbitjs/entity';
import { UserSchema, ProductSchema } from '../domains';

/**
 * ABP 用户管理器
 *
 * 能力：list / getAll / get / query / create / update / delete / toggle
 * 接口：GET/POST /api/app/user
 */
export class AbpUserManager extends RemoteCrudEntityManager {
    domain = 'abp';
    entityName = 'User';
    url = '/api/app/user';
    schema = UserSchema;
}

/**
 * ABP 产品管理器
 *
 * 能力：list / getAll / get / query / create / update / delete / toggle
 * 接口：GET /api/app/product
 */
export class AbpProductManager extends RemoteCrudEntityManager {
    domain = 'abp';
    entityName = 'Product';
    url = '/api/app/product';
    schema = ProductSchema;
}
