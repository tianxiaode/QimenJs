import { HtmlTemplateRegistrarName } from "../types";
import { RegistrarBase } from "./RegistrarBase";

export class HtmlTemplateRegistrar extends RegistrarBase<Map<string, string>> {
    public readonly name = HtmlTemplateRegistrarName; // 简洁的名称
    protected storage = new Map<string, string>();

    register(id: string, template: string): void {
        this.checkLock();
        this.storage.set(id, template);
    }

    unregister(id: string): void {
        this.checkLock();
        this.storage.delete(id);
    }

    get(id: string): string {
        return this.storage.get(id)!;
    }

    protected doInspect(): void {
        // 子类只需要这一行，外壳基类已经穿好了
        console.table(Object.fromEntries(this.storage));
    }
}