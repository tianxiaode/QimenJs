export class StorageManager {
  constructor(private adapter: Storage) {}

  get(key:string) {
    return this.adapter.get(key);
  }
}
