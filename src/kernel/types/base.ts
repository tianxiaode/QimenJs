export type CRUD_ACTION =
    | 'list' // GET_LIST
    | 'all' // GET_ALL
    | 'detail' // GET_DETAIL
    | 'create' // CREATE
    | 'update' // UPDATE
    | 'delete' // DELETE
    | 'batchDelete' // BATCH_DELETE
    | 'toggle'; // TOGGLE

export type ENTITY_ACTION = CRUD_ACTION | string;

/**
 * 基础实体接口，所有业务 Model 的基石
 */
export interface IEntity {
  id?: string | number;
  [key: string]: any;
}

export interface FieldMapping {
  name: string;          // 前端使用的字段名
  source?: string;        // 后端原始字段名（如果不填，默认同 name）
  type: 'string' | 'number' | 'boolean' | 'date' | 'currency' | 'enum' | 'nested';
  format?: string;        // 格式化参数
  defaultValue?: any;
  mapping?: Record<any, any>; 
  // 甚至可以加上权限或者 UI 描述
  label?: string;
  readonly?: boolean;
}

export type EntitySchema = FieldMapping[];

