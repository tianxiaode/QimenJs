export type CRUD_ACTION =
    | 'list' // GET_LIST
    | 'all' // GET_ALL
    | 'detail' // GET_DETAIL
    | 'create' // CREATE
    | 'update' // UPDATE
    | 'delete' // DELETE
    | 'batchDelete' // BATCH_DELETE
    | 'toggle'; // TOGGLE

export type REPO_ACTION = CRUD_ACTION | 'common' | string;